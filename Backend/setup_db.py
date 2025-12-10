"""
Database setup script - Creates tables and inserts initial data.
Run this once to set up the database.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from passlib.context import CryptContext
from sqlalchemy import text
from app.database import engine, Base
from app.models import User, Bucket, Transaction, Role, UserSettings, AIConversation, TransactionType
from sqlalchemy.orm import Session
import uuid

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def setup_database():
    """Set up the database with tables and initial data."""
    
    print("🚀 Setting up BuckGet database...")
    
    # Create all tables
    print("📦 Creating tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("   ✅ Tables created successfully!")
    except Exception as e:
        print(f"   ❌ Error creating tables: {e}")
        return False
    
    # Create session
    with Session(engine) as db:
        try:
            # Check if data already exists
            existing_user = db.query(User).filter(User.email == "ahmad@buckget.com").first()
            if existing_user:
                print("   ℹ️  User ahmad@buckget.com already exists!")
                print(f"   📧 Email: {existing_user.email}")
                print(f"   👤 Name: {existing_user.full_name}")
                return True
            
            # Create roles
            print("👥 Creating roles...")
            roles = [
                Role(id="role-admin-001", name="admin", permissions=["all"]),
                Role(id="role-user-001", name="user", permissions=["read", "write"]),
                Role(id="role-viewer-001", name="viewer", permissions=["read"]),
            ]
            for role in roles:
                existing = db.query(Role).filter(Role.id == role.id).first()
                if not existing:
                    db.add(role)
            db.commit()
            print("   ✅ Roles created!")
            
            # Create admin user
            print("👤 Creating admin user: ahmad@buckget.com...")
            password_hash = pwd_context.hash("123456")
            
            user = User(
                id="user-ahmad-001",
                email="ahmad@buckget.com",
                password_hash=password_hash,
                full_name="Ahmad",
                ic_number="990101-14-5678",
                phone="+60123456789",
                hourly_rate=25.00,
                current_available=84.00,
                total_saved=1250.00,
                role_id="role-admin-001",
                is_active=True
            )
            db.add(user)
            db.commit()
            print("   ✅ User created!")
            print(f"   📧 Email: ahmad@buckget.com")
            print(f"   🔐 Password: 123456")
            
            # Create user settings
            print("⚙️  Creating user settings...")
            settings = UserSettings(
                id="settings-ahmad-001",
                user_id="user-ahmad-001",
                notifications_enabled=True,
                theme="dark",
                language="en",
                tier="steady",
                save_percentage=30.0
            )
            db.add(settings)
            db.commit()
            print("   ✅ Settings created!")
            
            # Create buckets
            print("🪣 Creating savings buckets...")
            buckets_data = [
                {"id": "bucket-001", "name": "Emergency Fund", "target": 5000.00, "current": 450.00, "icon": "Shield", "color": "bg-[#FF44EC]"},
                {"id": "bucket-002", "name": "Vacation", "target": 3000.00, "current": 820.00, "icon": "Plane", "color": "bg-white/10"},
                {"id": "bucket-003", "name": "New Phone", "target": 2500.00, "current": 1200.00, "icon": "Smartphone", "color": "bg-white/10"},
                {"id": "bucket-004", "name": "Gaming Setup", "target": 4000.00, "current": 650.00, "icon": "Gamepad2", "color": "bg-[#FF44EC]"},
                {"id": "bucket-005", "name": "House Deposit", "target": 20000.00, "current": 3400.00, "icon": "Home", "color": "bg-white/10"},
                {"id": "bucket-006", "name": "Education", "target": 6000.00, "current": 2100.00, "icon": "BookOpen", "color": "bg-white/10"},
            ]
            
            for b in buckets_data:
                bucket = Bucket(
                    id=b["id"],
                    user_id="user-ahmad-001",
                    name=b["name"],
                    target=b["target"],
                    current=b["current"],
                    icon=b["icon"],
                    color=b["color"]
                )
                db.add(bucket)
            db.commit()
            print(f"   ✅ {len(buckets_data)} buckets created!")
            
            # Create transactions
            print("💳 Creating sample transactions...")
            from datetime import datetime, timedelta
            
            transactions_data = [
                {"id": "txn-001", "type": TransactionType.UNLOCK, "amount": 50.00, "description": "Wage unlock", "bucket_id": None, "days_ago": 5},
                {"id": "txn-002", "type": TransactionType.STASH, "amount": 30.00, "description": "Auto save to Emergency", "bucket_id": "bucket-001", "days_ago": 4},
                {"id": "txn-003", "type": TransactionType.STASH, "amount": 50.00, "description": "Save to Vacation", "bucket_id": "bucket-002", "days_ago": 3},
                {"id": "txn-004", "type": TransactionType.UNLOCK, "amount": 75.00, "description": "Weekly wage", "bucket_id": None, "days_ago": 2},
                {"id": "txn-005", "type": TransactionType.STASH, "amount": 100.00, "description": "Bonus to House Deposit", "bucket_id": "bucket-005", "days_ago": 1},
            ]
            
            for t in transactions_data:
                transaction = Transaction(
                    id=t["id"],
                    user_id="user-ahmad-001",
                    type=t["type"],
                    amount=t["amount"],
                    description=t["description"],
                    bucket_id=t["bucket_id"]
                )
                db.add(transaction)
            db.commit()
            print(f"   ✅ {len(transactions_data)} transactions created!")
            
            print("\n" + "="*50)
            print("🎉 DATABASE SETUP COMPLETE!")
            print("="*50)
            print("\n📧 Login credentials:")
            print("   Email:    ahmad@buckget.com")
            print("   Password: 123456")
            print("\n💰 Account details:")
            print("   Available: $84.00")
            print("   Saved:     $1,250.00")
            print("   Buckets:   6 savings goals")
            print("\n🚀 You can now login at http://localhost:5173")
            print("="*50)
            
            return True
            
        except Exception as e:
            print(f"❌ Error setting up data: {e}")
            db.rollback()
            return False


if __name__ == "__main__":
    setup_database()

