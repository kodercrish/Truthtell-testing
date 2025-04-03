from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from typing import Dict, Any
import logging
from videoBroadcast.gemini_video_service import GeminiVideoAnalyzer
from datetime import datetime

router = APIRouter()
gemini_analyzer = GeminiVideoAnalyzer()

@router.post("/analyze-video-chunk")
async def analyze_video_chunk(
    video_data: Dict[str, Any] = Body(...)
):
    """
    Analyze a video chunk using Gemini model.
    
    The video_data should contain:
    - videoChunk: base64 encoded video data
    - roomID: optional room identifier
    - timestamp: optional timestamp
    """
    try:
        # Extract data from request
        video_chunk = video_data.get("videoChunk")
        room_id = video_data.get("roomID", "unknown-room")
        timestamp = video_data.get("timestamp", datetime.now().isoformat())
        
        if not video_chunk:
            raise HTTPException(status_code=400, detail="No video chunk provided")
        
        # Prepare context for analysis
        context = {
            "room_id": room_id,
            "timestamp": timestamp
        }
        
        # Process with Gemini
        result = await gemini_analyzer.analyze_video_chunk(video_chunk, context)
        
        return JSONResponse(content=result)
        
    except Exception as e:
        logging.error(f"Error in video chunk analysis endpoint: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": f"Failed to process video: {str(e)}"
            }
        )

@router.get("/health")
async def health_check():
    """Health check endpoint for the video chunk analysis service"""
    return {"status": "healthy", "service": "video-chunk-analysis"}
