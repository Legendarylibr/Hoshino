# Security Setup

## Environment Variables

This project uses environment variables to keep API keys and sensitive configuration secure. Never commit actual API keys to the repository.

### Required Environment Variables

#### Frontend (.env file)
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

#### Backend (Firebase Functions)
Set these in Firebase Functions environment:
```bash
firebase functions:config:set openai.key="your_openai_api_key"
firebase functions:config:set gemini.key="your_gemini_api_key"
```

### Setup Instructions

1. Copy `env.example` to `.env`
2. Fill in your actual API keys in the `.env` file
3. For Firebase Functions, set the environment variables using the Firebase CLI
4. Never commit the `.env` file to version control
