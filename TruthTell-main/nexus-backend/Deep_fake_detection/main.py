from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import os
import torch
from pydantic import BaseModel
from datetime import datetime
import logging
from pathlib import Path
from detector import DeepFakeDetector
from videoprocess import VideoProcessor
from result import ResultAggregator
from error_handlers import handle_detection_error, deepfake_router
from basemodels import DetectionResult, AnalysisMetadata
from helper import save_temp_file, compute_file_hash
from contextlib import asynccontextmanager
import uvicorn

logging.basicConfig(
    level = logging.INFO,
    format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize detector on startup
    detector = DeepFakeDetector()
    app.state.detector = detector  # Store detector in app state for access
    
    create_directories()
    logger.info("Deepfake detection service started")
    
    try:
        yield
        # Keep running until explicitly stopped
    finally:
        logger.info("Deepfake detection service shutting down")

# Initialize FastAPI app
app = FastAPI(
    title="Deep Fake Detection API",
    description="API for detecting deep fake images and videos",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(deepfake_router, tags=["deepfake"])

# Dependency for getting detector instances
async def get_detector():
    detector = DeepFakeDetector()
    try:
        yield detector
    finally:
        # Cleanup if needed
        pass

# Routes with integrated components
@app.post("/api/v1/analyze/image", response_model=DetectionResult)
async def analyze_image(
    file: UploadFile = File(...),
    detector: DeepFakeDetector = Depends(get_detector)
):
    try:
        logger.info(f"Processing image: {file.filename}")
        
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        metadata = AnalysisMetadata(
            file_hash=compute_file_hash(contents),
            file_size=len(contents),
            frame_count=1,  # For single image
            resolution=(image.shape[1], image.shape[0]),
            format=file.content_type
        )
        
        result = detector.detect(image)
        
        return DetectionResult(
            is_deepfake=result['is_deepfake'],
            confidence_score=result['confidence'],
            detection_method="ensemble_cnn",
            analyzed_features=["facial_features", "image_artifacts", "noise_patterns"],
            processing_time=result['processing_time'],
            timestamp=datetime.now(),
            metadata=metadata
        )
    
    except Exception as e:
        logger.error(f"Error processing image {file.filename}: {str(e)}")
        raise handle_detection_error(e)


@deepfake_router.post("/api/v1/analyze/video", response_model=DetectionResult)
async def analyze_video(file: UploadFile = File(...)):
    try:
        detector = DeepFakeDetector()
        processor = VideoProcessor(detector)
        aggregator = ResultAggregator()
        
        contents = await file.read()
        temp_path = save_temp_file(contents)
        file_hash = compute_file_hash(contents)
        
        try:
            frame_results = await processor.process_video(temp_path)
            final_result = aggregator.aggregate_video_results(frame_results)
            
            metadata = AnalysisMetadata(
                file_hash=file_hash,
                frame_count=len(frame_results),  # Add the frame count here
                format=file.content_type,
                timestamp=datetime.now()
            )
            
            return DetectionResult(
                is_deepfake=final_result['is_deepfake'],
                confidence_score=final_result['confidence'],
                detection_method="temporal_cnn",
                analyzed_features=["facial_dynamics", "temporal_consistency"],
                processing_time=final_result['processing_time'],
                timestamp=datetime.now(),
                metadata=metadata
            )
            
        except Exception as e:
            raise handle_detection_error(e)
            
        finally:
            os.unlink(temp_path)
            
    except Exception as e:
        raise handle_detection_error(e)

# Middleware for request logging
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

# Create required directories
def create_directories():
    """Create necessary directories for the application"""
    directories = ['temp', 'logs']
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)

# File structure should look like:
"""
deepfake_detector/
│
├── main.py              # This file
├── detector.py          # DeepFakeDetector class from previous code
├── video_processor.py   # VideoProcessor class from previous code
├── result_aggregator.py # ResultAggregator class from previous code
├── error_handlers.py    # Error handling utilities
├── utils/
│   ├── __init__.py
│   ├── file_utils.py    # File handling utilities
│   └── image_utils.py   # Image processing utilities
├── models/
│   └── __init__.py      # Model weights and configurations
├── temp/               # Temporary file storage
└── logs/               # Log files
"""

