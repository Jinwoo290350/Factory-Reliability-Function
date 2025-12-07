from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# ============= Auth Schemas =============

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    username: str
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    company_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ============= Machine Schemas =============

class MachineCreate(BaseModel):
    name: str
    description: Optional[str] = None

class MachineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class MachineResponse(BaseModel):
    id: str
    user_id: str
    sequence: Optional[int]
    name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============= Component Schemas =============

class ComponentCreate(BaseModel):
    machine_id: Optional[str] = None
    machine_name: str
    component_id: Optional[str] = None  # Natural ID like "1.1 Compressors"
    component_name: str
    sub_component: Optional[str] = None
    failure_mode: Optional[str] = None
    failure_hours: Optional[float] = None
    manual_hours: Optional[List[float]] = None  # Array of manual failure hours

class ComponentUpdate(BaseModel):
    machine_id: Optional[str] = None
    machine_name: Optional[str] = None
    component_id: Optional[str] = None
    component_name: Optional[str] = None
    sub_component: Optional[str] = None
    failure_mode: Optional[str] = None
    failure_hours: Optional[float] = None
    manual_hours: Optional[List[float]] = None  # Array of manual failure hours

class ComponentResponse(BaseModel):
    id: str
    user_id: str
    machine_id: Optional[str]
    machine_name: str
    component_id: Optional[str]  # Natural ID like "1.1 Compressors"
    component_name: str
    sub_component: Optional[str]
    failure_mode: Optional[str]
    failure_hours: Optional[float]
    manual_hours: Optional[List[float]]  # Array of manual failure hours
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============= CSV Upload Schemas =============

class CSVUploadResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_size: Optional[int]
    records_count: Optional[int]
    status: str
    error_message: Optional[str]
    created_at: datetime
    processed_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============= Reliability Analysis Schemas =============

class WeibullAnalysisRequest(BaseModel):
    component_ids: List[str]
    failure_hours: List[float]

class WeibullAnalysisResponse(BaseModel):
    shape: float
    scale: float
    reliability_at_time: dict
    graph_data: Optional[dict] = None

class RiskMatrixRequest(BaseModel):
    failure_modes: List[dict]

class RiskMatrixResponse(BaseModel):
    risk_matrix_data: dict

class TimeToFailureRequest(BaseModel):
    component_id: str

class TimeToFailureResponse(BaseModel):
    mtbf: float
    predictions: dict

class ReliabilityResultResponse(BaseModel):
    id: str
    user_id: str
    component_id: Optional[str]
    analysis_type: str
    results: str  # JSON string
    created_at: datetime

    class Config:
        from_attributes = True

# ============= Machine Position Schemas =============

class MachinePositionCreate(BaseModel):
    failure_item_id: str
    position_name: str
    description: Optional[str] = None

class MachinePositionUpdate(BaseModel):
    position_name: Optional[str] = None
    description: Optional[str] = None

class MachinePositionResponse(BaseModel):
    id: str
    user_id: str
    failure_item_id: str
    position_name: str
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ============= Machine Picture Schemas =============

class MachinePictureCreate(BaseModel):
    machine_position_id: str
    direction: str
    picture_url: str  # Base64 encoded or file path

class MachinePictureUpdate(BaseModel):
    direction: Optional[str] = None
    picture_url: Optional[str] = None

class MachinePictureResponse(BaseModel):
    id: str
    user_id: str
    machine_position_id: str
    direction: str
    picture_url: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
