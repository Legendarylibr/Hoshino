#!/bin/bash

# 🚀 Production Deployment Script for Hoshino Firebase Functions
# ⚠️ IMPORTANT: Run this from the backend/firebase directory

set -e  # Exit on any error

echo "🚀 Starting Production Deployment..."

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: Must run from backend/firebase directory"
    exit 1
fi

# Check if .env.production exists
if [ ! -f "functions/.env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    echo "📋 Please create it using the template in production.config.js"
    exit 1
fi

# Check if JWT_SECRET is set
if ! grep -q "JWT_SECRET=" "functions/.env.production" || grep -q "CHANGE_THIS" "functions/.env.production"; then
    echo "❌ Error: JWT_SECRET not properly configured in .env.production"
    echo "🔐 Please set a secure JWT_SECRET value"
    exit 1
fi

# Check if NODE_ENV is set to production
if ! grep -q "NODE_ENV=production" "functions/.env.production"; then
    echo "❌ Error: NODE_ENV must be set to 'production' in .env.production"
    exit 1
fi

echo "✅ Environment configuration verified"

# Load environment variables
echo "📋 Loading production environment variables..."
export $(cat functions/.env.production | xargs)

# Verify Firebase project
echo "🔥 Verifying Firebase project configuration..."
firebase projects:list | grep -q "hoshino-996d0" || {
    echo "❌ Error: Firebase project 'hoshino-996d0' not found or not accessible"
    exit 1
}

firebase use hoshino-996d0

# Run tests
echo "🧪 Running production tests..."
cd functions
npm test
cd ..

# Deploy Firestore rules
echo "📚 Deploying Firestore security rules..."
firebase deploy --only firestore:rules

# Deploy functions
echo "⚡ Deploying Cloud Functions..."
cd functions
npm run deploy
cd ..

# Verify deployment
echo "🔍 Verifying deployment..."
sleep 10  # Wait for functions to be ready

# Test health endpoint
echo "🏥 Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "https://us-central1-hoshino-996d0.cloudfunctions.net/getGlobalDataHealth" || echo "FAILED")

if [[ "$HEALTH_RESPONSE" == "FAILED" ]]; then
    echo "❌ Health check failed - deployment may have issues"
    exit 1
else
    echo "✅ Health check passed"
fi

echo "🎉 Production deployment completed successfully!"
echo ""
echo "📊 Next steps:"
echo "1. Monitor function logs: firebase functions:log"
echo "2. Test your application endpoints"
echo "3. Set up monitoring and alerts"
echo "4. Document any custom configurations"
echo ""
echo "⚠️ Security reminder: Keep your JWT_SECRET secure and never commit it to git!"

