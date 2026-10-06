from pydantic import BaseModel
from typing import List, Optional, Any

class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    message: str = "Operation completed successfully"
    error: Optional[str] = None

class IngestionLogSchema(BaseModel):
    id: int
    file_type: str
    file_name: str
    records_processed: int
    status: str
    message: str
    timestamp: str
