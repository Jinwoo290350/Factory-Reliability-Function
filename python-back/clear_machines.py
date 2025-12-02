"""
Script to clear all machines from database
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from models.database import Machine
from utils.database import DATABASE_URL

def clear_machines():
    """Clear all machines from database"""
    try:
        connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
        engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=True)

        with Session(engine) as session:
            # Delete all machines
            deleted_machines = session.query(Machine).delete()
            print(f"✓ Deleted {deleted_machines} machines")

            session.commit()
            print("\n✅ All machines cleared successfully!")

    except Exception as e:
        print(f"❌ Error clearing machines: {e}")
        raise

if __name__ == "__main__":
    print("🗑️  Clearing all machines from database...")
    clear_machines()
