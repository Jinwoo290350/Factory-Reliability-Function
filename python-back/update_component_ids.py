"""
Script to update existing component IDs to new format: "1.X ComponentName"
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from models.database import Component
from utils.database import DATABASE_URL

def update_component_ids():
    """Update all components to new ID format"""
    try:
        connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
        engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=True)

        with Session(engine) as session:
            # Get all components for all users
            components = session.query(Component).all()

            if not components:
                print("No components found in database")
                return

            print(f"\nFound {len(components)} components to update")

            # Track unique component names per user and assign new IDs
            user_component_map = {}  # {user_id: {component_name: component_id}}
            user_component_counter = {}  # {user_id: counter}

            updated_count = 0

            for component in components:
                user_id = component.user_id
                component_name = component.component_name

                # Initialize user tracking if not exists
                if user_id not in user_component_map:
                    user_component_map[user_id] = {}
                    user_component_counter[user_id] = 1

                # Check if we already assigned an ID for this component name
                if component_name in user_component_map[user_id]:
                    # Reuse existing ID
                    new_component_id = user_component_map[user_id][component_name]
                else:
                    # Generate new ID
                    sequence = user_component_counter[user_id]
                    new_component_id = f"1.{sequence} {component_name}"
                    user_component_map[user_id][component_name] = new_component_id
                    user_component_counter[user_id] += 1

                # Update component ID if different
                old_id = component.component_id
                if old_id != new_component_id:
                    component.component_id = new_component_id
                    updated_count += 1
                    print(f"✓ Updated: '{old_id}' → '{new_component_id}'")

            # Commit all changes
            session.commit()
            print(f"\n✅ Successfully updated {updated_count} component IDs!")

            # Show summary
            print("\n📊 Summary by user:")
            for user_id, component_map in user_component_map.items():
                print(f"  User {user_id}: {len(component_map)} unique components")
                for comp_name, comp_id in sorted(component_map.items(), key=lambda x: x[1]):
                    print(f"    - {comp_id}")

    except Exception as e:
        print(f"❌ Error updating component IDs: {e}")
        raise

if __name__ == "__main__":
    print("🔄 Updating component IDs to new format...")
    update_component_ids()
