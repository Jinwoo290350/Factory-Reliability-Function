"""
Database migration script to add new tables and columns
"""
from sqlalchemy import create_engine, text
from models.database import Base
from utils.database import DATABASE_URL
import sys

def migrate_database():
    """Run database migration"""
    try:
        connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
        engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=True)

        print("Creating new tables...")
        Base.metadata.create_all(bind=engine)

        # Add component_id column if it doesn't exist
        with engine.connect() as conn:
            try:
                # Check if column exists
                result = conn.execute(text("PRAGMA table_info(components)"))
                columns = [row[1] for row in result]

                if 'component_id' not in columns:
                    print("Adding component_id column to components table...")
                    conn.execute(text("ALTER TABLE components ADD COLUMN component_id VARCHAR(100)"))
                    conn.commit()
                    print("✓ Added component_id column")
                else:
                    print("✓ component_id column already exists")

            except Exception as e:
                print(f"Note: {e}")

        print("\n✓ Database migration completed successfully!")
        return True

    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = migrate_database()
    sys.exit(0 if success else 1)
