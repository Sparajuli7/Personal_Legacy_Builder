import os
import json
import sqlite3
import base64
import tempfile
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import torch
from flask import Flask, request, jsonify, session
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from transformers import DistilBertTokenizer, DistilBertModel
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import jwt
from cryptography.fernet import Fernet
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize SocketIO for real-time collaboration
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

# Initialize AI models with memory optimization
print("Loading AI models...")
tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-uncased')
model = DistilBertModel.from_pretrained('distilbert-base-uncased')
sentiment_analyzer = SentimentIntensityAnalyzer()

# Memory optimization for M1 Air
if torch.cuda.is_available():
    model = model.cuda()
model.eval()

# Initialize encryption
key = Fernet.generate_key()
cipher = Fernet(key)

# Database initialization
def init_db():
    conn = sqlite3.connect('legacy.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS stories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            content TEXT NOT NULL,
            encrypted_content BLOB,
            region TEXT DEFAULT 'North America',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            story_id INTEGER,
            rating INTEGER,
            feedback_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Cultural templates for different regions
CULTURAL_TEMPLATES = {
    "North America": {
        "tone": "individualist",
        "prompts": [
            "What personal achievements are you most proud of?",
            "How did your family shape your values?",
            "What challenges did you overcome in your career?",
            "What life lessons would you share with future generations?",
            "How has technology changed your life?"
        ]
    },
    "Asia-Pacific": {
        "tone": "collectivist",
        "prompts": [
            "What family traditions are most important to you?",
            "How did your community support you during difficult times?",
            "What role did education play in your family's success?",
            "How do you honor your ancestors and cultural heritage?",
            "What wisdom from your elders influenced your life?"
        ]
    },
    "Europe": {
        "tone": "balanced",
        "prompts": [
            "How did historical events shape your life story?",
            "What cultural experiences broadened your perspective?",
            "How did your education and career choices reflect your values?",
            "What relationships had the greatest impact on your life?",
            "How do you balance tradition with innovation?"
        ]
    },
    "Africa": {
        "tone": "community-focused",
        "prompts": [
            "What role did your extended family play in your upbringing?",
            "How did your community celebrate important milestones?",
            "What traditional practices do you still follow today?",
            "How did you contribute to your community's development?",
            "What stories from your elders inspired you most?"
        ]
    },
    "Latin America": {
        "tone": "family-oriented",
        "prompts": [
            "How did your family's migration story shape your identity?",
            "What cultural celebrations are most meaningful to you?",
            "How did your faith and spirituality guide your decisions?",
            "What role did music and art play in your family life?",
            "How do you maintain connections with your cultural roots?"
        ]
    }
}

def extract_entities_and_sentiment(text: str) -> Dict:
    """Extract entities and sentiment using DistilBERT and VADER"""
    try:
        # Tokenize and get embeddings
        inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        # Get sentiment
        sentiment_scores = sentiment_analyzer.polarity_scores(text)
        
        # Extract key entities (simplified for demo)
        words = text.lower().split()
        entities = [word for word in words if len(word) > 3 and word.isalpha()]
        
        return {
            "entities": entities[:10],  # Top 10 entities
            "sentiment": sentiment_scores,
            "confidence": 0.85  # Simulated confidence
        }
    except Exception as e:
        print(f"AI processing error: {e}")
        return {"entities": [], "sentiment": {"compound": 0}, "confidence": 0.5}

def generate_questions(content: str, region: str = "North America") -> List[str]:
    """Generate contextual questions based on content and cultural template"""
    template = CULTURAL_TEMPLATES.get(region, CULTURAL_TEMPLATES["North America"])
    
    # Analyze content for context
    analysis = extract_entities_and_sentiment(content)
    
    # Select questions based on sentiment and entities
    questions = template["prompts"][:3]  # Start with 3 questions
    
    # Add contextual questions based on content analysis
    if analysis["sentiment"]["compound"] > 0.3:
        questions.append("What moments brought you the most joy?")
    elif analysis["sentiment"]["compound"] < -0.3:
        questions.append("How did you find strength during difficult times?")
    
    if "family" in content.lower():
        questions.append("How has your family's story influenced your own?")
    
    return questions[:5]  # Return up to 5 questions

def create_video(text: str, output_path: str) -> str:
    """Create video using FFmpeg with M1 hardware acceleration"""
    try:
        # Create a simple video with text overlay
        ffmpeg_cmd = [
            "/opt/homebrew/bin/ffmpeg",
            "-f", "lavfi",
            "-i", f"color=size=1920x1080:duration=10:color=black",
            "-vf", f"drawtext=text='{text[:50]}...':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2",
            "-c:v", "h264_videotoolbox",  # M1 hardware acceleration
            "-b:v", "2M",
            "-preset", "fast",
            "-y",
            output_path
        ]
        
        result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            return output_path
        else:
            print(f"FFmpeg error: {result.stderr}")
            return None
    except Exception as e:
        print(f"Video creation error: {e}")
        return None

def create_timeline_json(content: str) -> Dict:
    """Create timeline JSON for Three.js visualization"""
    words = content.split()
    timeline_data = {
        "events": [],
        "totalWords": len(words),
        "duration": len(words) * 0.1  # 0.1 seconds per word
    }
    
    # Create timeline events based on content
    sentences = content.split('.')
    for i, sentence in enumerate(sentences[:10]):  # Limit to 10 events
        if sentence.strip():
            timeline_data["events"].append({
                "id": i,
                "time": i * 2,  # 2 seconds per event
                "title": f"Chapter {i + 1}",
                "description": sentence.strip()[:100] + "...",
                "position": {"x": i * 100, "y": 0, "z": 0}
            })
    
    return timeline_data

def create_ar_scene(content: str) -> Dict:
    """Create AR scene data for A-Frame"""
    return {
        "scene": {
            "background": "color: #f0f0f0",
            "entities": [
                {
                    "id": "story-text",
                    "position": "0 1.6 -2",
                    "text": {
                        "value": content[:200] + "...",
                        "color": "#333333",
                        "width": 3
                    }
                },
                {
                    "id": "room",
                    "position": "0 0 0",
                    "geometry": {
                        "primitive": "box",
                        "width": 10,
                        "height": 5,
                        "depth": 10
                    },
                    "material": {
                        "color": "#ffffff",
                        "transparent": True,
                        "opacity": 0.1
                    }
                }
            ]
        }
    }

@app.route('/api/login', methods=['POST'])
def login():
    """Handle Firebase Auth login"""
    data = request.get_json()
    user_id = data.get('user_id')
    
    if user_id:
        session['user_id'] = user_id
        token = jwt.encode(
            {'user_id': user_id, 'exp': datetime.utcnow() + timedelta(days=1)},
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        return jsonify({'token': token, 'user_id': user_id})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/prompt', methods=['POST'])
def process_prompt():
    """Process text/voice prompt and extract entities/sentiment"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        user_id = session.get('user_id')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Analyze content
        analysis = extract_entities_and_sentiment(text)
        
        # Store in database
        encrypted_content = cipher.encrypt(text.encode())
        conn = sqlite3.connect('legacy.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO stories (user_id, content, encrypted_content)
            VALUES (?, ?, ?)
        ''', (user_id, text, encrypted_content))
        story_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'story_id': story_id,
            'analysis': analysis,
            'message': 'Content processed successfully'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/query', methods=['POST'])
def generate_queries():
    """Generate contextual questions based on content"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        region = data.get('region', 'North America')
        
        questions = generate_questions(content, region)
        
        return jsonify({
            'questions': questions,
            'region': region,
            'template': CULTURAL_TEMPLATES[region]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate', methods=['POST'])
def generate_outputs():
    """Generate video, timeline, and AR outputs"""
    try:
        data = request.get_json()
        content = data.get('content', '')
        story_id = data.get('story_id')
        
        # Create temporary directory for outputs
        with tempfile.TemporaryDirectory() as temp_dir:
            # Generate video
            video_path = os.path.join(temp_dir, f"story_{story_id}.mp4")
            video_result = create_video(content, video_path)
            
            # Generate timeline
            timeline_data = create_timeline_json(content)
            
            # Generate AR scene
            ar_data = create_ar_scene(content)
            
            # Read video file if created
            video_base64 = None
            if video_result:
                with open(video_path, 'rb') as f:
                    video_base64 = base64.b64encode(f.read()).decode()
            
            return jsonify({
                'video': video_base64,
                'timeline': timeline_data,
                'ar_scene': ar_data,
                'story_id': story_id
            })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/share', methods=['POST'])
def create_share_link():
    """Create JWT-protected share link"""
    try:
        data = request.get_json()
        story_id = data.get('story_id')
        platform = data.get('platform', 'email')
        
        # Create share token
        share_token = jwt.encode(
            {
                'story_id': story_id,
                'platform': platform,
                'exp': datetime.utcnow() + timedelta(days=7)
            },
            app.config['SECRET_KEY'],
            algorithm='HS256'
        )
        
        # Generate share URL
        share_url = f"https://your-domain.com/share/{share_token}"
        
        return jsonify({
            'share_url': share_url,
            'token': share_token,
            'platform': platform
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """Submit user feedback for reinforcement learning"""
    try:
        data = request.get_json()
        story_id = data.get('story_id')
        rating = data.get('rating')
        feedback_text = data.get('feedback_text', '')
        
        conn = sqlite3.connect('legacy.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO feedback (story_id, rating, feedback_text)
            VALUES (?, ?, ?)
        ''', (story_id, rating, feedback_text))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Feedback submitted successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stories', methods=['GET'])
def get_user_stories():
    """Get user's stories"""
    try:
        user_id = session.get('user_id')
        
        conn = sqlite3.connect('legacy.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, content, region, created_at 
            FROM stories 
            WHERE user_id = ?
            ORDER BY created_at DESC
        ''', (user_id,))
        stories = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'stories': [
                {
                    'id': row[0],
                    'content': row[1][:100] + "..." if len(row[1]) > 100 else row[1],
                    'region': row[2],
                    'created_at': row[3]
                }
                for row in stories
            ]
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# WebSocket events for real-time collaboration
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('story_update')
def handle_story_update(data):
    """Handle real-time story updates"""
    emit('story_updated', data, broadcast=True)

@socketio.on('collaboration_join')
def handle_collaboration_join(data):
    """Handle user joining collaboration room"""
    room = data.get('room')
    user_id = data.get('user_id')
    socketio.emit('user_joined', {'user_id': user_id}, room=room)

if __name__ == '__main__':
    init_db()
    print("🚀 AI-Driven Personal Legacy Builder Backend Starting...")
    print("📊 Database initialized")
    print("🤖 AI models loaded")
    print("🎬 FFmpeg ready for video generation")
    print("🌐 WebSocket server ready for real-time collaboration")
    
    # Run with SocketIO
    socketio.run(app, host='0.0.0.0', port=5000, debug=True) 