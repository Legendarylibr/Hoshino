# 🔐 Production Environment Setup

## **🚨 IMMEDIATE ACTION REQUIRED**

Before deploying to production, you MUST set up these environment variables:

## **Step 1: Create .env.production File**

Navigate to `backend/firebase/functions/` and create `.env.production`:

```bash
cd backend/firebase/functions
touch .env.production
```

## **Step 2: Add Production Configuration**

Copy this exact content into `.env.production`:

```bash
# Firebase Project Configuration
FIREBASE_PROJECT_ID=hoshino-996d0
FIREBASE_REGION=us-central1

# 🔐 CRITICAL: Use the generated JWT secret below
JWT_SECRET=94fb6301f51d7094e772a81dfd6c003a6a90ddf2b697c58472a8002e8ad078223cb659d8397299db79282a7219ccda52abf3418fcab1ebf23c1f426b84245e55

# Security Configuration
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=60000

# CORS Allowed Origins (Production only - NO localhost!)
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

## **Step 3: Verify Configuration**

Check that your `.env.production` file:
- ✅ Contains the JWT_SECRET (not the placeholder)
- ✅ Has NODE_ENV=production
- ✅ Has no localhost in ALLOWED_ORIGINS
- ✅ Has production-appropriate rate limits

## **Step 4: Test Configuration**

```bash
cd backend/firebase/functions
node -e "
const config = require('./config.js');
console.log('✅ Config loaded successfully');
console.log('🔐 JWT Secret length:', config.jwtSecret.length);
console.log('🌍 Environment:', config.isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('🚫 CORS Origins:', config.allowedOrigins);
"
```

## **⚠️ SECURITY CHECKLIST**

- [ ] JWT_SECRET is 128 characters long
- [ ] JWT_SECRET is not the placeholder text
- [ ] NODE_ENV is set to 'production'
- [ ] No localhost URLs in CORS origins
- [ ] Rate limits are production-appropriate
- [ ] Error details are disabled
- [ ] File is NOT committed to git

## **🚀 Ready to Deploy?**

Once you've completed this setup, you can deploy using:

```bash
cd backend/firebase
./deploy-production.sh
```

## **🔍 Troubleshooting**

### **JWT Secret Issues**
- Ensure the secret is exactly 128 characters
- Don't add quotes around the value
- Don't add extra spaces

### **Environment Variable Issues**
- Make sure there are no spaces around the `=` sign
- Ensure each variable is on its own line
- Don't add semicolons at the end

### **CORS Issues**
- Remove all localhost URLs for production
- Use only HTTPS URLs
- Separate multiple origins with commas (no spaces)

