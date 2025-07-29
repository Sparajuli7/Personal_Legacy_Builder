#!/bin/bash

echo "🚀 Setting up AI-Driven Personal Legacy Builder..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install FFmpeg with hardware acceleration for M1
echo "🎬 Installing FFmpeg with M1 hardware acceleration..."
brew install ffmpeg

# Install Node.js and npm
echo "📦 Installing Node.js..."
brew install node

# Install Python 3.9
echo "🐍 Installing Python 3.9..."
brew install python@3.9

# Create virtual environment
echo "🔧 Setting up Python virtual environment..."
cd backend
python3.9 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd ../frontend
npm install

# Create environment files
echo "⚙️ Creating environment files..."
cd ..

# Frontend .env
cat > frontend/.env << EOF
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
REACT_APP_BACKEND_URL=http://localhost:5000
EOF

# Backend .env
cat > backend/.env << EOF
FLASK_ENV=development
FLASK_APP=main.py
SECRET_KEY=your_secret_key_here
FIREBASE_PROJECT_ID=your_project_id
GOOGLE_DRIVE_CLIENT_ID=your_google_drive_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_drive_client_secret
IPFS_NODE_URL=http://localhost:5001
EOF

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Firebase: https://console.firebase.google.com"
echo "2. Update frontend/.env with your Firebase config"
echo "3. Update backend/.env with your API keys"
echo "4. Run: cd backend && source venv/bin/activate && flask run"
echo "5. Run: cd frontend && npm start"
echo ""
echo "🎯 Demo ready for July 29, 2025!" 