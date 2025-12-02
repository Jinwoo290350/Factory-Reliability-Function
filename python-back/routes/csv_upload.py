from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil
from datetime import datetime

from models.schemas import CSVUploadResponse
from models.database import CsvUpload, User
from services.csv_processor import process_csv_file
from utils.database import get_db
from utils.auth import get_current_user
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/csv", tags=["csv_upload"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 10485760))  # 10MB default

@router.post("/upload", response_model=CSVUploadResponse)
async def upload_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and process CSV file.

    Expected CSV format (NEW - without Machine column):
    ```
    Component,SupComponent,Failure mode,Failure hours
    Motor,Bearing,Wear,8760
    Motor,Winding,Overheating,4380
    Compressors,Impeller,Fatigue,5000
    ```

    Note: Components will be created as "Unassigned" and must be assigned to machines via editing.

    Returns upload status and processing results.
    """
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV files are allowed"
        )

    # Create user upload directory
    user_upload_dir = os.path.join(UPLOAD_DIR, current_user.id)
    os.makedirs(user_upload_dir, exist_ok=True)

    # Generate unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    safe_filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(user_upload_dir, safe_filename)

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_size = os.path.getsize(file_path)

        # Check file size
        if file_size > MAX_UPLOAD_SIZE:
            os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum allowed size of {MAX_UPLOAD_SIZE} bytes"
            )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    # Create CSV upload record
    csv_upload = CsvUpload(
        user_id=current_user.id,
        filename=file.filename,
        file_size=file_size,
        status="processing"
    )
    db.add(csv_upload)
    db.commit()
    db.refresh(csv_upload)

    # Process CSV file
    try:
        result = process_csv_file(file_path, current_user, db, csv_upload.id)

        # Refresh to get updated status
        db.refresh(csv_upload)

        return csv_upload

    except Exception as e:
        # Error handling is done in process_csv_file
        db.refresh(csv_upload)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process CSV: {str(e)}"
        )
