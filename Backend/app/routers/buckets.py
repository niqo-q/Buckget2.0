"""
Buckets (Savings Goals) API routes.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Bucket
from ..schemas import BucketResponse, BucketCreate, BucketUpdate
from ..auth import get_current_active_user

router = APIRouter(prefix="/api/buckets", tags=["Buckets"])


@router.get("", response_model=List[BucketResponse])
async def list_buckets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List all buckets for the current user.
    """
    buckets = db.query(Bucket).filter(Bucket.user_id == current_user.id).all()
    return buckets


@router.get("/{bucket_id}", response_model=BucketResponse)
async def get_bucket(
    bucket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific bucket.
    """
    bucket = db.query(Bucket).filter(
        Bucket.id == bucket_id,
        Bucket.user_id == current_user.id
    ).first()
    
    if not bucket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bucket not found"
        )
    
    return bucket


@router.post("", response_model=BucketResponse, status_code=status.HTTP_201_CREATED)
async def create_bucket(
    bucket_data: BucketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new savings bucket.
    """
    bucket = Bucket(
        user_id=current_user.id,
        name=bucket_data.name,
        target=bucket_data.target,
        current=bucket_data.current,
        icon=bucket_data.icon,
        color=bucket_data.color,
    )
    
    db.add(bucket)
    db.commit()
    db.refresh(bucket)
    
    return bucket


@router.put("/{bucket_id}", response_model=BucketResponse)
async def update_bucket(
    bucket_id: str,
    bucket_data: BucketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a bucket.
    """
    bucket = db.query(Bucket).filter(
        Bucket.id == bucket_id,
        Bucket.user_id == current_user.id
    ).first()
    
    if not bucket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bucket not found"
        )
    
    # Update fields
    update_data = bucket_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(bucket, field, value)
    
    db.commit()
    db.refresh(bucket)
    
    return bucket


@router.delete("/{bucket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bucket(
    bucket_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a bucket.
    """
    bucket = db.query(Bucket).filter(
        Bucket.id == bucket_id,
        Bucket.user_id == current_user.id
    ).first()
    
    if not bucket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bucket not found"
        )
    
    db.delete(bucket)
    db.commit()
    
    return None


@router.post("/{bucket_id}/add-money", response_model=BucketResponse)
async def add_money_to_bucket(
    bucket_id: str,
    amount: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Add money to a bucket from available funds.
    """
    bucket = db.query(Bucket).filter(
        Bucket.id == bucket_id,
        Bucket.user_id == current_user.id
    ).first()
    
    if not bucket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bucket not found"
        )
    
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be positive"
        )
    
    if amount > current_user.current_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient available funds"
        )
    
    # Transfer funds
    bucket.current += amount
    current_user.current_available -= amount
    current_user.total_saved += amount
    
    db.commit()
    db.refresh(bucket)
    
    return bucket

