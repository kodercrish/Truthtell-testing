import os
import tempfile
import base64
import uuid
from typing import Dict, Any, List
import google.generativeai as genai
from pathlib import Path
import logging

class GeminiVideoAnalyzer:
    def __init__(self):
        # Initialize Gemini API with your API key
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            logging.warning("GEMINI_API_KEY not found in environment variables")
            api_key = "your_api_key_here"  # Replace with your actual API key if not using env vars
            
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro-vision')
    
    async def analyze_video_chunk(self, video_base64: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze a video chunk using Gemini Pro Vision model.
        
        Args:
            video_base64: Base64 encoded video data
            context: Additional context about the video
            
        Returns:
            Dict containing analysis results
        """
        try:
            # Create a temporary file to store the video
            with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_file:
                # Decode base64 data (skip the data URL prefix if present)
                if ',' in video_base64:
                    video_base64 = video_base64.split(',', 1)[1]
                
                video_data = base64.b64decode(video_base64)
                temp_file.write(video_data)
                temp_file_path = temp_file.name
            
            # Prepare prompt based on context
            prompt = "Analyze this video segment and provide insights about:"
            prompt += "\n- What's happening in the video"
            prompt += "\n- Any notable objects or people"
            prompt += "\n- Any potential misinformation or concerning content"
            prompt += "\n- Overall assessment of credibility"
            
            if context:
                if 'room_id' in context:
                    prompt += f"\nThis is from room: {context['room_id']}"
                if 'timestamp' in context:
                    prompt += f"\nRecorded at: {context['timestamp']}"
            
            # Process with Gemini
            video_path = Path(temp_file_path)
            response = self.model.generate_content([prompt, video_path])
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            # Process and return the response
            analysis_text = response.text if hasattr(response, 'text') else str(response)
            
            return {
                "status": "success",
                "analysis": analysis_text,
                "chunk_id": str(uuid.uuid4()),
                "timestamp": context.get("timestamp", ""),
                "room_id": context.get("room_id", "")
            }
            
        except Exception as e:
            logging.error(f"Error analyzing video with Gemini: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "message": "Failed to analyze video chunk"
            }
