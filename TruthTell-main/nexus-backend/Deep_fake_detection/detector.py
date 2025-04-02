import torch
import cv2
import time
import numpy as np

class DeepFakeDetector:
    def __init__(self):
        self.face_detector = self.load_face_detector()
        self.feature_extractor = self.load_feature_extractor()
        self.classifier = self.load_classifier()
        
    def load_face_detector(self):
        """
        Load face detection model (using MTCNN for high accuracy)
        """
        from facenet_pytorch import MTCNN
        dev = 'cuda' if torch.cuda.is_available() else 'cpu'
        #print(dev)
        return MTCNN(
            image_size=224,
            margin=40,
            keep_all=True,
            device=dev
        )
    
    def load_feature_extractor(self):
        """
        Load EfficientNet for feature extraction
        """
        import timm
        model = timm.create_model('efficientnet_b4', pretrained=True)
        model.classifier = torch.nn.Identity()  # Remove classifier head
        return model.eval()
    
    def load_classifier(self):
        """
        Load the deepfake classification head
        """
        return torch.nn.Sequential(
            torch.nn.Linear(1792, 512),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.3),
            torch.nn.Linear(512, 128),
            torch.nn.ReLU(),
            torch.nn.Linear(128, 2)  # Binary classification
        )
    
    def preprocess_image(self, image: np.ndarray):
        """
        Preprocess image for model input
        """
        # Convert BGR to RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Detect faces with additional checks
        boxes, _ = self.face_detector.detect(image_rgb)
        if boxes is None or len(boxes) == 0:
            raise ValueError("No faces detected in image")
        
        # Extract and preprocess face regions with validation
        faces = []
        for box in boxes:
            x1, y1, x2, y2 = map(int, box)
            # Ensure valid coordinates
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(image_rgb.shape[1], x2), min(image_rgb.shape[0], y2)
            
            # Verify face region is valid
            if x2 > x1 and y2 > y1:
                face = image_rgb[y1:y2, x1:x2]
                if face.size > 0:  # Check if face region is not empty
                    face = cv2.resize(face, (224, 224))
                    face = torch.from_numpy(face).permute(2, 0, 1).float() / 255.0
                    faces.append(face)
        
        if not faces:
            raise ValueError("No valid faces could be processed")
                
        return torch.stack(faces)

    
    def extract_features(self, faces: torch.Tensor):
        """
        Extract deep features from faces
        """
        with torch.no_grad():
            features = self.feature_extractor(faces)
        return features
    
    def detect(self, image: np.ndarray) -> dict:
        """
        Run complete detection pipeline
        """
        try:
            # Time the processing
            start_time = time.time()
            
            # Preprocess
            faces = self.preprocess_image(image)
            
            # Extract features
            features = self.extract_features(faces)
            
            # Classify
            with torch.no_grad():
                logits = self.classifier(features)
                probs = torch.softmax(logits, dim=1)
            
            # Get results
            is_deepfake = bool(probs[:, 1].mean() > 0.5)
            confidence = float(probs[:, 1].mean())
            
            return {
                'is_deepfake': is_deepfake,
                'confidence': confidence,
                'processing_time': time.time() - start_time,
                'face_count': len(faces)
            }
            
        except Exception as e:
            raise RuntimeError(f"Detection failed: {str(e)}")