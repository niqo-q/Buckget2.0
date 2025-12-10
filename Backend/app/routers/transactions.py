"""
Transactions API routes.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models import User, Transaction, Bucket, TransactionType
from ..schemas import TransactionResponse, TransactionCreate, SplitFundsRequest
from ..auth import get_current_active_user

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("", response_model=List[TransactionResponse])
async def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List all transactions for the current user.
    """
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if type:
        query = query.filter(Transaction.type == type)
    
    transactions = query.order_by(desc(Transaction.created_at)).offset(skip).limit(limit).all()
    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific transaction.
    """
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new transaction.
    """
    # Validate bucket if provided
    bucket = None
    if transaction_data.bucket_id:
        bucket = db.query(Bucket).filter(
            Bucket.id == transaction_data.bucket_id,
            Bucket.user_id == current_user.id
        ).first()
        
        if not bucket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bucket not found"
            )
    
    transaction = Transaction(
        user_id=current_user.id,
        type=TransactionType(transaction_data.type.value),
        amount=transaction_data.amount,
        description=transaction_data.description,
        bucket_id=transaction_data.bucket_id,
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return transaction


@router.post("/split", response_model=dict)
async def split_funds(
    split_data: SplitFundsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Split available wages between 'get' (unlock) and 'save' (stash).
    This is the main "Buck Up" functionality.
    """
    total = split_data.get_amount + split_data.save_amount
    
    if total > current_user.current_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total amount exceeds available funds"
        )
    
    # Get target bucket
    bucket = None
    if split_data.bucket_id:
        bucket = db.query(Bucket).filter(
            Bucket.id == split_data.bucket_id,
            Bucket.user_id == current_user.id
        ).first()
        
        if not bucket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bucket not found"
            )
    elif split_data.save_amount > 0:
        # Use first bucket if no bucket specified
        bucket = db.query(Bucket).filter(
            Bucket.user_id == current_user.id
        ).first()
    
    transactions = []
    
    # Create unlock transaction (get amount)
    if split_data.get_amount > 0:
        unlock_tx = Transaction(
            user_id=current_user.id,
            type=TransactionType.UNLOCK,
            amount=split_data.get_amount,
            description="Wage unlock",
        )
        db.add(unlock_tx)
        transactions.append(unlock_tx)
    
    # Create stash transaction (save amount)
    if split_data.save_amount > 0:
        stash_tx = Transaction(
            user_id=current_user.id,
            type=TransactionType.STASH,
            amount=split_data.save_amount,
            description="Auto save",
            bucket_id=bucket.id if bucket else None,
        )
        db.add(stash_tx)
        transactions.append(stash_tx)
        
        # Update bucket
        if bucket:
            bucket.current += split_data.save_amount
        
        # Update user totals
        current_user.total_saved += split_data.save_amount
    
    # Deduct from available
    current_user.current_available -= total
    
    db.commit()
    
    return {
        "success": True,
        "get_amount": split_data.get_amount,
        "save_amount": split_data.save_amount,
        "new_available": current_user.current_available,
        "new_total_saved": current_user.total_saved,
        "transactions_created": len(transactions)
    }


@router.post("/add-wages", response_model=dict)
async def add_wages(
    hours: float = Query(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Add wages based on hours worked.
    Simulates wage earning for demo purposes.
    """
    amount = hours * current_user.hourly_rate
    current_user.current_available += amount
    
    db.commit()
    
    return {
        "success": True,
        "hours_worked": hours,
        "hourly_rate": current_user.hourly_rate,
        "amount_added": amount,
        "new_available": current_user.current_available
    }

