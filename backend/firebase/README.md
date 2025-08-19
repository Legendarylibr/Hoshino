# Hoshino Firebase Backend

This is the Firebase backend for the Hoshino moonling game, providing AI chat functionality, global data persistence, and user progress tracking.

## Features

- 🤖 **AI Chat**: OpenAI-powered conversations with moonling characters
- 🏆 **Global Leaderboard**: Real-time player rankings and achievements
- 🎖️ **Achievement System**: User progress tracking and milestone management
- 📊 **User Progress**: Centralized storage for achievements, milestones, and memories
- 🔥 **Firebase Functions**: Serverless backend deployment
- 📊 **Firestore**: Database for conversation history, user data, and global rankings
- 🔐 **Security**: Proper authentication and authorization rules
- 🌐 **CORS**: Cross-origin support for React Native app

## Setup Instructions

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase Project
```bash
cd backend/firebase
firebase init
```

Select:
- Functions
- Firestore
- Hosting (optional)

### 4. Set OpenAI API Key
```bash
firebase functions:config:set openai.key="your_openai_api_key_here"
```

### 5. Install Dependencies
```bash
 cd functions
npm install
```

### 6. Deploy to Firebase
```bash
firebase deploy
```

## API Endpoints

### Chat with Moonling
```
POST /chat
```

**Request Body:**
```json
{
  "message": "Hello Lyra!",
  "moonlingId": "lyra",
  "userId": "user123",
  "conversationId": "optional_conversation_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hello there! 🌟 I'm so happy you're talking to me! What anime have you been watching lately?",
  "moonlingName": "Lyra",
  "conversationId": "conversation_123",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Conversation History
```
GET /getConversation?conversationId=123&userId=user123
```

### Global Leaderboard
```
GET /getGlobalLeaderboard
```

**Response:**
```json
{
  "success": true,
  "leaderboard": [
    {
      "id": "user123",
      "username": "CosmicMaster",
      "walletAddress": "0x1234...5678",
      "totalScore": 15420,
      "achievements": 18,
      "moonlings": 5,
      "rank": 1,
      "avatar": "🌟",
      "lastActive": "2024-01-15T10:30:00.000Z",
      "starFragments": 1500,
      "currentStreak": 7
    }
  ],
  "totalPlayers": 1,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

### Get User Progress
```
GET /getUserAchievements?walletAddress=0x1234...5678
```

**Response:**
```json
{
  "success": true,
  "achievements": [...],
  "milestones": [...],
  "memories": [...],
  "stats": {
    "totalAchievements": 6,
    "totalMilestones": 5,
    "totalMemories": 3,
    "completionRate": 100
  }
}
```

### Update User Progress
```
POST /updateUserProgress
```

**Request Body:**
```json
{
  "walletAddress": "0x1234...5678",
  "type": "score_update",
  "data": {
    "totalScore": 15420,
    "achievements": 18,
    "moonlings": 5,
    "starFragments": 1500,
    "currentStreak": 7
  }
}
```

### Unlock Achievement
```
POST /unlockAchievement
```

**Request Body:**
```json
{
  "walletAddress": "0x1234...5678",
  "achievementId": "first-feed",
  "achievementData": {
    "title": "First Feeding",
    "description": "Feed your moonling for the first time",
    "icon": "🍽️",
    "category": "feeding",
    "rarity": "common"
  }
}
```

### Add Milestone
```
POST /addMilestone
```

**Request Body:**
```json
{
  "walletAddress": "0x1234...5678",
  "milestoneId": "7-days",
  "milestoneData": {
    "title": "Week Warrior",
    "description": "Play for 7 consecutive days",
    "icon": "📅",
    "type": "days",
    "value": 7
  }
}
```

### Add Memory
```
POST /addMemory
```

**Request Body:**
```json
{
  "walletAddress": "0x1234...5678",
  "memoryId": "first-day",
  "memoryData": {
    "title": "First Day Together",
    "description": "The beginning of our cosmic journey",
    "type": "special",
    "mood": 5,
    "energy": 5,
    "hunger": 5
  }
}
```

### Health Check
```
GET /health
```

## Firestore Collections

### `users/{walletAddress}`
User profiles and progress data
```json
{
  "walletAddress": "0x1234...5678",
  "totalScore": 15420,
  "achievements": 18,
  "moonlings": 5,
  "starFragments": 1500,
  "currentStreak": 7,
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

### `user_achievements/{walletAddress}`
User achievements, milestones, and memories
```json
{
  "achievements": [...],
  "milestones": [...],
  "memories": [...],
  "stats": {...}
}
```

### `leaderboard/{walletAddress}`
Global leaderboard entries
```json
{
  "walletAddress": "0x1234...5678",
  "totalScore": 15420,
  "achievements": 18,
  "moonlings": 5,
  "lastActive": "2024-01-15T10:30:00.000Z",
  "starFragments": 1500,
  "currentStreak": 7
}
```

### `conversations/{conversationId}`
Chat conversation history
```json
{
  "id": "conversation_123",
  "userId": "user123",
  "moonlingId": "lyra",
  "messages": [...],
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

## Moonling Characters

Each moonling has a unique personality:

- **Lyra**: Anime-obsessed, emotional, comprehensive
- **Orion**: Mystical, protective, wise
- **Aro**: Energetic, optimistic, encouraging
- **Sirius**: Intense, loyal, powerful
- **Zaniah**: Mysterious, contemplative, wise

## Environment Variables

Set these in Firebase Functions config:

```bash
firebase functions:config:set openai.key="your_openai_api_key"
firebase functions:config:set openai.model="gpt-4"
firebase functions:config:set openai.max_tokens="150"
```

## Local Development

### Run Firebase Emulator
```bash
firebase emulators:start
```

### Test Functions Locally
```bash
cd functions
npm run serve
```

## Security

- All endpoints require proper authentication
- Firestore rules ensure users can only access their own data
- Leaderboard data is publicly readable but only writable by the user
- Rate limiting is handled by Firebase Functions
- CORS is configured for React Native app

## Deployment

The backend will be deployed to:
- **Functions**: `https://us-central1-your-project.cloudfunctions.net/`
- **Firestore**: Database for user data, achievements, and leaderboards
- **Hosting**: Optional web interface

## Integration with React Native

Update your React Native app to use the Firebase Functions endpoints:

```javascript
// Get global leaderboard
const leaderboard = await FirebaseService.getGlobalLeaderboard();

// Get user progress
const userProgress = await FirebaseService.getUserProgress(walletAddress);

// Update user progress
await FirebaseService.updateUserProgress(walletAddress, 'score_update', {
  totalScore: 15420,
  achievements: 18
});

// Unlock achievement
await FirebaseService.unlockAchievement(walletAddress, 'first-feed', {
  title: 'First Feeding',
  description: 'Feed your moonling for the first time'
});
```

## Cost Considerations

- **Firebase Functions**: Pay per invocation
- **Firestore**: Pay per read/write operation
- **OpenAI API**: Pay per token used

Monitor usage in Firebase Console and OpenAI dashboard. 