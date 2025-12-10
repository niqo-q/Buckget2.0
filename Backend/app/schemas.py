"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============== Auth Schemas ==============

class Token(BaseModel):
    """JWT Token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data."""
    user_id: Optional[str] = None
    email: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request body."""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Registration request body."""
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    ic_number: Optional[str] = None
    phone: Optional[str] = None
    hourly_rate: float = Field(default=0.0, ge=0)


# ============== User Schemas ==============

class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str
    ic_number: Optional[str] = None
    phone: Optional[str] = None
    hourly_rate: float = 0.0


class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str = Field(..., min_length=6)
    role_id: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    full_name: Optional[str] = None
    ic_number: Optional[str] = None
    phone: Optional[str] = None
    hourly_rate: Optional[float] = None
    is_active: Optional[bool] = None
    role_id: Optional[str] = None


class UserResponse(UserBase):
    """User response schema."""
    id: str
    current_available: float
    total_saved: float
    is_active: bool
    role_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserWithWallet(UserResponse):
    """User with wallet information."""
    buckets_count: int = 0
    transactions_count: int = 0


# ============== Bucket Schemas ==============

class BucketBase(BaseModel):
    """Base bucket schema."""
    name: str = Field(..., min_length=1, max_length=255)
    target: float = Field(..., gt=0)
    icon: str = "DollarSign"
    color: str = "bg-[#FF44EC]"


class BucketCreate(BucketBase):
    """Schema for creating a bucket."""
    current: float = Field(default=0.0, ge=0)


class BucketUpdate(BaseModel):
    """Schema for updating a bucket."""
    name: Optional[str] = None
    target: Optional[float] = None
    current: Optional[float] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class BucketResponse(BucketBase):
    """Bucket response schema."""
    id: str
    user_id: str
    current: float
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============== Transaction Schemas ==============

class TransactionTypeEnum(str, Enum):
    """Transaction type enum."""
    UNLOCK = "unlock"
    STASH = "stash"
    TRANSFER = "transfer"


class TransactionBase(BaseModel):
    """Base transaction schema."""
    type: TransactionTypeEnum
    amount: float = Field(..., gt=0)
    description: Optional[str] = None


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    bucket_id: Optional[str] = None


class TransactionResponse(TransactionBase):
    """Transaction response schema."""
    id: str
    user_id: str
    bucket_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============== Role Schemas ==============

class RoleBase(BaseModel):
    """Base role schema."""
    name: str = Field(..., min_length=1, max_length=100)
    permissions: List[str] = []


class RoleCreate(RoleBase):
    """Schema for creating a role."""
    pass


class RoleUpdate(BaseModel):
    """Schema for updating a role."""
    name: Optional[str] = None
    permissions: Optional[List[str]] = None


class RoleResponse(RoleBase):
    """Role response schema."""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============== Settings Schemas ==============

class SettingsBase(BaseModel):
    """Base settings schema."""
    notifications_enabled: bool = True
    theme: str = "light"
    language: str = "en"
    tier: str = "basic"
    save_percentage: float = 10.0


class SettingsUpdate(BaseModel):
    """Schema for updating settings."""
    notifications_enabled: Optional[bool] = None
    theme: Optional[str] = None
    language: Optional[str] = None
    tier: Optional[str] = None
    save_percentage: Optional[float] = None


class SettingsResponse(SettingsBase):
    """Settings response schema."""
    id: str
    user_id: str
    
    class Config:
        from_attributes = True


# ============== AI Agent Schemas ==============

class AIQueryRequest(BaseModel):
    """AI Agent query request."""
    message: str = Field(..., min_length=1)


class AIQueryResponse(BaseModel):
    """AI Agent query response."""
    reply: str
    action: Optional[dict] = None  # Optional action for frontend to execute


# ============== Wallet Schemas ==============

class WalletUpdate(BaseModel):
    """Schema for updating wallet."""
    current_available: Optional[float] = None
    total_saved: Optional[float] = None


class SplitFundsRequest(BaseModel):
    """Request to split funds between get and save."""
    get_amount: float = Field(..., ge=0)
    save_amount: float = Field(..., ge=0)
    bucket_id: Optional[str] = None  # Target bucket for savings


# ============== Pagination ==============

class PaginatedResponse(BaseModel):
    """Generic paginated response."""
    items: List
    total: int
    page: int
    size: int
    pages: int

