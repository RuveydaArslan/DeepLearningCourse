import os
import uuid
import time
import threading
import wave
import struct
import math
import cv2
import numpy as np
from flask import Flask, request, jsonify, render_template, Response, url_for
from flask_cors import CORS
from werkzeug.utils import secure_filename
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

# Configurations
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
RESULT_FOLDER = os.path.join(app.root_path, 'static', 'results')
AUDIO_FOLDER = os.path.join(app.root_path, 'static', 'audio')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULT_FOLDER'] = RESULT_FOLDER

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

# Global variables
model = None
jobs = {}  # Stores job status and logs

# Threat classes that trigger alarms
THREAT_CLASSES = {
    'Assaulting', 'Fighting', 'Kidnapping', 
    'Man_With_Gun', 'Man_with_Knife', 
    'Terrorist_With_Time_Bomb', 'Theaf_Robbery'
}

def generate_beep_sound():
    """Generates a warning siren wav file natively if it doesn't exist."""
    file_path = os.path.join(AUDIO_FOLDER, 'alert.wav')
    if os.path.exists(file_path):
        return
    
    sample_rate = 11025
    duration = 1.2  # duration of the beep sequence
    
    with wave.open(file_path, 'w') as w:
        w.setnchannels(1)  # Mono
        w.setsampwidth(2)  # 16-bit PCM
        w.setframerate(sample_rate)
        
        # Write alternating frequency siren wave
        num_samples = int(sample_rate * duration)
        for i in range(num_samples):
            t = i / sample_rate
            # Alternating frequency every 0.15s (like a siren)
            freq = 950 if int(t / 0.15) % 2 == 0 else 750
            # Sine wave value
            val = int(16384 * math.sin(2 * math.pi * freq * t))
            # Pack value to 16-bit short
            w.writeframesraw(struct.pack('<h', val))

def load_model():
    """Loads the YOLO model thread-safely."""
    global model
    if model is None:
        model_path = os.path.join(app.root_path, 'data', 'Suspicious_Activities_nano.pt')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")
        model = YOLO(model_path)
    return model

