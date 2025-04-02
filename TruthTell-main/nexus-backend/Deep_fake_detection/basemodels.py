from pydantic import BaseModel, ConfigDict
from datetime import datetime

class AnalysisMetadata(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    file_hash: str
    frame_count: int  # This was the missing required field
    format: str
    timestamp: datetime = None

class DetectionResult(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    is_deepfake: bool
    confidence_score: float
    detection_method: str
    analyzed_features: list[str]
    processing_time: float
    timestamp: datetime = None
    metadata: AnalysisMetadata
