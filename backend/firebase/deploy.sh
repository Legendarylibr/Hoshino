#!/bin/bash

# Hoshino Firebase Functions Deployment Script

echo "🚀 Deploying Hoshino Firebase Functions..."

# Navigate to the firebase directory
cd "$(dirname "$0")"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd functions
npm install
cd ..

# Deploy functions
echo "🔥 Deploying Firebase Functions..."
firebase deploy --only functions

echo "✅ Deployment complete!"
echo ""
echo "📋 Available endpoints:"
echo "  - Health: https://us-central1-hoshino-996d0.cloudfunctions.net/health"
echo "  - Mint Character: https://us-central1-hoshino-996d0.cloudfunctions.net/mintCharacter"
echo "  - Mint Achievement: https://us-central1-hoshino-996d0.cloudfunctions.net/mintAchievement"
echo "  - Mint Marketplace Item: https://us-central1-hoshino-996d0.cloudfunctions.net/mintMarketplaceItem"
echo "  - Generate NFT Transaction: https://us-central1-hoshino-996d0.cloudfunctions.net/generateNFTTransaction"
echo "  - Solana Health: https://us-central1-hoshino-996d0.cloudfunctions.net/solanaHealth"
echo ""
echo "🎮 Your frontend can now use these endpoints for NFT minting!" 