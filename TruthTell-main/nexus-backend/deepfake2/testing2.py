import streamlit as st
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from PIL import Image
import io
import os
from testing2 import combined_prediction, predict_video

# Load the model
model = load_model("deepfake_detector.h5")

st.set_page_config(page_title="Deepfake Detection System", layout="wide")

def process_image_in_memory(file):
    image = Image.open(file)
    # Convert PIL Image to bytes
    img_byte_arr = io.BytesIO()
    image.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    
    # Create temporary file, process it, and delete immediately
    temp_path = "temp_image.jpg"
    with open(temp_path, "wb") as f:
        f.write(img_byte_arr)
    
    results = combined_prediction(temp_path)
    
    # Clean up
    if os.path.exists(temp_path):
        os.remove(temp_path)
        
    return results, image

def process_video_in_memory(file):
    temp_path = "temp_video.mp4"
    
    # Save temporarily for processing
    with open(temp_path, "wb") as f:
        f.write(file.read())
    
    results = predict_video(temp_path)
    
    # Clean up
    if os.path.exists(temp_path):
        os.remove(temp_path)
        
    return results

def main():
    st.title("Deepfake Detection System")
    st.write("Upload an image or video to detect if it's real or manipulated")

    file = st.file_uploader("Choose a file", type=['jpg', 'jpeg', 'png', 'mp4', 'avi'])
    
    if file:
        file_type = file.type.split('/')[0]
        
        if file_type == 'image':
            results, image = process_image_in_memory(file)
            st.image(image, caption="Uploaded Image", use_column_width=True)
            
            if st.button("Analyze Image"):
                with st.spinner("Analyzing..."):
                    # Display results in an organized manner
                    st.subheader("Analysis Results")
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        st.metric("Final Prediction", results["Final Prediction"])
                        st.metric("Confidence Score", f"{results['Confidence Score']*100:.2f}%")
                    
                    with col2:
                        st.metric("CNN Prediction", results["CNN Prediction"])
                        st.metric("Metadata Analysis", results["Metadata Analysis"])
                    
                    st.write("Detailed Analysis:")
                    st.json(results)
                    
        elif file_type == 'video':
            st.video(file)
            
            if st.button("Analyze Video"):
                with st.spinner("Analyzing video frames..."):
                    results = process_video_in_memory(file)
                    
                    # Display results
                    st.subheader("Video Analysis Results")
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        st.metric("Final Prediction", results["Final Video Prediction"])
                        st.metric("Confidence Score", f"{results['Confidence Score']*100:.2f}%")
                    
                    with col2:
                        st.metric("Fake Frames", results["Fake Frames"])
                        st.metric("Real Frames", results["Real Frames"])
                    
                    st.write("Detailed Analysis:")
                    st.json(results)

if __name__ == "__main__":
    main()

