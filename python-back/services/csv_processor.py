import pandas as pd
import os
from typing import List, Dict
from sqlalchemy.orm import Session

from models.database import Machine, Component, CsvUpload, User

def generate_component_id(component_name: str, component_index: int) -> str:
    """
    Generate a readable component ID from component name.
    Format: "1.X ComponentName" where X is the component sequence
    Example: "Gear pump" -> "1.1 Gear pump", "Gearbox" -> "1.2 Gearbox"
    """
    return f"1.{component_index} {component_name}"

def process_csv_file(file_path: str, user: User, db: Session, csv_upload_id: str) -> Dict:
    """
    Process uploaded CSV file and create components.

    Expected CSV columns:
    - Component (required)
    - SupComponent (optional)
    - Failure mode (optional)
    - Failure hours (optional)

    Note: Machine must be assigned later by editing components.
    """
    try:
        # Read CSV
        df = pd.read_csv(file_path)

        # Validate required columns
        required_columns = ['Component']
        for col in required_columns:
            if col not in df.columns:
                raise ValueError(f"Missing required column: {col}")

        # Track created records and unique component names
        components_created = []
        component_names_seen = {}  # Track unique component names and their IDs
        component_index = 1  # Counter for unique components

        # Process each row
        for _, row in df.iterrows():
            component_name = str(row['Component']).strip()

            # Auto-generate component_id based on component name (only for unique components)
            if component_name not in component_names_seen:
                component_id = generate_component_id(component_name, component_index)
                component_names_seen[component_name] = component_id
                component_index += 1
            else:
                component_id = component_names_seen[component_name]

            # Create component without machine (machine_name will be "Unassigned")
            component = Component(
                user_id=user.id,
                machine_id=None,  # No machine assigned yet
                machine_name="Unassigned",  # Default value
                component_id=component_id,  # Auto-generated ID
                component_name=component_name,
                sub_component=str(row.get('SupComponent', '')).strip() or None,
                failure_mode=str(row.get('Failure mode', '')).strip() or None,
                failure_hours=float(row['Failure hours']) if pd.notna(row.get('Failure hours')) else None
            )
            db.add(component)
            components_created.append(component)

        # Commit all changes
        db.commit()

        # Update CSV upload status
        csv_upload = db.query(CsvUpload).filter(CsvUpload.id == csv_upload_id).first()
        if csv_upload:
            csv_upload.status = "completed"
            csv_upload.records_count = len(components_created)
            from datetime import datetime
            csv_upload.processed_at = datetime.utcnow()
            db.commit()

        return {
            "success": True,
            "components_created": len(components_created),
            "records_processed": len(components_created)
        }

    except Exception as e:
        db.rollback()

        # Update CSV upload status to failed
        csv_upload = db.query(CsvUpload).filter(CsvUpload.id == csv_upload_id).first()
        if csv_upload:
            csv_upload.status = "failed"
            csv_upload.error_message = str(e)
            from datetime import datetime
            csv_upload.processed_at = datetime.utcnow()
            db.commit()

        raise e
