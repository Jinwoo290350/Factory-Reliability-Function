from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.schemas import ComponentCreate, ComponentUpdate, ComponentResponse
from models.database import Component, User
from utils.database import get_db
from utils.auth import get_current_user

router = APIRouter(prefix="/components", tags=["components"])

@router.get("", response_model=List[ComponentResponse])
def get_components(
    machine_id: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all components for the current user.
    Optionally filter by machine_id.
    """
    query = db.query(Component).filter(Component.user_id == current_user.id)

    if machine_id:
        query = query.filter(Component.machine_id == machine_id)

    components = query.order_by(Component.created_at.desc()).all()
    return components

@router.post("", response_model=ComponentResponse, status_code=status.HTTP_201_CREATED)
def create_component(
    component_data: ComponentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new component.
    Auto-generates component_id if not provided.
    """
    # Auto-generate component_id if not provided
    component_id = component_data.component_id
    if not component_id:
        # Check if component with same name exists
        existing_component = db.query(Component).filter(
            Component.user_id == current_user.id,
            Component.component_name == component_data.component_name
        ).first()

        if existing_component:
            # Use existing component_id
            component_id = existing_component.component_id
        else:
            # Generate new component_id
            # Count unique component names to get next sequence
            unique_components = db.query(Component.component_name).filter(
                Component.user_id == current_user.id
            ).distinct().all()
            next_sequence = len(unique_components) + 1
            component_id = f"1.{next_sequence} {component_data.component_name}"

    component = Component(
        user_id=current_user.id,
        machine_id=component_data.machine_id,
        machine_name=component_data.machine_name,
        component_id=component_id,
        component_name=component_data.component_name,
        sub_component=component_data.sub_component,
        failure_mode=component_data.failure_mode,
        failure_hours=component_data.failure_hours
    )

    db.add(component)
    db.commit()
    db.refresh(component)

    return component

@router.get("/{component_id}", response_model=ComponentResponse)
def get_component(
    component_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific component by ID.
    """
    component = db.query(Component).filter(
        Component.id == component_id,
        Component.user_id == current_user.id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )

    return component

@router.put("/{component_id}", response_model=ComponentResponse)
def update_component(
    component_id: str,
    component_data: ComponentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update a component.
    """
    component = db.query(Component).filter(
        Component.id == component_id,
        Component.user_id == current_user.id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )

    # Update fields if provided
    update_data = component_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(component, field, value)

    db.commit()
    db.refresh(component)

    return component

@router.delete("/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_component(
    component_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a component.
    """
    component = db.query(Component).filter(
        Component.id == component_id,
        Component.user_id == current_user.id
    ).first()

    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Component not found"
        )

    db.delete(component)
    db.commit()

    return None
