from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Index, JSON
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    username = Column(String(100), nullable=False)
    company_name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    machines = relationship("Machine", back_populates="user", cascade="all, delete-orphan")
    components = relationship("Component", back_populates="user", cascade="all, delete-orphan")
    failure_items = relationship("FailureItem", back_populates="user", cascade="all, delete-orphan")
    failure_parameters = relationship("FailureParameter", back_populates="user", cascade="all, delete-orphan")
    csv_uploads = relationship("CsvUpload", back_populates="user", cascade="all, delete-orphan")
    reliability_results = relationship("ReliabilityResult", back_populates="user", cascade="all, delete-orphan")
    machine_positions = relationship("MachinePosition", back_populates="user", cascade="all, delete-orphan")
    machine_pictures = relationship("MachinePicture", back_populates="user", cascade="all, delete-orphan")


class Machine(Base):
    __tablename__ = "machines"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sequence = Column(Integer, nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="machines")
    components = relationship("Component", back_populates="machine")


class Component(Base):
    __tablename__ = "components"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    machine_id = Column(String, ForeignKey("machines.id", ondelete="SET NULL"), nullable=True, index=True)
    machine_name = Column(String(255), nullable=False, index=True)
    component_id = Column(String(100), nullable=True)  # Natural ID like "1.1 Compressors"
    component_name = Column(String(255), nullable=False)
    sub_component = Column(String(255), nullable=True)
    failure_mode = Column(String(255), nullable=True)
    failure_hours = Column(Float, nullable=True)  # Mean Time (MT) for default calculation
    manual_hours = Column(JSON, nullable=True)  # Array of manual failure hours for MLE calculation
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="components")
    machine = relationship("Machine", back_populates="components")
    reliability_results = relationship("ReliabilityResult", back_populates="component")
    failure_items = relationship("FailureItem", back_populates="component", cascade="all, delete-orphan")


class FailureItem(Base):
    __tablename__ = "failure_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    component_id = Column(String, ForeignKey("components.id", ondelete="CASCADE"), nullable=False, index=True)
    failure_item_id = Column(String(100), nullable=False)  # Natural ID like "fi-11-001"
    failure_item_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="failure_items")
    component = relationship("Component", back_populates="failure_items")
    parameters = relationship("FailureParameter", back_populates="failure_item", cascade="all, delete-orphan")
    machine_positions = relationship("MachinePosition", back_populates="failure_item", cascade="all, delete-orphan")


class FailureParameter(Base):
    __tablename__ = "failure_parameters"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    failure_item_id = Column(String, ForeignKey("failure_items.id", ondelete="CASCADE"), nullable=False, index=True)
    parameter_type = Column(String(100), nullable=False)  # weibull_shape, weibull_scale, etc.
    parameter_value = Column(Float, nullable=True)
    parameter_text = Column(Text, nullable=True)  # For text parameters
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="failure_parameters")
    failure_item = relationship("FailureItem", back_populates="parameters")


class CsvUpload(Base):
    __tablename__ = "csv_uploads"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True)
    records_count = Column(Integer, nullable=True)
    status = Column(String(50), nullable=False, default="pending", index=True)  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="csv_uploads")


class ReliabilityResult(Base):
    __tablename__ = "reliability_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    component_id = Column(String, ForeignKey("components.id", ondelete="CASCADE"), nullable=True, index=True)
    analysis_type = Column(String(100), nullable=False)  # weibull, risk_matrix, etc.
    results = Column(Text, nullable=False)  # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="reliability_results")
    component = relationship("Component", back_populates="reliability_results")


class MachinePosition(Base):
    __tablename__ = "machine_positions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    failure_item_id = Column(String, ForeignKey("failure_items.id", ondelete="CASCADE"), nullable=False, index=True)
    position_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="machine_positions")
    failure_item = relationship("FailureItem", back_populates="machine_positions")
    machine_pictures = relationship("MachinePicture", back_populates="machine_position", cascade="all, delete-orphan")


class MachinePicture(Base):
    __tablename__ = "machine_pictures"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    machine_position_id = Column(String, ForeignKey("machine_positions.id", ondelete="CASCADE"), nullable=False, index=True)
    direction = Column(String(100), nullable=False)
    picture_url = Column(Text, nullable=False)  # Store base64 or file path
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="machine_pictures")
    machine_position = relationship("MachinePosition", back_populates="machine_pictures")
