import numpy as np
from typing import List, Optional
class ResultAggregator:
    def __init__(self):
        self.temporal_window = 5  # Consider temporal context
        
    def aggregate_video_results(self, frame_results: List[dict]) -> dict:
        """
        Aggregate frame-level results with temporal consistency
        """
        # Extract confidence scores
        confidences = [r['confidence'] for r in frame_results]
        
        # Apply temporal smoothing
        smoothed_confidences = self._temporal_smoothing(confidences)
        
        # Calculate weighted average based on face detection confidence
        weights = [r.get('face_count', 1) for r in frame_results]
        weighted_confidence = np.average(smoothed_confidences, weights=weights)
        
        # Determine final classification
        is_deepfake = weighted_confidence > 0.5
        
        # Calculate additional metrics
        total_time = sum(r['processing_time'] for r in frame_results)
        avg_faces = np.mean([r.get('face_count', 1) for r in frame_results])
        
        return {
            'is_deepfake': is_deepfake,
            'confidence': float(weighted_confidence),
            'processing_time': total_time,
            'average_faces_per_frame': float(avg_faces),
            'frame_count': len(frame_results)
        }
    
    def _temporal_smoothing(self, confidences: List[float]) -> np.ndarray:
        """
        Apply temporal smoothing to confidence scores
        """
        kernel = np.ones(self.temporal_window) / self.temporal_window
        return np.convolve(confidences, kernel, mode='same')