# Hoshino - Cosmic Moonling Game

A React Native game where you care for cosmic creatures called moonlings, with full NFT minting capabilities.

## Prerequisites

Before you begin, you'll need:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go app** on your phone (available on App Store/Google Play)
- **Firebase CLI** (`npm install -g firebase-tools`) - for backend deployment

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

### 4. Backend Setup (Firebase Functions) - NFT Minting

The project includes a complete NFT minting backend with the following features:

- 🎨 **Character NFT Minting**: Mint character NFTs with mood traits
- 🏆 **Achievement NFT Minting**: Mint achievement/badge NFTs  
- 🛍️ **Marketplace Item Minting**: Mint marketplace item NFTs
- 🌙 **Mood-Based Traits**: Uses mood instead of rarity for character uniqueness

#### Deploy the Backend

Set up the backend API keys (each developer needs their own):
```bash
cd backend/firebase
firebase login
firebase use hoshino-996d0
firebase functions:config:set openai.key="your_openai_api_key"
firebase functions:config:set gemini.key="your_gemini_api_key"
firebase deploy --only functions
```

Or use the deployment script:
```bash
cd backend/firebase
./deploy.sh
```

**Note**: Most developers only need the frontend setup. The backend is already deployed and working.

### 5. Run the App

#### For Development (Recommended)
```bash
npm start
```

This will:
- Start the Expo development server
- Open the Expo DevTools in your browser
- Show a QR code for mobile testing

#### For Mobile Testing

1. **Install Expo Go** on your phone:
   - **iOS**: Download from App Store
   - **Android**: Download from Google Play Store

2. **Connect to Development Server**:
   - **iOS**: Open Camera app and scan the QR code
   - **Android**: Open Expo Go app and scan the QR code
   - **Alternative**: Enter the URL manually in Expo Go

## NFT Minting Features

### Character NFTs
- Mint your moonling characters as NFTs
- Each character has unique mood traits (Happy, Sad, Angry, etc.)
- Characters are stored on Solana blockchain as programmable NFTs

### Achievement NFTs
- Earn achievements by playing the game
- Mint achievements as collectible NFTs
- Achievements have special mood traits (Proud, Excited, etc.)

### Marketplace Items
- Purchase items from the in-game marketplace
- Items are minted as NFTs with category and mood traits
- Trade items with other players

### Mood System
Instead of traditional rarity, NFTs use a mood system:
- **Happy**: Default mood for new characters
- **Proud**: Used for achievements
- **Excited**: Used for marketplace items
- **Sad/Angry/Calm**: Applied based on game state

## API Endpoints

The backend provides these NFT minting endpoints:

- `POST /mintCharacter` - Mint character NFTs
- `POST /mintAchievement` - Mint achievement NFTs
- `POST /mintMarketplaceItem` - Mint marketplace item NFTs
- `GET /health` - Check backend health
- `GET /solanaHealth` - Check Solana connection

## Game Features

### Core Gameplay
- **Character Selection**: Choose from 5 unique moonling characters
- **Feeding System**: Feed your moonlings to keep them happy
- **Sleep Mode**: Put moonlings to sleep for energy restoration
- **Mood System**: Character moods change based on care and interactions
- **Achievement System**: Earn achievements through gameplay

### NFT Integration
- **Wallet Connection**: Connect your Solana wallet (Phantom, Solflare, etc.)
- **NFT Minting**: Mint characters and achievements as NFTs
- **Blockchain Storage**: All NFTs stored on Solana blockchain
- **Metadata**: Rich metadata with mood traits and character information

### Technical Features
- **React Native**: Cross-platform mobile development
- **Expo**: Easy development and deployment
- **Firebase**: Backend services and AI chat
- **Solana**: Blockchain integration for NFTs
- **Mobile Wallet Adapter**: Secure wallet integration

## Development

### Project Structure
```
hoshino/
├── src/
│   ├── components/          # React components
│   ├── services/           # Business logic and API calls
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts
│   └── config/            # Configuration files
├── backend/
│   └── firebase/          # Firebase Functions backend
├── assets/                # Images and static assets
└── docs/                  # Documentation
```

### Key Services
- `ProgrammableNFTService`: Handles NFT minting operations
- `ChatService`: AI chat with moonling characters
- `FirebaseService`: Backend communication
- `WalletContext`: Wallet connection management

### Adding New Features
1. Create components in `src/components/`
2. Add services in `src/services/`
3. Create hooks in `src/hooks/`
4. Update backend functions in `backend/firebase/functions/`

## Deployment

### Frontend (Expo)
```bash
# Build for production
expo build:android
expo build:ios

# Or use EAS Build
eas build --platform all
```

### Backend (Firebase)
```bash
cd backend/firebase
firebase deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
- Check the [Firebase Functions logs](https://console.firebase.google.com/)
- Review the [NFT Minting Documentation](backend/firebase/NFT_MINTING_README.md)
- Test the health endpoints
- Check the [Dev Notes](DEV_NOTES.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 