"""
Machine Pictures API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.database import MachinePicture, MachinePosition
from models.schemas import MachinePictureCreate, MachinePictureUpdate, MachinePictureResponse
from utils.database import get_db
from utils.auth import get_current_user, User

router = APIRouter(prefix="/machine-pictures", tags=["Machine Pictures"])


@router.get("", response_model=List[MachinePictureResponse])
def get_machine_pictures(
    machine_position_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all machine pictures for the current user, optionally filtered by position"""
    query = db.query(MachinePicture).filter(MachinePicture.user_id == current_user.id)

    if machine_position_id:
        query = query.filter(MachinePicture.machine_position_id == machine_position_id)

    return query.all()


@router.get("/{picture_id}", response_model=MachinePictureResponse)
def get_machine_picture(
    picture_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific machine picture by ID"""
    picture = db.query(MachinePicture).filter(
        MachinePicture.id == picture_id,
        MachinePicture.user_id == current_user.id
    ).first()

    if not picture:
        raise HTTPException(status_code=404, detail="Machine picture not found")

    return picture


@router.post("", response_model=MachinePictureResponse, status_code=status.HTTP_201_CREATED)
def create_machine_picture(
    picture: MachinePictureCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new machine picture"""
    # Verify machine position exists and belongs to user
    position = db.query(MachinePosition).filter(
        MachinePosition.id == picture.machine_position_id,
        MachinePosition.user_id == current_user.id
    ).first()

    if not position:
        raise HTTPException(status_code=404, detail="Machine position not found")

    db_picture = MachinePicture(
        user_id=current_user.id,
        machine_position_id=picture.machine_position_id,
        direction=picture.direction,
        picture_url=picture.picture_url
    )

    db.add(db_picture)
    db.commit()
    db.refresh(db_picture)

    return db_picture


@router.put("/{picture_id}", response_model=MachinePictureResponse)
def update_machine_picture(
    picture_id: str,
    picture_update: MachinePictureUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a machine picture"""
    db_picture = db.query(MachinePicture).filter(
        MachinePicture.id == picture_id,
        MachinePicture.user_id == current_user.id
    ).first()

    if not db_picture:
        raise HTTPException(status_code=404, detail="Machine picture not found")

    # Update fields if provided
    if picture_update.direction is not None:
        db_picture.direction = picture_update.direction
    if picture_update.picture_url is not None:
        db_picture.picture_url = picture_update.picture_url

    db.commit()
    db.refresh(db_picture)

    return db_picture


@router.delete("/{picture_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_machine_picture(
    picture_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a machine picture"""
    db_picture = db.query(MachinePicture).filter(
        MachinePicture.id == picture_id,
        MachinePicture.user_id == current_user.id
    ).first()

    if not db_picture:
        raise HTTPException(status_code=404, detail="Machine picture not found")

    db.delete(db_picture)
    db.commit()
