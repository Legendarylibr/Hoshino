#!/bin/bash

# Production Setup Script for Hoshino Firebase Functions
echo "🚀 Setting up production environment for Hoshino Firebase Functions..."

# Check if .env.production already exists
if [ -f ".env.production" ]; then
    echo "⚠️  .env.production already exists. Backing up to .env.production.backup"
    cp .env.production .env.production.backup
fi

# Copy template to .env.production
if [ -f "env.production.template" ]; then
    cp env.production.template .env.production
    echo "✅ Created .env.production from template"
else
    echo "❌ env.production.template not found!"
    exit 1
fi

# Make .env.production readable only by owner
chmod 600 .env.production

echo ""
echo "🔐 Production environment file created!"
echo "📝 Please review and customize .env.production with your actual values"
echo ""
echo "⚠️  IMPORTANT: Change the JWT_SECRET to a unique, secure value!"
echo "⚠️  IMPORTANT: Verify CORS origins match your production domains!"
echo ""
echo "ℹ️  Note: Configuration redundancy has been eliminated - single config.js file"
echo "ℹ️  Note: Logging has been standardized for production use"
echo ""
echo "🚀 To deploy: npm run deploy"
echo "🔍 To test: npm run health"
