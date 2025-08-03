# Firebase Setup Guide for Hoshino

## Overview
This guide will help you set up Firebase for API communication in your Hoshino React Native app. The setup includes Firebase Functions for AI chat and Firestore for data storage.

**Note**: This setup is specifically for a React Native mobile app. You do NOT need Firebase Hosting (which is only for web applications).

## What You Need vs Don't Need

### ✅ Required for Your React Native App:
- **Firebase Functions** - For AI chat API
- **Firestore Database** - For storing conversation data  
- **Firebase Config** - For connecting your app to Firebase

### ❌ NOT Needed for Your React Native App:
- **Firebase Hosting** - Only for web applications
- **Firebase Auth** - Optional, can add later for user accounts
- **Firebase Storage** - Optional, only if you want to store images/files

## Prerequisites
- Firebase project created
- Node.js installed
- Firebase CLI installed (`npm install -g firebase-tools`)

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "hoshino-game")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Get Firebase Configuration
1. In Firebase Console, go to Project Settings
2. Scroll down to "Your apps" section
3. Click "Add app" → "Web app" (Note: Use "Web app" even for React Native apps)
4. Register app with name "Hoshino React Native"
5. Copy the config object

### 1.3 Update Firebase Config
Replace the placeholder values in `src/config/firebase.ts` with your actual Firebase project configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

**Note**: This same configuration format works for both web apps and React Native apps using the `firebase` package.

## Step 2: Firebase Functions Setup

### 2.1 Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 2.2 Login to Firebase
```bash
firebase login
```

### 2.3 Navigate to Firebase Functions Directory
```bash
cd backend/firebase
```

### 2.4 Install Dependencies
```bash
cd functions
npm install
```

### 2.5 Set OpenAI API Key
```bash
firebase functions:config:set openai.key="your-openai-api-key"
```

### 2.6 Deploy Functions
```bash
firebase deploy --only functions
```

**Note**: We're only deploying functions, not hosting (since this is a mobile app).

### 2.7 Get Functions URL
After deployment, note the functions URL from the output. It will look like:
`https://us-central1-your-project-id.cloudfunctions.net`

## Step 3: Update Firebase Service Configuration

### 3.1 Update Functions Base URL
In `src/services/FirebaseService.ts`, replace:
```typescript
const FIREBASE_FUNCTIONS_BASE_URL = 'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net';
```

With your actual functions URL:
```typescript
const FIREBASE_FUNCTIONS_BASE_URL = 'https://us-central1-your-project-id.cloudfunctions.net';
```

## Step 4: Firestore Database Setup

### 4.1 Create Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (preferably close to your users)

### 4.2 Set Firestore Rules
Update `backend/firebase/firestore.rules` with appropriate rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Allow public read access to character data
    match /characters/{characterId} {
      allow read: if true;
    }
  }
}
```

### 4.3 Deploy Firestore Rules
```bash
cd backend/firebase
firebase deploy --only firestore:rules
```

**Note**: We're only deploying Firestore rules, not hosting (since this is a mobile app).

## Step 5: Test the Setup

### 5.1 Test Firebase Connection
Add this test function to your app temporarily:

```typescript
// In any component, add this test function
const testFirebaseConnection = async () => {
  try {
    const health = await FirebaseService.healthCheck();
    console.log('Firebase connection successful:', health);
    Alert.alert('Success', 'Firebase connection working!');
  } catch (error) {
    console.error('Firebase connection failed:', error);
    Alert.alert('Error', 'Firebase connection failed');
  }
};
```

### 5.2 Test Chat Function
Try sending a message in the CharacterChat component to verify the AI chat is working.

## Step 6: Environment Variables (Optional but Recommended)

### 6.1 Create Environment File
Create `.env` file in project root:
```
FIREBASE_API_KEY=your-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net
OPENAI_API_KEY=your-openai-key
```

### 6.2 Install Environment Package
```bash
npm install react-native-dotenv
```

### 6.3 Update Babel Config
Add to `babel.config.js`:
```javascript
module.exports = {
  plugins: [
    ["module:react-native-dotenv", {
      "moduleName": "@env",
      "path": ".env",
    }]
  ]
};
```

### 6.4 Update Firebase Config
```typescript
import { FIREBASE_API_KEY, FIREBASE_PROJECT_ID } from '@env';

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  projectId: FIREBASE_PROJECT_ID,
  // ... other config
};
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your Firebase Functions have CORS enabled (already configured in the functions)

2. **Network Errors**: Check that your functions URL is correct and the functions are deployed

3. **Authentication Errors**: For now, the app uses anonymous users. You can add Firebase Auth later if needed

4. **OpenAI API Errors**: Make sure your OpenAI API key is set correctly in Firebase Functions config

### Debug Steps:

1. Check Firebase Console for function logs
2. Use `firebase functions:log` to see real-time logs
3. Test functions directly with curl or Postman
4. Check network tab in browser dev tools for request/response details

## Next Steps

1. **Add Authentication**: Implement Firebase Auth for user management
2. **Add Offline Support**: Implement Firestore offline persistence
3. **Add Push Notifications**: Implement Firebase Cloud Messaging
4. **Add Analytics**: Implement Firebase Analytics for user behavior tracking
5. **Add Crash Reporting**: Implement Firebase Crashlytics

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Firestore Rules**: Always set appropriate security rules
3. **Function Security**: Add authentication to your Firebase Functions
4. **Rate Limiting**: Consider implementing rate limiting for chat functions

## Support

If you encounter issues:
1. Check Firebase Console for error logs
2. Verify all configuration values are correct
3. Test functions individually using Firebase CLI
4. Check network connectivity and CORS settings 