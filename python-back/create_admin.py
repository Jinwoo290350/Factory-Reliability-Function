#!/usr/bin/env python3
"""
Create admin user: rcmate / password
Run this script once to create the admin account.
"""

from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models.database import User
from utils.database import SessionLocal, init_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    # Initialize database first
    init_db()

    db = SessionLocal()

    try:
        # Check if admin already exists
        existing_user = db.query(User).filter(User.email == "admin@rcmate.com").first()

        if existing_user:
            print("⚠️  Admin user already exists!")
            print(f"   Email: admin@rcmate.com")
            print(f"   Username: {existing_user.username}")
            return

        # Create admin user
        # Hash the password properly for bcrypt (max 72 bytes)
        password = "password"
        hashed = pwd_context.hash(password)

        admin = User(
            email="admin@rcmate.com",
            password_hash=hashed,
            username="rcmate",
            company_name="RCMate Admin"
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("✓ Admin user created successfully!")
        print(f"   Email: admin@rcmate.com")
        print(f"   Username: rcmate")
        print(f"   Password: password")
        print(f"")
        print("You can now login with:")
        print("  - Email: admin@rcmate.com")
        print("  - Username: rcmate")
        print("  - Password: password")

    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
