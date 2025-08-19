# 🔒 Hoshino Backend Security Documentation

## Overview
This document outlines the security measures implemented in the Hoshino Firebase Functions backend to protect against common web application vulnerabilities.

## 🛡️ Security Middleware Stack

### 1. JWT Authentication (`authenticateRequest`)
- **Purpose**: Verifies Firebase JWT tokens for all API requests
- **Implementation**: Checks `Authorization: Bearer <token>` header
- **Security**: Prevents unauthorized access to protected endpoints
- **Error Codes**: 
  - `AUTH_REQUIRED`: Missing authentication header
  - `INVALID_TOKEN`: Invalid or expired token
  - `AUTH_ERROR`: Authentication service error

### 2. Rate Limiting (`rateLimitRequest`)
- **Purpose**: Prevents API abuse and DDoS attacks
- **Implementation**: Tracks requests per client ID/IP address
- **Limits**: 100 requests per minute per client (configurable)
- **Error Codes**: `RATE_LIMIT_EXCEEDED` with retry-after header

### 3. Input Sanitization (`sanitizeInput`)
- **Purpose**: Prevents XSS and injection attacks
- **Implementation**: Strips dangerous characters from query/body parameters
- **Sanitized**: `< > " ' &` characters are removed
- **Error Codes**: `INVALID_INPUT` for sanitization failures

### 4. CORS Restriction (`corsMiddleware`)
- **Purpose**: Controls which domains can access the API
- **Allowed Origins**: 
  - Production: `https://hoshino-996d0.web.app`
  - Development: `http://localhost:3000`, `http://localhost:19006`
- **Headers**: `Content-Type`, `Authorization`, `X-Client-ID`

## 🔐 Authentication Flow

### Frontend Requirements
```typescript
// All API calls must include Firebase JWT token
const token = await firebase.auth().currentUser?.getIdToken();
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Backend Verification
```javascript
// Token is verified and user info attached to request
admin.auth().verifyIdToken(token)
  .then((decodedToken) => {
    req.user = decodedToken; // Contains user ID, email, etc.
    next();
  });
```

## 🚫 Security Headers

### CORS Headers
- `Access-Control-Allow-Origin`: Restricted to allowed domains
- `Access-Control-Allow-Methods`: `GET, POST, OPTIONS`
- `Access-Control-Allow-Headers`: `Content-Type, Authorization, X-Client-ID`
- `Access-Control-Max-Age`: `86400` (24 hours)

### Rate Limiting Headers
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `Retry-After`: Seconds until rate limit resets

## 📊 Error Handling

### Security-First Error Responses
- **No Stack Traces**: Error details are sanitized in production
- **Error Codes**: Consistent error codes for client handling
- **Generic Messages**: User-friendly error messages without sensitive details

### Error Code Examples
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

## ⚙️ Configuration

### Environment Variables
```bash
# Security
JWT_SECRET=your-secure-jwt-secret
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000

# Error Handling
SHOW_ERROR_DETAILS=false
ENABLE_STACK_TRACES=false
```

### Configuration File
```javascript
// config.js
const config = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [...],
  showErrorDetails: process.env.SHOW_ERROR_DETAILS === 'true'
};
```

## 🔍 Security Testing

### Manual Testing
```bash
# Test authentication
curl -H "Authorization: Bearer invalid-token" \
  https://your-function-url/getGlobalLeaderboard

# Test rate limiting
for i in {1..101}; do
  curl -H "Authorization: Bearer valid-token" \
    https://your-function-url/getGlobalLeaderboard
done

# Test CORS
curl -H "Origin: https://malicious-site.com" \
  -H "Authorization: Bearer valid-token" \
  https://your-function-url/getGlobalLeaderboard
```

### Expected Responses
- **Authentication**: 401 with `AUTH_REQUIRED` code
- **Rate Limiting**: 429 with `RATE_LIMIT_EXCEEDED` code
- **CORS**: 200 but with restricted origin header

## 🚨 Security Considerations

### Current Limitations
1. **JWT Secret**: Uses Firebase's built-in JWT verification
2. **Rate Limiting**: In-memory storage (resets on function restart)
3. **Input Sanitization**: Basic character filtering only

### Future Enhancements
1. **Redis Rate Limiting**: Persistent rate limiting across function instances
2. **Advanced Input Validation**: Schema-based validation with Joi/Yup
3. **Audit Logging**: Comprehensive request/response logging
4. **IP Whitelisting**: Additional IP-based access controls

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Set `JWT_SECRET` environment variable
- [ ] Configure `ALLOWED_ORIGINS` for production domains
- [ ] Set `NODE_ENV=production`
- [ ] Verify `SHOW_ERROR_DETAILS=false`

### Post-Deployment
- [ ] Test authentication with valid Firebase tokens
- [ ] Verify rate limiting is working
- [ ] Test CORS with allowed/disallowed origins
- [ ] Monitor error logs for security issues

## 🆘 Security Incident Response

### Immediate Actions
1. **Revoke Tokens**: If JWT secret is compromised
2. **Update Origins**: If CORS needs immediate restriction
3. **Adjust Rate Limits**: If under DDoS attack
4. **Monitor Logs**: Check for suspicious activity patterns

### Contact Information
- **Security Team**: [Your Security Contact]
- **Emergency**: [Emergency Contact]
- **Documentation**: This file and related security docs

---

**Last Updated**: [Current Date]
**Security Level**: Production Ready
**Review Schedule**: Quarterly
