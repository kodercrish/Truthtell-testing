from detector import DeepFakeDetector
from typing import List
import cv2
import numpy as np
import concurrent
class VideoProcessor:
    def __init__(self, detector: DeepFakeDetector):
        self.detector = detector
        self.batch_size = 32  # Process frames in batches
        
    async def process_video(self, video_path: str) -> List[dict]:
        """
        Process video frames efficiently
        """
        results = []
        frames = []
        
        # Open video
        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        try:
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                    
                frames.append(frame)
                
                # Process when batch is full or at end
                if len(frames) >= self.batch_size or not ret:
                    # Process batch asynchronously
                    batch_results = await self._process_batch(frames)
                    results.extend(batch_results)
                    frames = []
                    
            return results
            
        finally:
            cap.release()
    
    async def _process_batch(self, frames: List[np.ndarray]) -> List[dict]:
        """
        Process a batch of frames asynchronously
        """
        results = []
        
        # Use ThreadPoolExecutor for CPU-bound operations
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_results = [
                executor.submit(self.detector.detect, frame)
                for frame in frames
            ]
            
            for future in concurrent.futures.as_completed(future_results):
                results.append(future.result())
                
        return results