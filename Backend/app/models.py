"""
SQLAlchemy ORM models for TiDB database.
"""
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Enum, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from .database import Base


def generate_uuid():
    """Generate a UUID string for primary keys."""
    return str(uuid.uuid4())


class TransactionType(str, enum.Enum):
    """Transaction types enum."""
    UNLOCK = "unlock"
    STASH = "stash"
    TRANSFER = "transfer"


class User(Base):
    """User model - stores user account information."""
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    ic_number = Column(String(20), nullable=True)
    phone = Column(String(20), nullable=True)
    hourly_rate = Column(Float, default=0.0)
    current_available = Column(Float, default=0.0)
    total_saved = Column(Float, default=0.0)
    role_id = Column(String(36), ForeignKey("roles.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    buckets = relationship("Bucket", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    role = relationship("Role", back_populates="users")


class Bucket(Base):
    """Bucket model - savings goals/buckets."""
    __tablename__ = "buckets"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    target = Column(Float, nullable=False)
    current = Column(Float, default=0.0)
    icon = Column(String(50), default="DollarSign")
    color = Column(String(50), default="bg-[#FF44EC]")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="buckets")
    transactions = relationship("Transaction", back_populates="bucket")


class Transaction(Base):
    """Transaction model - records all financial transactions."""
    __tablename__ = "transactions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    bucket_id = Column(String(36), ForeignKey("buckets.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    bucket = relationship("Bucket", back_populates="transactions")


class Role(Base):
    """Role model - for RBAC (Role-Based Access Control)."""
    __tablename__ = "roles"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False, unique=True)
    permissions = Column(JSON, default=list)  # List of permission strings
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    users = relationship("User", back_populates="role")


class UserSettings(Base):
    """UserSettings model - user preferences."""
    __tablename__ = "user_settings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    notifications_enabled = Column(Boolean, default=True)
    theme = Column(String(20), default="light")
    language = Column(String(10), default="en")
    tier = Column(String(50), default="basic")  # basic, steady, power
    save_percentage = Column(Float, default=10.0)  # Default auto-save percentage
    
    # Relationships
    user = relationship("User", back_populates="settings")


class AIConversation(Base):
    """AIConversation model - stores AI chat history."""
    __tablename__ = "ai_conversations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

