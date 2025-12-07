"""
Simple script to create a new user
Usage: python3 create_user.py
"""
import sys
import os
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.database import engine
from models.database import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user():
    """Create a new user interactively"""
    print("=== Create New User ===")

    # Get user input
    username = input("Enter username: ").strip()
    email = input("Enter email: ").strip()
    password = input("Enter password: ").strip()
    company_name = input("Enter company name (optional): ").strip() or None

    if not username or not email or not password:
        print("❌ Username, email, and password are required!")
        return

    # Hash password
    hashed_password = pwd_context.hash(password)

    # Create user in database
    with Session(engine) as session:
        # Check if user already exists
        existing = session.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()

        if existing:
            print(f"❌ User already exists! (username: {existing.username}, email: {existing.email})")
            return

        # Create new user
        new_user = User(
            username=username,
            email=email,
            password_hash=hashed_password,
            company_name=company_name
        )

        session.add(new_user)
        session.commit()

        print(f"\n✅ User created successfully!")
        print(f"   ID: {new_user.id}")
        print(f"   Username: {new_user.username}")
        print(f"   Email: {new_user.email}")
        print(f"   Company: {new_user.company_name or 'N/A'}")

def list_users():
    """List all users"""
    print("\n=== All Users ===")
    with Session(engine) as session:
        users = session.query(User).all()

        if not users:
            print("No users found.")
            return

        for user in users:
            print(f"\n- ID: {user.id}")
            print(f"  Username: {user.username}")
            print(f"  Email: {user.email}")
            print(f"  Company: {user.company_name or 'N/A'}")
            print(f"  Created: {user.created_at}")

if __name__ == "__main__":
    print("\n" + "="*50)
    print("User Management Tool")
    print("="*50)

    while True:
        print("\nOptions:")
        print("1. Create new user")
        print("2. List all users")
        print("3. Exit")

        choice = input("\nEnter choice (1-3): ").strip()

        if choice == "1":
            create_user()
        elif choice == "2":
            list_users()
        elif choice == "3":
            print("Goodbye!")
            break
        else:
            print("Invalid choice!")
