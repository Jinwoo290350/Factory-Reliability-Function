"""
Script to clear all components from database
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from models.database import Component, FailureItem, FailureParameter
from utils.database import DATABASE_URL

def clear_components():
    """Clear all components and related data from database"""
    try:
        connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
        engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=True)

        with Session(engine) as session:
            # Delete all failure parameters
            deleted_params = session.query(FailureParameter).delete()
            print(f"✓ Deleted {deleted_params} failure parameters")

            # Delete all failure items
            deleted_items = session.query(FailureItem).delete()
            print(f"✓ Deleted {deleted_items} failure items")

            # Delete all components
            deleted_components = session.query(Component).delete()
            print(f"✓ Deleted {deleted_components} components")

            session.commit()
            print("\n✅ Database cleared successfully!")

    except Exception as e:
        print(f"❌ Error clearing database: {e}")
        raise

if __name__ == "__main__":
    print("🗑️  Clearing all components from database...")
    clear_components()
