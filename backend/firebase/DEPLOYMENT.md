# Hoshino Backend Deployment Guide

This guide covers deploying the enhanced Hoshino backend with global data functionality.

## Prerequisites

- Firebase CLI installed and authenticated
- Node.js 18+ installed
- Firebase project created

## Quick Deployment

### 1. Install Dependencies
```bash
cd backend/firebase/functions
npm install
```

### 2. Deploy Functions
```bash
cd backend/firebase
firebase deploy --only functions
```

### 3. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 4. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```

## Detailed Deployment Steps

### Step 1: Environment Setup
```bash
# Set OpenAI API key
firebase functions:config:set openai.key="your_openai_api_key_here"

# Set OpenAI model
firebase functions:config:set openai.model="gpt-4"

# Set OpenAI max tokens
firebase functions:config:set openai.max_tokens="150"
```

### Step 2: Install Dependencies
```bash
cd backend/firebase/functions
npm install firebase-admin firebase-functions
```

### Step 3: Deploy Functions
```bash
cd backend/firebase
firebase deploy --only functions
```

### Step 4: Verify Deployment
```bash
# Check function status
firebase functions:list

# Test health endpoint
curl https://us-central1-your-project.cloudfunctions.net/health
```

## New Backend Functions

The following new functions are now available:

### Global Data Functions
- `getGlobalLeaderboard` - Fetch global player rankings
- `getUserAchievements` - Get user progress data
- `updateUserProgress` - Update user statistics
- `unlockAchievement` - Unlock new achievements
- `addMilestone` - Add user milestones
- `addMemory` - Add user memories

### Existing Functions
- `chat` - AI chat with moonlings
- `getConversation` - Get chat history
- `generateNFTTransaction` - Solana NFT operations
- `processStarDustPurchase` - Currency transactions

## Firestore Collections

The following collections will be created automatically:

### `users/{walletAddress}`
- User profiles and progress data
- Total scores, achievements, moonlings
- Star fragments and streak information

### `user_achievements/{walletAddress}`
- Individual user achievements
- Milestones and memories
- Progress statistics

### `leaderboard/{walletAddress}`
- Global leaderboard entries
- Publicly readable rankings
- User-writable own data

### `conversations/{conversationId}`
- Chat conversation history
- User-specific access control

## Security Rules

Updated Firestore rules provide:
- Public read access to leaderboards
- User-specific write access to own data
- Secure conversation storage
- Achievement data protection

## Testing the Backend

### 1. Test Health Endpoint
```bash
curl https://us-central1-your-project.cloudfunctions.net/health
```

### 2. Test Global Leaderboard
```bash
curl https://us-central1-your-project.cloudfunctions.net/getGlobalLeaderboard
```

### 3. Test User Progress (requires wallet address)
```bash
curl "https://us-central1-your-project.cloudfunctions.net/getUserAchievements?walletAddress=0x1234...5678"
```

## Monitoring and Logs

### View Function Logs
```bash
firebase functions:log
```

### Monitor Performance
- Firebase Console > Functions > Monitoring
- Check execution times and error rates
- Monitor Firestore read/write operations

## Troubleshooting

### Common Issues

#### 1. Function Deployment Fails
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 2. Firestore Rules Deployment Fails
```bash
# Validate rules syntax
firebase deploy --only firestore:rules --dry-run
```

#### 3. Functions Not Responding
```bash
# Check function status
firebase functions:list

# View logs
firebase functions:log --only functionName
```

### Performance Optimization

#### 1. Cold Start Reduction
- Use Firebase Functions v2
- Implement connection pooling
- Cache frequently accessed data

#### 2. Firestore Optimization
- Use composite indexes for complex queries
- Implement pagination for large datasets
- Use batch operations for multiple writes

## Cost Management

### Firebase Functions Pricing
- **Free Tier**: 2M invocations/month
- **Paid Tier**: $0.40 per million invocations

### Firestore Pricing
- **Free Tier**: 50K reads, 20K writes/month
- **Paid Tier**: $0.06 per 100K reads, $0.18 per 100K writes

### OpenAI API Pricing
- **GPT-4**: $0.03 per 1K input tokens, $0.06 per 1K output tokens
- **GPT-3.5**: $0.0015 per 1K input tokens, $0.002 per 1K output tokens

## Scaling Considerations

### Horizontal Scaling
- Firebase Functions automatically scale
- Firestore handles concurrent connections
- Consider regional deployment for global users

### Vertical Scaling
- Optimize function execution time
- Implement efficient data structures
- Use appropriate Firestore indexes

## Backup and Recovery

### Data Backup
```bash
# Export Firestore data
firebase firestore:export backup-folder

# Import Firestore data
firebase firestore:import backup-folder
```

### Function Backup
- Source code in version control
- Configuration in Firebase Console
- Environment variables documented

## Support and Maintenance

### Regular Maintenance
- Monitor function performance
- Review Firestore usage patterns
- Update dependencies regularly
- Check security rules compliance

### Emergency Procedures
- Rollback to previous function version
- Restore Firestore from backup
- Contact Firebase support if needed

## Next Steps

After successful deployment:

1. **Test Integration**: Verify frontend connects to new endpoints
2. **Monitor Performance**: Watch function execution times and costs
3. **User Testing**: Test with real user data and scenarios
4. **Optimization**: Implement performance improvements based on usage
5. **Scaling**: Plan for increased user load and data volume
