import os
import shutil
import cv2
import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import random

# Paths to dataset directories
data_dir = "C:/Users/ramya/OneDrive - iiit-b/Desktop/data_deepfake/Dataset/"
train_dir = os.path.join(data_dir, "Train")
val_dir = os.path.join(data_dir, "Validation")
temp_train_dir = os.path.join(data_dir, "Temp_Train")
temp_val_dir = os.path.join(data_dir, "Temp_Validation")

# Image dimensions
img_height, img_width = 128, 128

# Limit the number of images for training and validation
max_images_per_class = 12000 # Adjust as needed

def count_images(directory):
    """Count the number of real and fake images in a directory."""
    real_count = len(os.listdir(os.path.join(directory, 'Real')))
    fake_count = len(os.listdir(os.path.join(directory, 'Fake')))
    return real_count, fake_count

def prepare_limited_dataset(source_dir, target_dir, max_images):
    """Create a temporary dataset with a limited number of images per class."""
    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
    os.makedirs(os.path.join(target_dir, 'Real'), exist_ok=True)
    os.makedirs(os.path.join(target_dir, 'Fake'), exist_ok=True)

    for class_dir in ['Real', 'Fake']:
        class_path = os.path.join(source_dir, class_dir)
        target_class_path = os.path.join(target_dir, class_dir)
        all_images = os.listdir(class_path)
        random.shuffle(all_images)
        selected_images = all_images[:max_images]

        for image_name in selected_images:
            shutil.copy(os.path.join(class_path, image_name), target_class_path)

def get_processed_images_info(generator):
    """Calculate information about processed images from a generator."""
    n_samples = generator.n
    n_classes = len(generator.class_indices)
    batch_size = generator.batch_size
    steps_per_epoch = int(np.ceil(n_samples / batch_size))

    class_distribution = {}
    for class_name, class_index in generator.class_indices.items():
        class_count = len(generator.classes[generator.classes == class_index])
        class_distribution[class_name] = class_count

    return {
        'total_samples': n_samples,
        'batch_size': batch_size,
        'steps_per_epoch': steps_per_epoch,
        'class_distribution': class_distribution
    }

# Print initial image counts
print("\nInitial image counts:")
train_real, train_fake = count_images(train_dir)
val_real, val_fake = count_images(val_dir)
print(f"Training - Real: {train_real}, Fake: {train_fake}")
print(f"Validation - Real: {val_real}, Fake: {val_fake}")

# Prepare temporary directories with limited images
prepare_limited_dataset(train_dir, temp_train_dir, max_images_per_class)
prepare_limited_dataset(val_dir, temp_val_dir, max_images_per_class)

# Print filtered image counts
print("\nAfter filtering:")
train_real, train_fake = count_images(temp_train_dir)
val_real, val_fake = count_images(temp_val_dir)
print(f"Training - Real: {train_real}, Fake: {train_fake}")
print(f"Validation - Real: {val_real}, Fake: {val_fake}")

# Data generators for training and validation
datagen = ImageDataGenerator(rescale=1./255)

train_gen = datagen.flow_from_directory(
    temp_train_dir,
    target_size=(img_height, img_width),
    batch_size=32,
    class_mode='binary',
    classes=['Real', 'Fake']
)

val_gen = datagen.flow_from_directory(
    temp_val_dir,
    target_size=(img_height, img_width),
    batch_size=32,
    class_mode='binary',
    classes=['Real', 'Fake']
)

# Get training and validation information
train_info = get_processed_images_info(train_gen)
val_info = get_processed_images_info(val_gen)

print("\nTraining Data Processing Info:")
print(f"Total training samples: {train_info['total_samples']}")
print(f"Batch size: {train_info['batch_size']}")
print(f"Steps per epoch: {train_info['steps_per_epoch']}")
print("\nClass distribution in training:")
for class_name, count in train_info['class_distribution'].items():
    print(f"{class_name}: {count} images")

print("\nValidation Data Processing Info:")
print(f"Total validation samples: {val_info['total_samples']}")
print(f"Batch size: {val_info['batch_size']}")
print(f"Steps per epoch: {val_info['steps_per_epoch']}")
print("\nClass distribution in validation:")
for class_name, count in val_info['class_distribution'].items():
    print(f"{class_name}: {count} images")

# Define the CNN model
model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(img_height, img_width, 3)),
    MaxPooling2D((2, 2)),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(1, activation='sigmoid')
])

# Compile the model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train the model
history = model.fit(
    train_gen,
    steps_per_epoch=train_info['steps_per_epoch'],
    validation_data=val_gen,
    validation_steps=val_info['steps_per_epoch'],
    epochs=10
)

# Calculate total images processed
total_training_images_processed = train_info['total_samples'] * 10  # 10 epochs
total_validation_images_processed = val_info['total_samples'] * 10  # 10 epochs

print(f"\nTotal images processed during training: {total_training_images_processed}")
print(f"Total images processed during validation: {total_validation_images_processed}")
print(f"Combined total processed: {total_training_images_processed + total_validation_images_processed}")

# Save the model
model.save("deepfake_detector.h5")

# Functions for prediction
def predict_image(img_path):
    """Predict whether a single image is real or fake."""
    img = image.load_img(img_path, target_size=(img_height, img_width))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    prediction = model.predict(img_array)
    return "Fake" if prediction[0][0] > 0.5 else "Real"

def predict_video(video_path):
    """Predict whether a video is real or fake by analyzing frames."""
    cap = cv2.VideoCapture(video_path)
    fake_count, real_count = 0, 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Preprocess the frame
        frame_resized = cv2.resize(frame, (img_height, img_width))
        frame_array = np.array(frame_resized) / 255.0
        frame_array = np.expand_dims(frame_array, axis=0)

        # Predict
        prediction = model.predict(frame_array)
        if prediction[0][0] > 0.5:
            fake_count += 1
        else:
            real_count += 1

    cap.release()
    return "Fake" if fake_count > real_count else "Real"

# Example usage
if __name__ == "__main__":
    # Test an image
    test_image_path = "C:/Users/ramya/OneDrive - iiit-b/Desktop/test1.jpg"
    if os.path.exists(test_image_path):
        image_result = predict_image(test_image_path)
        print(f"\nTest image prediction: {image_result}")

    # Test a video (uncomment and modify path as needed)
    # test_video_path = "example_video.mp4"
    # if os.path.exists(test_video_path):
    #     video_result = predict_video(test_video_path)
    #     print(f"Test video prediction: {video_result}")
