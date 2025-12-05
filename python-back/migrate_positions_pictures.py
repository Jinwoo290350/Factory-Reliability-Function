"""
Migration script to add machine_positions and machine_pictures tables
"""
from sqlalchemy import create_engine
from models.database import Base, MachinePosition, MachinePicture
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./factory.db")

def run_migration():
    print("Starting migration for machine_positions and machine_pictures tables...")

    # Create engine
    engine = create_engine(DATABASE_URL, echo=True)

    # Create only the new tables
    print("\nCreating machine_positions and machine_pictures tables...")
    MachinePosition.__table__.create(engine, checkfirst=True)
    MachinePicture.__table__.create(engine, checkfirst=True)

    print("\n✅ Migration completed successfully!")
    print("New tables created:")
    print("  - machine_positions")
    print("  - machine_pictures")

if __name__ == "__main__":
    run_migration()
