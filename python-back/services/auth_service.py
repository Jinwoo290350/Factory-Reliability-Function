from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models.database import User
from models.schemas import UserRegister
from utils.auth import create_access_token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)

def create_user(db: Session, user_data: UserRegister) -> User:
    """Create a new user."""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise ValueError("User with this email already exists")

    # Hash password
    hashed_password = hash_password(user_data.password)

    # Create user
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        username=user_data.username,
        company_name=user_data.company_name
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def authenticate_user(db: Session, email: str, password: str) -> User:
    """Authenticate a user and return user if valid."""
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user

def generate_token_for_user(user: User) -> str:
    """Generate JWT token for user."""
    token_data = {
        "user_id": user.id,
        "email": user.email,
        "username": user.username
    }
    access_token = create_access_token(data=token_data)
    return access_token
