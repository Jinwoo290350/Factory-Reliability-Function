"""
Migration script: SQLite -> PostgreSQL
ใช้สำหรับโยกข้อมูลจาก factory_reliability.db ไปยัง Neon PostgreSQL

วิธีใช้:
1. ตั้งค่า POSTGRES_URL ใน .env หรือใส่ตรงๆ ในสคริปต์
2. รัน: python3 migrate_sqlite_to_postgres.py

Requirements:
    pip install psycopg2-binary sqlalchemy
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLITE_URL = "sqlite:///./factory.db"
POSTGRES_URL = os.getenv("DATABASE_URL")  # Neon PostgreSQL URL

if not POSTGRES_URL:
    print("ERROR: ไม่พบ DATABASE_URL ใน .env")
    print("กรุณาเพิ่ม DATABASE_URL=postgresql://... ใน python-back/.env")
    sys.exit(1)

if not POSTGRES_URL.startswith("postgresql"):
    print("ERROR: DATABASE_URL ต้องเป็น PostgreSQL URL")
    sys.exit(1)

print("=== SQLite -> PostgreSQL Migration ===\n")

# Create engines
sqlite_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
pg_engine = create_engine(POSTGRES_URL, pool_pre_ping=True)

# Import models and create tables in PostgreSQL
from models.database import Base

print("1. สร้าง tables ใน PostgreSQL...")
Base.metadata.create_all(bind=pg_engine)
print("   ✓ Tables created\n")

# Sessions
SqliteSession = sessionmaker(bind=sqlite_engine)
PgSession = sessionmaker(bind=pg_engine)

sqlite_db = SqliteSession()
pg_db = PgSession()

TABLE_ORDER = [
    "users",
    "machines",
    "components",
    "failure_items",
    "failure_parameters",
    "csv_uploads",
    "reliability_results",
    "machine_positions",
    "machine_pictures",
]

print("2. โยกข้อมูลแต่ละตาราง...")

total_rows = 0
for table in TABLE_ORDER:
    try:
        rows = sqlite_db.execute(text(f"SELECT * FROM {table}")).fetchall()
        if not rows:
            print(f"   {table}: ไม่มีข้อมูล (ข้าม)")
            continue

        # Clear existing data in PostgreSQL (in reverse order to avoid FK constraint)
        pg_db.execute(text(f"DELETE FROM {table}"))
        pg_db.commit()

        # Get column names
        cols = sqlite_db.execute(text(f"PRAGMA table_info({table})")).fetchall()
        col_names = [col[1] for col in cols]

        for row in rows:
            row_dict = dict(zip(col_names, row))
            placeholders = ", ".join([f":{k}" for k in row_dict.keys()])
            col_str = ", ".join(row_dict.keys())
            pg_db.execute(
                text(f"INSERT INTO {table} ({col_str}) VALUES ({placeholders})"),
                row_dict
            )

        pg_db.commit()
        print(f"   ✓ {table}: {len(rows)} rows")
        total_rows += len(rows)

    except Exception as e:
        pg_db.rollback()
        print(f"   ✗ {table}: ERROR - {e}")

sqlite_db.close()
pg_db.close()

print(f"\n=== เสร็จสิ้น! โยกข้อมูลทั้งหมด {total_rows} rows ===")
print("ทดสอบ: เปลี่ยน DATABASE_URL ใน .env แล้วรัน python3 app.py")
