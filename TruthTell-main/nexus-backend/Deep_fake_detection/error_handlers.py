from fastapi import APIRouter, HTTPException, Depends, status
from detector import DeepFakeDetector
from basemodels import DetectionResult, AnalysisMetadata
from fastapi import UploadFile, File
from videoprocess import VideoProcessor
from result import ResultAggregator
from helper import save_temp_file, compute_file_hash
import datetime
import os

deepfake_router = APIRouter()

class DeepFakeDetectionError(Exception):
    """Base class for detection errors"""
    pass

class PreprocessingError(DeepFakeDetectionError):
    """Error during image/video preprocessing"""
    pass

class ModelInferenceError(DeepFakeDetectionError):
    """Error during model inference"""
    pass

class VideoProcessingError(DeepFakeDetectionError):
    """Error during video processing"""
    pass

def handle_detection_error(e: Exception) -> HTTPException:
    """
    Convert detection errors to appropriate HTTP responses
    """
    if isinstance(e, PreprocessingError):
        return HTTPException(
            status_code=400,
            detail={
                "error": "Preprocessing failed",
                "message": str(e),
                "type": "preprocessing_error"
            }
        )
    elif isinstance(e, ModelInferenceError):
        return HTTPException(
            status_code=500,
            detail={
                "error": "Model inference failed",
                "message": str(e),
                "type": "model_error"
            }
        )
    elif isinstance(e, VideoProcessingError):
        return HTTPException(
            status_code=400,
            detail={
                "error": "Video processing failed",
                "message": str(e),
                "type": "video_error"
            }
        )
    else:
        return HTTPException(
            status_code=500,
            detail={
                "error": "Unknown error",
                "message": str(e),
                "type": "unknown_error"
            }
        )

# Example usage in route
@deepfake_router.post("/api/v1/analyze/video", response_model=DetectionResult)
async def analyze_video(file: UploadFile = File(...)):
    try:
        detector = DeepFakeDetector()
        processor = VideoProcessor(detector)
        aggregator = ResultAggregator()
        
        # Process video
        contents = await file.read()
        temp_path = save_temp_file(contents)
        
        try:
            frame_results = await processor.process_video(temp_path)
            final_result = aggregator.aggregate_video_results(frame_results)
            
            return DetectionResult(
                is_deepfake=final_result['is_deepfake'],
                confidence_score=final_result['confidence'],
                detection_method="temporal_cnn",
                analyzed_features=["facial_dynamics", "temporal_consistency"],
                processing_time=final_result['processing_time'],
                timestamp=datetime.now()
            )
            
        except Exception as e:
            raise handle_detection_error(e)
            
        finally:
            # Clean up temporary file
            os.unlink(temp_path)
            
    except Exception as e:
        raise handle_detection_error(e)