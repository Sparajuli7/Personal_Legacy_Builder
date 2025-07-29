# 🚀 Manual Setup Guide for Personal Legacy Builder

## 📋 Overview
This guide will help you set up the Personal Legacy Builder application on your MacBook M1 Air. Even if you're not technical, follow these steps carefully and you'll have the app running in about 30 minutes.

## 🎯 What You'll Get
- A working web application that creates AI-powered personal stories
- Voice and text input capabilities
- Video, timeline, and AR outputs
- Real-time collaboration features
- Cultural sensitivity options

## ⚠️ Prerequisites
- MacBook M1 Air (or compatible Mac)
- macOS Ventura or later
- At least 8GB RAM
- Chrome or Safari browser
- Stable internet connection

## 🛠️ Step-by-Step Setup

### Step 1: Open Terminal
1. Press `Cmd + Space` to open Spotlight Search
2. Type "Terminal" and press Enter
3. You'll see a black window with white text - this is Terminal

### Step 2: Navigate to Project Folder
1. In Terminal, type: `cd /Users/shreyash/Downloads/Personal_Legacy_Builder`
2. Press Enter
3. You should see the folder name in the prompt

### Step 3: Make Setup Script Executable
1. Type: `chmod +x setup.sh`
2. Press Enter
3. No output means it worked successfully

### Step 4: Run Automated Setup
1. Type: `./setup.sh`
2. Press Enter
3. **This will take 10-15 minutes** - don't close Terminal!
4. You'll see progress messages like:
   - "Installing Homebrew..."
   - "Installing FFmpeg..."
   - "Installing Python dependencies..."
   - "Installing Node.js dependencies..."

### Step 5: Create Environment Files
After the setup completes, create two configuration files:

#### Create Frontend Configuration:
1. Type: `cat > frontend/.env << 'EOF'`
2. Press Enter
3. Copy and paste this text:
```
REACT_APP_FIREBASE_API_KEY=demo_key_for_presentation
REACT_APP_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=demo-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
REACT_APP_BACKEND_URL=http://localhost:5000
```
4. Press Enter
5. Type: `EOF`
6. Press Enter

#### Create Backend Configuration:
1. Type: `cat > backend/.env << 'EOF'`
2. Press Enter
3. Copy and paste this text:
```
FLASK_ENV=development
FLASK_APP=main.py
SECRET_KEY=demo_secret_key_for_presentation
FIREBASE_PROJECT_ID=demo-project-id
GOOGLE_DRIVE_CLIENT_ID=demo_client_id
GOOGLE_DRIVE_CLIENT_SECRET=demo_client_secret
IPFS_NODE_URL=http://localhost:5001
```
4. Press Enter
5. Type: `EOF`
6. Press Enter

