"""
Migration: Add manual_hours column to components table
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from utils.database import engine

def upgrade():
    """Add manual_hours JSON column to components table"""
    with engine.connect() as conn:
        # Check if column exists first
        check_column = text("""
            SELECT COUNT(*) as count
            FROM pragma_table_info('components')
            WHERE name = 'manual_hours'
        """)
        result = conn.execute(check_column).fetchone()

        if result[0] == 0:
            # Add manual_hours column as JSON (TEXT in SQLite)
            alter_table = text("""
                ALTER TABLE components
                ADD COLUMN manual_hours TEXT
            """)
            conn.execute(alter_table)
            conn.commit()
            print("✓ Added manual_hours column to components table")
        else:
            print("✓ manual_hours column already exists")

def downgrade():
    """Remove manual_hours column from components table"""
    # SQLite doesn't support DROP COLUMN easily
    # We would need to recreate the table without the column
    print("! Downgrade not implemented for SQLite")
    print("! To remove manual_hours, recreate the table without this column")

if __name__ == "__main__":
    print("Running migration: add_manual_hours")
    upgrade()
    print("Migration complete")
