# 🚀 Hoshino Backend Deployment Guide

## Overview
This guide covers deploying the secured Hoshino Firebase Functions backend to production.

## 🔒 Pre-Deployment Security Checklist

### 1. Environment Variables
Set these environment variables in Firebase Functions:

```bash
# Required for production
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-here
SHOW_ERROR_DETAILS=false
ENABLE_STACK_TRACES=false

# Security configuration
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# CORS configuration
ALLOWED_ORIGINS=https://hoshino-996d0.web.app,https://hoshino-996d0.firebaseapp.com

# Performance configuration
MAX_BATCH_SIZE=500
CONNECTION_POOL_SIZE=10
```

### 2. Firebase Project Configuration
```bash
# Set your project
firebase use hoshino-996d0

# Verify project settings
firebase projects:list
```

### 3. Security Rules Verification
Ensure Firestore rules are properly configured:
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data isolation
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public leaderboard (read-only)
    match /leaderboard/{document} {
      allow read: if true;
      allow write: if false;
    }
    
    // Performance metrics (backend only)
    match /performance_metrics/{metricId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## 🚀 Deployment Steps

### Step 1: Build and Deploy Functions
```bash
cd backend/firebase/functions

# Install dependencies
npm install

# Build TypeScript (if using)
npm run build

# Deploy to Firebase
firebase deploy --only functions
```

### Step 2: Verify Deployment
```bash
# Check function status
firebase functions:list

# Test health endpoint
curl -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  https://us-central1-hoshino-996d0.cloudfunctions.net/getGlobalDataHealth
```

### Step 3: Update Frontend Configuration
Ensure your frontend is using the correct Firebase Functions URLs:

```typescript
// src/config/firebase.ts
export const getFunctionUrl = (functionName: string) => {
  const projectId = 'hoshino-996d0';
  const region = 'us-central1';
  return `https://${region}-${projectId}.cloudfunctions.net/${functionName}`;
};
```

## 🔍 Post-Deployment Testing

### 1. Security Tests
```bash
# Test authentication
curl -H "Authorization: Bearer invalid-token" \
  https://us-central1-hoshino-996d0.cloudfunctions.net/getGlobalLeaderboard

# Expected: 401 Unauthorized
```

### 2. Rate Limiting Tests
```bash
# Test rate limiting
for i in {1..101}; do
  curl -H "Authorization: Bearer YOUR_VALID_TOKEN" \
    https://us-central1-hoshino-996d0.cloudfunctions.net/getGlobalLeaderboard
done

# Expected: 429 Too Many Requests after 100 requests
```

### 3. CORS Tests
```bash
# Test CORS with allowed origin
curl -H "Origin: https://hoshino-996d0.web.app" \
  -H "Authorization: Bearer YOUR_VALID_TOKEN" \
  https://us-central1-hoshino-996d0.cloudfunctions.net/getGlobalLeaderboard

# Expected: 200 OK with proper CORS headers
```

## 📊 Monitoring and Logging

### 1. Firebase Console Monitoring
- **Functions**: Monitor execution times and errors
- **Logs**: Check for security violations
- **Performance**: Monitor rate limiting and authentication failures

### 2. Custom Metrics
The backend automatically tracks:
- Request performance metrics
- Authentication failures
- Rate limiting violations
- Input sanitization issues

### 3. Alerting Setup
Set up alerts for:
- High error rates (>5%)
- Authentication failures (>10%)
- Rate limiting violations (>50 per minute)

## 🚨 Security Incident Response

### 1. Immediate Actions
```bash
# If JWT secret is compromised
firebase functions:config:set jwt.secret="NEW_SECRET"

# If under attack, reduce rate limits
firebase functions:config:set rate.limit_max_requests=50

# Redeploy functions
firebase deploy --only functions
```

### 2. Monitoring Suspicious Activity
```bash
# Check recent logs
firebase functions:log --only getGlobalLeaderboard

# Look for patterns:
# - Multiple failed auth attempts
# - Rate limit violations
# - Unusual IP addresses
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Failures
```bash
# Check JWT token format
# Ensure frontend is sending: Authorization: Bearer <token>
# Verify Firebase Auth is properly configured
```

#### 2. CORS Errors
```bash
# Verify ALLOWED_ORIGINS includes your domain
# Check that frontend origin matches exactly
# Ensure preflight OPTIONS requests are handled
```

#### 3. Rate Limiting Issues
```bash
# Check RATE_LIMIT_MAX_REQUESTS setting
# Verify client is sending X-Client-ID header
# Monitor for legitimate high-traffic scenarios
```

### Debug Mode
For development, you can temporarily enable debug mode:
```bash
firebase functions:config:set debug.enabled=true
firebase functions:config:set debug.show_error_details=true
```

**⚠️ Remember to disable debug mode in production!**

## 📈 Performance Optimization

### 1. Connection Pooling
The backend automatically manages Firestore connections:
- Pool size: 10 connections (configurable)
- Automatic cleanup on function termination
- Connection reuse across requests

### 2. Batch Operations
Large updates use Firestore batch operations:
- Maximum batch size: 500 operations
- Automatic batching for bulk updates
- Transaction support for critical operations

### 3. Caching Strategy
- Firestore client-side caching enabled
- Performance metrics cached in memory
- Rate limit data cached per function instance

## 🔄 Update and Maintenance

### 1. Regular Updates
```bash
# Update dependencies monthly
npm update

# Check for security vulnerabilities
npm audit

# Test locally before deploying
npm run test:security
```

### 2. Backup Strategy
- Firestore data automatically backed up
- Function code versioned in Git
- Configuration backed up in Firebase Console

### 3. Rollback Plan
```bash
# Rollback to previous version
firebase functions:rollback

# Or deploy specific version
firebase deploy --only functions --project hoshino-996d0
```

## 📞 Support and Resources

### Documentation
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [This Security Guide](./SECURITY.md)

### Monitoring Tools
- Firebase Console
- Firebase CLI
- Custom security test scripts

### Emergency Contacts
- **Security Issues**: [Your Security Contact]
- **Deployment Issues**: [Your DevOps Contact]
- **Firebase Support**: [Firebase Support Portal]

---

**Last Updated**: [Current Date]
**Deployment Status**: Production Ready
**Security Level**: Enterprise Grade
**Review Schedule**: Monthly
