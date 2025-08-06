# Hoshino NFT Minting Backend

This Firebase backend provides complete NFT minting functionality for the Hoshino moonling game, using mood as the primary trait instead of rarity.

## Features

- 🎨 **Character NFT Minting**: Mint character NFTs with mood traits
- 🏆 **Achievement NFT Minting**: Mint achievement/badge NFTs
- 🛍️ **Marketplace Item Minting**: Mint marketplace item NFTs
- 🔥 **Firebase Cloud Functions**: Ready for Firebase deployment
- 🌙 **Mood-Based Traits**: Uses mood instead of rarity for character uniqueness
- 📱 **Mobile Wallet Integration**: Compatible with mobile wallet adapters

## API Endpoints

### Health Check
```
GET /health
```

### Character NFT Minting
```
POST /mintCharacter
{
  "characterId": "lyra",
  "ownerPublicKey": "9juPU3sWDJX6BWNz797SAdpZmypM6bot9up5aqHnqeak",
  "mood": "Happy"
}
```

### Achievement NFT Minting
```
POST /mintAchievement
{
  "achievementId": "first_mint",
  "ownerPublicKey": "9juPU3sWDJX6BWNz797SAdpZmypM6bot9up5aqHnqeak",
  "mood": "Proud"
}
```

### Marketplace Item NFT Minting
```
POST /mintMarketplaceItem
{
  "itemId": "sword_001",
  "category": "weapon",
  "ownerPublicKey": "9juPU3sWDJX6BWNz797SAdpZmypM6bot9up5aqHnqeak",
  "mood": "Excited"
}
```

### Generate NFT Transaction (Legacy)
```
POST /generateNFTTransaction
{
  "character": {
    "name": "Lyra",
    "element": "Star",
    "description": "A bright star character"
  },
  "userPublicKey": "9juPU3sWDJX6BWNz797SAdpZmypM6bot9up5aqHnqeak",
  "imageUri": "https://ipfs.io/ipfs/QmMockImage",
  "mood": "Happy",
  "tokenStandard": "pNFT"
}
```

## Character Data

The backend includes predefined character data:

| Character ID | Name | Element | Description |
|--------------|------|---------|-------------|
| `lyra` | Lyra | Star | A bright star character with anime enthusiasm |
| `orion` | Orion | Cosmic | A mystical cosmic character with ancient wisdom |
| `aro` | Aro | Energy | An energetic character full of optimism |
| `sirius` | Sirius | Power | A powerful and intense character |
| `zaniah` | Zaniah | Mystery | A mysterious and contemplative character |

## Achievement Data

Available achievements for minting:

| Achievement ID | Name | Description |
|----------------|------|-------------|
| `first_mint` | First Mint | Successfully minted your first character NFT |
| `character_collector` | Character Collector | Collected multiple character NFTs |
| `mood_master` | Mood Master | Experienced all different moods with your characters |

## Mood Traits

Instead of rarity, NFTs use mood traits to make them unique:

- **Happy**: Default mood for new characters
- **Proud**: Used for achievements
- **Excited**: Used for marketplace items
- **Sad**: Can be applied based on game state
- **Angry**: Can be applied based on game state
- **Calm**: Can be applied based on game state

## NFT Metadata Structure

All NFTs follow this metadata structure:

```json
{
  "name": "Hoshino [Character Name]",
  "symbol": "HOSH",
  "description": "Character description with mood",
  "image": "https://ipfs.io/ipfs/[CID]",
  "attributes": [
    {
      "trait_type": "Mood",
      "value": "Happy"
    },
    {
      "trait_type": "Type",
      "value": "Character"
    }
  ],
  "properties": {
    "files": [
      {
        "type": "image/png",
        "uri": "https://ipfs.io/ipfs/[CID]"
      }
    ],
    "category": "image",
    "creators": [
      {
        "address": "[Owner Public Key]",
        "share": 100
      }
    ]
  }
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend/firebase/functions
npm install
```

### 2. Deploy to Firebase
```bash
cd backend/firebase
./deploy.sh
```

Or manually:
```bash
firebase deploy --only functions
```

### 3. Environment Configuration

The backend is configured for:
- **Solana Network**: Devnet (`https://api.devnet.solana.com`)
- **Token Standard**: Programmable NFTs (pNFT)
- **IPFS Storage**: Mock implementation (replace with real IPFS service)

## Frontend Integration

### Using the ProgrammableNFTService

```typescript
import { useProgrammableNFT } from '../hooks/useProgrammableNFT';

const { mintCharacterNFT, mintAchievementNFT } = useProgrammableNFT();

// Mint a character
const result = await mintCharacterNFT(
  character,
  imageCid,
  'Happy' // mood
);

// Mint an achievement
const result = await mintAchievementNFT(
  achievement,
  imageCid,
  'Proud' // mood
);
```

### Using the Hook

```typescript
const { mintCharacterNFT, connected, publicKey } = useProgrammableNFT();

const handleMint = async () => {
  if (!connected) {
    alert('Please connect your wallet first');
    return;
  }

  const result = await mintCharacterNFT(
    selectedCharacter,
    asset.ipfsHash,
    'Happy'
  );

  if (result.success) {
    console.log('NFT minted:', result.mintAddress);
  } else {
    console.error('Minting failed:', result.error);
  }
};
```

## Response Format

All endpoints return a consistent response format:

```json
{
  "success": true,
  "mintAddress": "Generated mint address",
  "metadata": {
    "name": "Hoshino [Name]",
    "symbol": "HOSH",
    "uri": "https://ipfs.io/ipfs/[CID]",
    "sellerFeeBasisPoints": 500,
    "creators": [
      {
        "address": "Owner public key",
        "share": 100
      }
    ],
    "isMutable": true,
    "attributes": [
      {
        "trait_type": "Mood",
        "value": "Happy"
      },
      {
        "trait_type": "Type",
        "value": "Character"
      }
    ]
  },
  "estimatedCost": "~0.01 SOL"
}
```

## Error Handling

The backend provides detailed error messages:

```json
{
  "success": false,
  "error": "Error description",
  "details": "Detailed error information"
}
```

## Development Notes

- **Mock IPFS**: Currently uses mock IPFS uploads. Replace with real IPFS service for production
- **Transaction Signing**: Uses mobile wallet adapter for transaction signing
- **Solana Devnet**: Configured for devnet. Change to mainnet for production
- **CORS**: All endpoints support CORS for React Native app
- **Rate Limiting**: Implemented by Firebase Functions

## Production Considerations

1. **IPFS Integration**: Replace mock IPFS with real service (Irys, Pinata, etc.)
2. **Mainnet Deployment**: Update Solana connection to mainnet
3. **Security**: Add proper authentication and rate limiting
4. **Monitoring**: Set up Firebase Functions monitoring
5. **Cost Optimization**: Monitor function execution costs

## Troubleshooting

### Common Issues

1. **Wallet Connection**: Ensure mobile wallet is properly connected
2. **Network Issues**: Check Solana network connectivity
3. **Function Deployment**: Verify Firebase Functions are deployed
4. **CORS Errors**: Check CORS configuration in functions

### Debug Endpoints

- `/health`: Check overall backend health
- `/solanaHealth`: Check Solana connection status

## Support

For issues or questions:
1. Check the Firebase Functions logs
2. Verify Solana network status
3. Test with the health endpoints
4. Review the frontend integration examples 