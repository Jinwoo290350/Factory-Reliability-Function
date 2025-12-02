from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.schemas import MachineCreate, MachineUpdate, MachineResponse
from models.database import Machine, User
from utils.database import get_db
from utils.auth import get_current_user

router = APIRouter(prefix="/machines", tags=["machines"])

@router.get("", response_model=List[MachineResponse])
def get_machines(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all machines for the current user.
    """
    machines = db.query(Machine).filter(Machine.user_id == current_user.id).order_by(Machine.sequence).all()
    return machines

@router.post("", response_model=MachineResponse, status_code=status.HTTP_201_CREATED)
def create_machine(
    machine_data: MachineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new machine.
    """
    # Get next sequence number
    max_machine = db.query(Machine).filter(Machine.user_id == current_user.id).order_by(Machine.sequence.desc()).first()
    next_sequence = (max_machine.sequence + 1) if max_machine and max_machine.sequence else 1

    machine = Machine(
        user_id=current_user.id,
        name=machine_data.name,
        description=machine_data.description,
        sequence=next_sequence
    )

    db.add(machine)
    db.commit()
    db.refresh(machine)

    return machine

@router.get("/{machine_id}", response_model=MachineResponse)
def get_machine(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific machine by ID.
    """
    machine = db.query(Machine).filter(
        Machine.id == machine_id,
        Machine.user_id == current_user.id
    ).first()

    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine not found"
        )

    return machine

@router.put("/{machine_id}", response_model=MachineResponse)
def update_machine(
    machine_id: str,
    machine_data: MachineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a machine.
    """
    machine = db.query(Machine).filter(
        Machine.id == machine_id,
        Machine.user_id == current_user.id
    ).first()

    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine not found"
        )

    # Update fields if provided
    if machine_data.name is not None:
        machine.name = machine_data.name
    if machine_data.description is not None:
        machine.description = machine_data.description

    db.commit()
    db.refresh(machine)

    return machine

@router.delete("/{machine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_machine(
    machine_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a machine.
    """
    machine = db.query(Machine).filter(
        Machine.id == machine_id,
        Machine.user_id == current_user.id
    ).first()

    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine not found"
        )

    db.delete(machine)
    db.commit()

    return None
