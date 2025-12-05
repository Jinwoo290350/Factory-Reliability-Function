"""
Machine Positions API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.database import MachinePosition, FailureItem
from models.schemas import MachinePositionCreate, MachinePositionUpdate, MachinePositionResponse
from utils.database import get_db
from utils.auth import get_current_user, User

router = APIRouter(prefix="/machine-positions", tags=["Machine Positions"])


@router.get("", response_model=List[MachinePositionResponse])
def get_machine_positions(
    failure_item_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all machine positions for the current user, optionally filtered by failure item"""
    query = db.query(MachinePosition).filter(MachinePosition.user_id == current_user.id)

    if failure_item_id:
        query = query.filter(MachinePosition.failure_item_id == failure_item_id)

    return query.all()


@router.get("/{position_id}", response_model=MachinePositionResponse)
def get_machine_position(
    position_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific machine position by ID"""
    position = db.query(MachinePosition).filter(
        MachinePosition.id == position_id,
        MachinePosition.user_id == current_user.id
    ).first()

    if not position:
        raise HTTPException(status_code=404, detail="Machine position not found")

    return position


@router.post("", response_model=MachinePositionResponse, status_code=status.HTTP_201_CREATED)
def create_machine_position(
    position: MachinePositionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new machine position"""
    # Verify failure item exists and belongs to user
    failure_item = db.query(FailureItem).filter(
        FailureItem.id == position.failure_item_id,
        FailureItem.user_id == current_user.id
    ).first()

    if not failure_item:
        raise HTTPException(status_code=404, detail="Failure item not found")

    db_position = MachinePosition(
        user_id=current_user.id,
        failure_item_id=position.failure_item_id,
        position_name=position.position_name,
        description=position.description
    )

    db.add(db_position)
    db.commit()
    db.refresh(db_position)

    return db_position


@router.put("/{position_id}", response_model=MachinePositionResponse)
def update_machine_position(
    position_id: str,
    position_update: MachinePositionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a machine position"""
    db_position = db.query(MachinePosition).filter(
        MachinePosition.id == position_id,
        MachinePosition.user_id == current_user.id
    ).first()

    if not db_position:
        raise HTTPException(status_code=404, detail="Machine position not found")

    # Update fields if provided
    if position_update.position_name is not None:
        db_position.position_name = position_update.position_name
    if position_update.description is not None:
        db_position.description = position_update.description

    db.commit()
    db.refresh(db_position)

    return db_position


@router.delete("/{position_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_machine_position(
    position_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a machine position"""
    db_position = db.query(MachinePosition).filter(
        MachinePosition.id == position_id,
        MachinePosition.user_id == current_user.id
    ).first()

    if not db_position:
        raise HTTPException(status_code=404, detail="Machine position not found")

    db.delete(db_position)
    db.commit()
