# 🚀 Production Deployment Checklist

## **🔐 CRITICAL SECURITY SETUP**

### **1. JWT Secret (REQUIRED)**
```bash
# Use this generated secret (DO NOT SHARE):
export JWT_SECRET="94fb6301f51d7094e772a81dfd6c003a6a90ddf2b697c58472a8002e8ad078223cb659d8397299db79282a7219ccda52abf3418fcab1ebf23c1f426b84245e55"
```

### **2. Environment Variables**
Create `.env.production` in `backend/firebase/functions/`:
```bash
# Firebase Project Configuration
FIREBASE_PROJECT_ID=hoshino-996d0
FIREBASE_REGION=us-central1

# Security Configuration
JWT_SECRET=94fb6301f51d7094e772a81dfd6c003a6a90ddf2b697c58472a8002e8ad078223cb659d8397299db79282a7219ccda52abf3418fcab1ebf23c1f426b84245e55
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=60000

# CORS Allowed Origins (Production only)
ALLOWED_ORIGINS=https://hoshino-996d0.web.app,https://hoshino-996d0.firebaseapp.com

# Performance Configuration
MAX_BATCH_SIZE=1000
CONNECTION_POOL_SIZE=20
CACHE_SIZE_BYTES=1000000000

# Logging Configuration
LOG_LEVEL=warn
ENABLE_STRUCTURED_LOGGING=true
ENABLE_PERFORMANCE_MONITORING=true

# Error Handling (Production safe)
SHOW_ERROR_DETAILS=false
ENABLE_STACK_TRACES=false

# Environment
NODE_ENV=production
```

## **🔥 Firebase Project Setup**

### **1. Verify Project Configuration**
```bash
cd backend/firebase
firebase projects:list
firebase use hoshino-996d0
```

### **2. Enable Required Services**
- ✅ Cloud Functions
- ✅ Firestore Database
- ✅ Authentication (if needed)
- ✅ Storage (if needed)

### **3. Set Up Billing**
- Enable billing for Cloud Functions
- Set appropriate quotas and limits

## **🚀 Deployment Commands**

### **1. Deploy Functions**
```bash
cd backend/firebase/functions
npm run deploy
```

### **2. Deploy Firestore Rules**
```bash
cd backend/firebase
firebase deploy --only firestore:rules
```

### **3. Deploy Frontend (if applicable)**
```bash
# From project root
npm run build
# Deploy to your hosting platform
```

## **✅ Pre-Deployment Checklist**

- [ ] JWT_SECRET is set and secure
- [ ] Environment variables are configured
- [ ] CORS origins are production-only
- [ ] Rate limiting is configured
- [ ] Error details are disabled
- [ ] Firebase project is selected
- [ ] Billing is enabled
- [ ] All tests pass

## **🔍 Post-Deployment Verification**

### **1. Test Health Endpoint**
```bash
curl https://us-central1-hoshino-996d0.cloudfunctions.net/getGlobalDataHealth
```

### **2. Test Security Middleware**
- Verify JWT authentication works
- Verify rate limiting works
- Verify CORS is properly configured

### **3. Monitor Logs**
```bash
firebase functions:log
```

## **⚠️ Security Reminders**

1. **NEVER commit .env files to git**
2. **Rotate JWT secrets regularly**
3. **Monitor function logs for suspicious activity**
4. **Set up alerts for rate limit violations**
5. **Regular security audits**

## **📞 Emergency Contacts**

- **Security Issues**: Immediately revoke JWT secret and redeploy
- **Performance Issues**: Check Cloud Function logs and metrics
- **Billing Issues**: Review Firebase console billing section