### Step 6: Start the Backend Server
1. Type: `cd backend`
2. Press Enter
3. Type: `source venv/bin/activate`
4. Press Enter (you'll see `(venv)` in the prompt)
5. Type: `flask run --port 5000`
6. Press Enter
7. You should see: "Running on http://127.0.0.1:5000"
8. **Keep this Terminal window open!**

### Step 7: Start the Frontend (New Terminal)
1. Press `Cmd + T` to open a new Terminal tab
2. Type: `cd /Users/shreyash/Downloads/Personal_Legacy_Builder/frontend`
3. Press Enter
4. Type: `npm start`
5. Press Enter
6. Wait 2-3 minutes for it to start
7. Your browser should automatically open to `http://localhost:3000`

## 🎉 Success Indicators
- Backend Terminal shows: "Running on http://127.0.0.1:5000"
- Frontend Terminal shows: "Local: http://localhost:3000"
- Browser opens to the Personal Legacy Builder app
- You see a welcome screen with "AI-Driven Personal Legacy Builder"

## 🧪 Testing the Application

### Test 1: Basic Navigation
1. Click through the onboarding tutorial
2. Try the "Skip Tutorial" button
3. Verify the app loads without errors

### Test 2: Story Input
1. Type: "My childhood in 1990s New York was amazing"
2. Click "Submit Story"
3. You should see AI-generated questions appear

### Test 3: Voice Input
1. Click the microphone button
2. Speak a short sentence
3. Verify your speech appears as text

### Test 4: Cultural Context
1. Select different regions (North America, Asia-Pacific)
2. Notice how the AI questions change
3. This demonstrates cultural sensitivity

### Test 5: Multimedia Generation
1. Click "Generate Outputs"
2. Wait for video/timeline/AR to generate
3. Try switching between different output tabs

## 🚨 Troubleshooting

### Problem: "Command not found"
**Solution**: The setup script didn't run properly. Try:
1. Close Terminal completely
2. Reopen Terminal
3. Run `./setup.sh` again

### Problem: "Port 5000 already in use"
**Solution**: 
1. In the backend Terminal, press `Ctrl + C`
2. Type: `lsof -ti:5000 | xargs kill -9`
3. Then run `flask run --port 5000` again

### Problem: "npm start" fails
**Solution**:
1. In the frontend Terminal, press `Ctrl + C`
2. Type: `npm install`
3. Wait for installation to complete
4. Type: `npm start` again

### Problem: Browser doesn't open automatically
**Solution**:
1. Open Chrome or Safari manually
2. Go to: `http://localhost:3000`

### Problem: "Module not found" errors
**Solution**:
1. Stop both servers (`Ctrl + C` in both Terminals)
2. In frontend Terminal: `npm install`
3. In backend Terminal: `pip install -r requirements.txt`
4. Restart both servers

## 📱 Demo Mode Features

### What Works in Demo Mode:
- ✅ All UI components and navigation
- ✅ Story input (text and voice)
- ✅ AI question generation
- ✅ Cultural context switching
- ✅ Multimedia output generation
- ✅ Collaboration interface
- ✅ Offline storage simulation
- ✅ Accessibility features

### What's Simulated:
- 🔄 Firebase authentication (uses demo credentials)
- 🔄 Video generation (shows UI, uses placeholder)
- 🔄 Real-time collaboration (shows interface)
- 🔄 Cloud storage (simulated locally)

## 🎯 Live Demo Script

### Introduction (2 minutes)
"Welcome to the AI-Driven Personal Legacy Builder. This application helps people create meaningful digital stories using artificial intelligence. It's designed to be senior-friendly and culturally sensitive."

### Key Features to Demonstrate:
1. **Accessibility**: Show keyboard navigation and high-contrast mode
2. **Voice Input**: Demonstrate speech recognition
3. **Cultural Sensitivity**: Switch between regions to show different AI questions
4. **AI Integration**: Show entity extraction and sentiment analysis
5. **Multimedia Outputs**: Generate video, timeline, and AR content
6. **Collaboration**: Show real-time editing interface
7. **Offline Mode**: Demonstrate IndexedDB storage

### Demo Flow:
1. Start with onboarding tutorial
2. Input a story: "My grandmother taught me to cook when I was 10"
3. Show AI-generated questions
4. Generate multimedia outputs
5. Demonstrate sharing features
6. Show collaboration room

## 🔧 Advanced Configuration (Optional)

### For Production Use:
1. Create a Firebase project at https://console.firebase.google.com
2. Replace demo credentials in `.env` files
3. Set up Google Drive API for cloud storage
4. Configure IPFS node for decentralized storage

### Performance Optimization:
- The app is optimized for M1 MacBook Air
- FFmpeg uses hardware acceleration
- AI models are memory-optimized
- Frontend bundle is under 50KB

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure both Terminal windows are running
3. Verify internet connection
4. Restart the application if needed

## 🎉 Congratulations!

You've successfully set up the Personal Legacy Builder application! The app is now ready for:
- Personal use and storytelling
- Live demonstrations
- Development and testing
- Production deployment

The application demonstrates cutting-edge web technologies including AI, real-time collaboration, multimedia generation, and cultural sensitivity - all optimized for the modern web experience. 