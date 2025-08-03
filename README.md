# Hoshino - Cosmic Moonling Game

A React Native game where you care for cosmic creatures called moonlings.

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/hoshino.git
cd hoshino
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

#### Option A: Use Shared Firebase (Recommended)
The project uses a shared Firebase project. Get the Firebase configuration from your team lead and create a `.env` file with the provided values.

#### Option B: Use Your Own Firebase
If you want to use your own Firebase project:
```bash
cp env.example .env
# Fill in your own Firebase configuration
```

### 4. Backend Setup (Firebase Functions) - Optional

Only needed if you want to deploy Firebase Functions or modify the backend:

Set up the backend API keys (each developer needs their own):
```bash
cd backend/firebase
firebase login
firebase use hoshino-996d0
firebase functions:config:set openai.key="your_openai_api_key"
firebase functions:config:set gemini.key="your_gemini_api_key"
firebase deploy --only functions
```

**Note**: Most developers only need the frontend setup. The backend is already deployed and working.

### 5. Run the App
```bash
npm start
```

## Development

- **Frontend**: React Native with Expo
- **Backend**: Firebase Functions with OpenAI/Gemini
- **Database**: Firestore
- **Authentication**: Solana wallet integration

## Security

- Firebase config is shared across all developers
- OpenAI/Gemini keys are set individually per developer
- See `SECURITY.md` for detailed security setup

## Contributing

1. Fork the repository
2. Create your feature branch
3. Set up environment variables
4. Make your changes
5. Submit a pull request 