@app.route('/')
def index():
    """Serves the frontend dashboard."""
    return render_template('index.html')

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Returns model class information."""
    try:
        yolo_model = load_model()
        return jsonify({
            'success': True,
            'classes': yolo_model.names,
            'threat_classes': list(THREAT_CLASSES)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/detect-image', methods=['POST'])
def detect_image():
    """Infers on an uploaded image and returns bounding box image and detections."""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'Empty filename'}), 400
    
    try:
        yolo_model = load_model()
        
        # Save input file
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(input_path)
        
        # Run inference
        results = yolo_model(input_path)
        result = results[0]
        
        # Draw bounding boxes using YOLO's plot function
        annotated_img = result.plot()
        
        # Save output image
        output_filename = f"detected_{filename}"
        output_path = os.path.join(app.config['RESULT_FOLDER'], output_filename)
        cv2.imwrite(output_path, annotated_img)
        
        # Parse detections
        detections = []
        has_threat = False
        threats_detected = []
        
        boxes = result.boxes
        for box in boxes:
            cls_idx = int(box.cls[0].item())
            class_name = yolo_model.names.get(cls_idx, f"Class {cls_idx}")
            conf = float(box.conf[0].item())
            xyxy = box.xyxy[0].tolist()  # [xmin, ymin, xmax, ymax]
            
            detections.append({
                'class': class_name,
                'confidence': conf,
                'bbox': xyxy
            })
            
            if class_name in THREAT_CLASSES and conf > 0.35:
                has_threat = True
                if class_name not in threats_detected:
                    threats_detected.append(class_name)
                    
        return jsonify({
            'success': True,
            'type': 'image',
            'original_url': url_for('static', filename=f'uploads/{filename}'),
            'result_url': url_for('static', filename=f'results/{output_filename}'),
            'detections': detections,
            'alert': has_threat,
            'threats': threats_detected
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def process_video_job(job_id, input_path, output_filename):
    """Processes a video in a background thread, updating global jobs dictionary."""
    jobs[job_id] = {
        'progress': 0,
        'status': 'processing',
        'logs': [],
        'detections_summary': {},
        'result_url': None,
        'error': None
    }
    
    try:
        yolo_model = load_model()
        cap = cv2.VideoCapture(input_path)
        if not cap.isOpened():
            raise ValueError("Failed to open uploaded video file.")
            
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        if total_frames <= 0:
            total_frames = 1
            
        output_path = os.path.join(app.config['RESULT_FOLDER'], output_filename)
        
        # Try AVC1 (H.264), fallback to mp4v if unavailable
        fourcc = cv2.VideoWriter_fourcc(*'avc1')
        out = cv2.VideoWriter(output_path, fourcc, fps if fps > 0 else 24.0, (width, height))
        
        # Check if writer opened, if not fallback
        if not out.isOpened():
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps if fps > 0 else 24.0, (width, height))
            
        frame_idx = 0
        detections_summary = {}
        
        # Keep track of active threat in the video
        video_threats = set()
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            frame_idx += 1
            progress = int((frame_idx / total_frames) * 100)
            
            # Predict frame
            # Run inference on frame (verbose=False is cleaner)
            results = yolo_model(frame, verbose=False)
            result = results[0]
            
            # Get annotated frame and write it
            annotated_frame = result.plot()
            out.write(annotated_frame)
            
            # Parse detections in this frame
            boxes = result.boxes
            current_frame_threats = []
            
            for box in boxes:
                cls_idx = int(box.cls[0].item())
                class_name = yolo_model.names.get(cls_idx, f"Class {cls_idx}")
                conf = float(box.conf[0].item())
                
                # Filter out low confidence detections
                if conf > 0.40:
                    detections_summary[class_name] = max(detections_summary.get(class_name, 0.0), conf)
                    if class_name in THREAT_CLASSES:
                        video_threats.add(class_name)
                        current_frame_threats.append(f"{class_name} ({conf:.2%})")
            
            # Update live logs occasionally or on threats
            log_msg = f"Processed Frame {frame_idx}/{total_frames}"
            if current_frame_threats:
                log_msg += f" - ALERT: Detected " + ", ".join(current_frame_threats)
                
            jobs[job_id]['progress'] = progress
            jobs[job_id]['logs'].append({
                'timestamp': time.strftime("%H:%M:%S"),
                'frame': frame_idx,
                'msg': log_msg,
                'alert': len(current_frame_threats) > 0
            })
            
            # Keep log size reasonable
            if len(jobs[job_id]['logs']) > 150:
                jobs[job_id]['logs'].pop(0)
                
        cap.release()
        out.release()
        
        # Complete job
        jobs[job_id]['progress'] = 100
        jobs[job_id]['status'] = 'completed'
        jobs[job_id]['detections_summary'] = detections_summary
        jobs[job_id]['result_url'] = url_for('static', filename=f'results/{output_filename}')
        jobs[job_id]['logs'].append({
            'timestamp': time.strftime("%H:%M:%S"),
            'frame': frame_idx,
            'msg': "Video processing completed successfully.",
            'alert': False
        })
        
    except Exception as e:
        jobs[job_id]['status'] = 'failed'
        jobs[job_id]['error'] = str(e)
        jobs[job_id]['logs'].append({
            'timestamp': time.strftime("%H:%M:%S"),
            'frame': -1,
            'msg': f"Processing failed: {str(e)}",
            'alert': True
        })

@app.route('/api/upload-video', methods=['POST'])
def upload_video():
    """Starts background video processing and returns job ID."""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'error': 'Empty filename'}), 400
        
    try:
        # Save input file
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(input_path)
        
        # Create output file config
        job_id = str(uuid.uuid4())
        output_filename = f"detected_{filename.rsplit('.', 1)[0]}.mp4"
        
        # Start thread
        thread = threading.Thread(
            target=process_video_job, 
            args=(job_id, input_path, output_filename)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'job_id': job_id,
            'original_url': url_for('static', filename=f'uploads/{filename}')
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/video-progress/<job_id>', methods=['GET'])
def video_progress(job_id):
    """Server-Sent Events (SSE) stream for tracking video processing progress."""
    def event_stream():
        last_log_idx = 0
        while True:
            job = jobs.get(job_id)
            if not job:
                yield f"data: {{\"status\": \"not_found\"}}\n\n"
                break
                
            new_logs = job['logs'][last_log_idx:]
            last_log_idx += len(new_logs)
            
            # Prepare message payload
            data = {
                'status': job['status'],
                'progress': job['progress'],
                'logs': new_logs,
                'result_url': job['result_url'],
                'detections_summary': job['detections_summary'],
                'error': job['error']
            }
            
            import json
            yield f"data: {json.dumps(data)}\n\n"
            
            if job['status'] in ['completed', 'failed']:
                break
                
            time.sleep(0.5)
            
    return Response(event_stream(), mimetype='text/event-stream')

# Generate the siren sound at startup
generate_beep_sound()

if __name__ == '__main__':
    # Initialize model early to avoid delay on first load
    try:
        print("Preloading model at startup...")
        load_model()
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Warning: Failed to load model at startup: {e}. Will reload on demand.")
        
    app.run(host='0.0.0.0', port=5000, debug=True)
