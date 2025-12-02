"""
Failure Items API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from models.database import FailureItem, FailureParameter, Component
from utils.database import get_db
from utils.auth import get_current_user, User

router = APIRouter(prefix="/failure-items", tags=["Failure Items"])


# Pydantic schemas
from pydantic import BaseModel

class FailureItemCreate(BaseModel):
    component_id: str
    failure_item_id: str
    failure_item_name: str
    description: str | None = None

class FailureItemUpdate(BaseModel):
    failure_item_id: str | None = None
    failure_item_name: str | None = None
    description: str | None = None

class FailureItemResponse(BaseModel):
    id: str
    component_id: str
    failure_item_id: str
    failure_item_name: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FailureParameterCreate(BaseModel):
    failure_item_id: str
    parameter_type: str
    parameter_value: float | None = None
    parameter_text: str | None = None

class FailureParameterUpdate(BaseModel):
    parameter_type: str | None = None
    parameter_value: float | None = None
    parameter_text: str | None = None

class FailureParameterResponse(BaseModel):
    id: str
    failure_item_id: str
    parameter_type: str
    parameter_value: float | None
    parameter_text: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# Failure Items Endpoints
@router.get("", response_model=List[FailureItemResponse])
def get_failure_items(
    component_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all failure items for the current user, optionally filtered by component"""
    query = db.query(FailureItem).filter(FailureItem.user_id == current_user.id)

    if component_id:
        query = query.filter(FailureItem.component_id == component_id)

    return query.all()


@router.get("/{failure_item_id}", response_model=FailureItemResponse)
def get_failure_item(
    failure_item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific failure item by ID"""
    failure_item = db.query(FailureItem).filter(
        FailureItem.id == failure_item_id,
        FailureItem.user_id == current_user.id
    ).first()

    if not failure_item:
        raise HTTPException(status_code=404, detail="Failure item not found")

    return failure_item


@router.post("", response_model=FailureItemResponse, status_code=status.HTTP_201_CREATED)
def create_failure_item(
    failure_item: FailureItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new failure item"""
    # Verify component exists and belongs to user
    component = db.query(Component).filter(
        Component.id == failure_item.component_id,
        Component.user_id == current_user.id
    ).first()

    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    db_failure_item = FailureItem(
        user_id=current_user.id,
        component_id=failure_item.component_id,
        failure_item_id=failure_item.failure_item_id,
        failure_item_name=failure_item.failure_item_name,
        description=failure_item.description
    )

    db.add(db_failure_item)
    db.commit()
    db.refresh(db_failure_item)

    return db_failure_item


@router.put("/{failure_item_id}", response_model=FailureItemResponse)
def update_failure_item(
    failure_item_id: str,
    failure_item_update: FailureItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a failure item"""
    db_failure_item = db.query(FailureItem).filter(
        FailureItem.id == failure_item_id,
        FailureItem.user_id == current_user.id
    ).first()

    if not db_failure_item:
        raise HTTPException(status_code=404, detail="Failure item not found")

    # Update fields if provided
    if failure_item_update.failure_item_id is not None:
        db_failure_item.failure_item_id = failure_item_update.failure_item_id
    if failure_item_update.failure_item_name is not None:
        db_failure_item.failure_item_name = failure_item_update.failure_item_name
    if failure_item_update.description is not None:
        db_failure_item.description = failure_item_update.description

    db.commit()
    db.refresh(db_failure_item)

    return db_failure_item


@router.delete("/{failure_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_failure_item(
    failure_item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a failure item"""
    db_failure_item = db.query(FailureItem).filter(
        FailureItem.id == failure_item_id,
        FailureItem.user_id == current_user.id
    ).first()

    if not db_failure_item:
        raise HTTPException(status_code=404, detail="Failure item not found")

    db.delete(db_failure_item)
    db.commit()


# Failure Parameters Endpoints
@router.get("/{failure_item_id}/parameters", response_model=List[FailureParameterResponse])
def get_failure_parameters(
    failure_item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all parameters for a failure item"""
    # Verify failure item exists and belongs to user
    failure_item = db.query(FailureItem).filter(
        FailureItem.id == failure_item_id,
        FailureItem.user_id == current_user.id
    ).first()

    if not failure_item:
        raise HTTPException(status_code=404, detail="Failure item not found")

    return db.query(FailureParameter).filter(
        FailureParameter.failure_item_id == failure_item_id
    ).all()


@router.post("/{failure_item_id}/parameters", response_model=FailureParameterResponse, status_code=status.HTTP_201_CREATED)
def create_failure_parameter(
    failure_item_id: str,
    parameter: FailureParameterCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new parameter for a failure item"""
    # Verify failure item exists and belongs to user
    failure_item = db.query(FailureItem).filter(
        FailureItem.id == failure_item_id,
        FailureItem.user_id == current_user.id
    ).first()

    if not failure_item:
        raise HTTPException(status_code=404, detail="Failure item not found")

    db_parameter = FailureParameter(
        user_id=current_user.id,
        failure_item_id=failure_item_id,
        parameter_type=parameter.parameter_type,
        parameter_value=parameter.parameter_value,
        parameter_text=parameter.parameter_text
    )

    db.add(db_parameter)
    db.commit()
    db.refresh(db_parameter)

    return db_parameter


@router.delete("/{failure_item_id}/parameters/{parameter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_failure_parameter(
    failure_item_id: str,
    parameter_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a failure parameter"""
    # Verify failure item exists and belongs to user
    failure_item = db.query(FailureItem).filter(
        FailureItem.id == failure_item_id,
        FailureItem.user_id == current_user.id
    ).first()

    if not failure_item:
        raise HTTPException(status_code=404, detail="Failure item not found")

    db_parameter = db.query(FailureParameter).filter(
        FailureParameter.id == parameter_id,
        FailureParameter.failure_item_id == failure_item_id
    ).first()

    if not db_parameter:
        raise HTTPException(status_code=404, detail="Parameter not found")

    db.delete(db_parameter)
    db.commit()
