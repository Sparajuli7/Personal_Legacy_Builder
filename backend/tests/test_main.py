import pytest
import json
import tempfile
import os
from unittest.mock import patch, MagicMock
from backend.main import app, init_db, extract_entities_and_sentiment, generate_questions, create_video, create_timeline_json, create_ar_scene

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    with app.test_client() as client:
        with app.app_context():
            init_db()
            yield client

@pytest.fixture
def auth_headers():
    return {'Content-Type': 'application/json'}

class TestAuthentication:
    def test_login_success(self, client, auth_headers):
        data = {'user_id': 'test-user-123'}
        response = client.post('/api/login', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'token' in result
        assert result['user_id'] == 'test-user-123'

    def test_login_failure(self, client, auth_headers):
        data = {}
        response = client.post('/api/login', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 401

class TestPromptProcessing:
    @patch('backend.main.extract_entities_and_sentiment')
    def test_process_prompt_success(self, mock_extract, client, auth_headers):
        # Mock session
        with client.session_transaction() as sess:
            sess['user_id'] = 'test-user-123'
        
        mock_extract.return_value = {
            'entities': ['family', 'childhood'],
            'sentiment': {'compound': 0.5},
            'confidence': 0.85
        }
        
        data = {'text': 'My childhood in 1990s New York was amazing.'}
        response = client.post('/api/prompt', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'story_id' in result
        assert 'analysis' in result

    def test_process_prompt_no_text(self, client, auth_headers):
        with client.session_transaction() as sess:
            sess['user_id'] = 'test-user-123'
        
        data = {'text': ''}
        response = client.post('/api/prompt', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 400

    def test_process_prompt_no_session(self, client, auth_headers):
        data = {'text': 'Test story'}
        response = client.post('/api/prompt', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 500

class TestQueryGeneration:
    def test_generate_queries_success(self, client, auth_headers):
        data = {
            'content': 'My family moved to New York in the 1990s.',
            'region': 'North America'
        }
        response = client.post('/api/query', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'questions' in result
        assert 'region' in result
        assert 'template' in result

    def test_generate_queries_different_region(self, client, auth_headers):
        data = {
            'content': 'Our family traditions are very important.',
            'region': 'Asia-Pacific'
        }
        response = client.post('/api/query', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['region'] == 'Asia-Pacific'

class TestOutputGeneration:
    @patch('backend.main.create_video')
    @patch('backend.main.create_timeline_json')
    @patch('backend.main.create_ar_scene')
    def test_generate_outputs_success(self, mock_ar, mock_timeline, mock_video, client, auth_headers):
        mock_video.return_value = '/tmp/test_video.mp4'
        mock_timeline.return_value = {'events': [], 'totalWords': 10}
        mock_ar.return_value = {'scene': {'entities': []}}
        
        data = {
            'content': 'My childhood story',
            'story_id': 123
        }
        response = client.post('/api/generate', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'video' in result
        assert 'timeline' in result
        assert 'ar_scene' in result

    def test_generate_outputs_no_content(self, client, auth_headers):
        data = {'content': '', 'story_id': 123}
        response = client.post('/api/generate', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 500

class TestSharing:
    def test_create_share_link_success(self, client, auth_headers):
        data = {
            'story_id': 123,
            'platform': 'twitter'
        }
        response = client.post('/api/share', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'share_url' in result
        assert 'token' in result
        assert result['platform'] == 'twitter'

    def test_create_share_link_different_platform(self, client, auth_headers):
        data = {
            'story_id': 123,
            'platform': 'instagram'
        }
        response = client.post('/api/share', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert result['platform'] == 'instagram'

class TestFeedback:
    def test_submit_feedback_success(self, client, auth_headers):
        data = {
            'story_id': 123,
            'rating': 5,
            'feedback_text': 'Great experience!'
        }
        response = client.post('/api/feedback', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'message' in result

    def test_submit_feedback_no_rating(self, client, auth_headers):
        data = {
            'story_id': 123,
            'feedback_text': 'Test feedback'
        }
        response = client.post('/api/feedback', 
                             data=json.dumps(data), 
                             headers=auth_headers)
        
        assert response.status_code == 200

class TestStories:
    def test_get_user_stories_success(self, client, auth_headers):
        with client.session_transaction() as sess:
            sess['user_id'] = 'test-user-123'
        
        response = client.get('/api/stories', headers=auth_headers)
        
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'stories' in result

    def test_get_user_stories_no_session(self, client, auth_headers):
        response = client.get('/api/stories', headers=auth_headers)
        
        assert response.status_code == 500

class TestAIProcessing:
    @patch('backend.main.tokenizer')
    @patch('backend.main.model')
    @patch('backend.main.sentiment_analyzer')
    def test_extract_entities_and_sentiment_success(self, mock_sentiment, mock_model, mock_tokenizer):
        mock_tokenizer.return_tensors = {'input_ids': MagicMock(), 'attention_mask': MagicMock()}
        mock_model.return_value = MagicMock()
        mock_sentiment.polarity_scores.return_value = {'compound': 0.5}
        
        result = extract_entities_and_sentiment('Test story about family')
        
        assert 'entities' in result
        assert 'sentiment' in result
        assert 'confidence' in result

    def test_generate_questions_north_america(self):
        content = 'My personal achievements include graduating from college.'
        questions = generate_questions(content, 'North America')
        
        assert len(questions) <= 5
        assert any('achievements' in q.lower() or 'proud' in q.lower() for q in questions)

    def test_generate_questions_asia_pacific(self):
        content = 'Our family traditions are very important to us.'
        questions = generate_questions(content, 'Asia-Pacific')
        
        assert len(questions) <= 5
        assert any('family' in q.lower() or 'traditions' in q.lower() for q in questions)

class TestMultimediaGeneration:
    @patch('subprocess.run')
    def test_create_video_success(self, mock_run):
        mock_run.return_value.returncode = 0
        
        result = create_video('Test story', '/tmp/test.mp4')
        
        assert result == '/tmp/test.mp4'

    @patch('subprocess.run')
    def test_create_video_failure(self, mock_run):
        mock_run.return_value.returncode = 1
        mock_run.return_value.stderr = 'FFmpeg error'
        
        result = create_video('Test story', '/tmp/test.mp4')
        
        assert result is None

    def test_create_timeline_json(self):
        content = 'This is a test story. It has multiple sentences. Each sentence creates an event.'
        result = create_timeline_json(content)
        
        assert 'events' in result
        assert 'totalWords' in result
        assert 'duration' in result
        assert len(result['events']) > 0

    def test_create_ar_scene(self):
        content = 'This is a test story for AR visualization.'
        result = create_ar_scene(content)
        
        assert 'scene' in result
        assert 'entities' in result['scene']
        assert len(result['scene']['entities']) > 0

class TestCulturalTemplates:
    def test_north_america_template(self):
        from backend.main import CULTURAL_TEMPLATES
        
        template = CULTURAL_TEMPLATES['North America']
        assert template['tone'] == 'individualist'
        assert len(template['prompts']) == 5
        assert any('achievements' in prompt.lower() for prompt in template['prompts'])

    def test_asia_pacific_template(self):
        from backend.main import CULTURAL_TEMPLATES
        
        template = CULTURAL_TEMPLATES['Asia-Pacific']
        assert template['tone'] == 'collectivist'
        assert len(template['prompts']) == 5
        assert any('family' in prompt.lower() for prompt in template['prompts'])

    def test_europe_template(self):
        from backend.main import CULTURAL_TEMPLATES
        
        template = CULTURAL_TEMPLATES['Europe']
        assert template['tone'] == 'balanced'
        assert len(template['prompts']) == 5

    def test_africa_template(self):
        from backend.main import CULTURAL_TEMPLATES
        
        template = CULTURAL_TEMPLATES['Africa']
        assert template['tone'] == 'community-focused'
        assert len(template['prompts']) == 5

    def test_latin_america_template(self):
        from backend.main import CULTURAL_TEMPLATES
        
        template = CULTURAL_TEMPLATES['Latin America']
        assert template['tone'] == 'family-oriented'
        assert len(template['prompts']) == 5

class TestDatabaseOperations:
    def test_database_initialization(self):
        # This test ensures the database can be initialized
        init_db()
        # If no exception is raised, the test passes
        assert True

    def test_encryption_functionality(self):
        from backend.main import cipher
        
        test_text = 'This is a test story'
        encrypted = cipher.encrypt(test_text.encode())
        decrypted = cipher.decrypt(encrypted).decode()
        
        assert decrypted == test_text

class TestErrorHandling:
    def test_ai_processing_error_handling(self):
        # Test that AI processing errors are handled gracefully
        with patch('backend.main.tokenizer') as mock_tokenizer:
            mock_tokenizer.side_effect = Exception('AI model error')
            
            result = extract_entities_and_sentiment('Test story')
            
            assert result['entities'] == []
            assert result['confidence'] == 0.5

    def test_video_creation_error_handling(self):
        with patch('subprocess.run') as mock_run:
            mock_run.side_effect = Exception('FFmpeg not found')
            
            result = create_video('Test story', '/tmp/test.mp4')
            
            assert result is None

class TestWebSocketEvents:
    def test_socket_connect(self, client):
        with client.test_client() as test_client:
            response = test_client.get('/socket.io/')
            assert response.status_code == 200

    def test_socket_events(self):
        # Test that socket events are properly handled
        from backend.main import socketio
        
        # This is a basic test - in a real scenario you'd test actual socket events
        assert socketio is not None

if __name__ == '__main__':
    pytest.main([__file__, '-v', '--cov=backend', '--cov-report=term-missing']) 