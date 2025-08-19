// Production Configuration Template
// Copy env.production.template to .env.production and fill in your actual values

module.exports = {
  // Firebase Project Configuration
  projectId: process.env.FIREBASE_PROJECT_ID || 'hoshino-996d0',
  region: process.env.FIREBASE_REGION || 'us-central1',
  
  // Security Configuration (CRITICAL - Set JWT_SECRET in .env.production!)
  jwtSecret: process.env.JWT_SECRET || (() => { 
    throw new Error('JWT_SECRET must be set in production! Please create .env.production file.') 
  })(),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  
  // CORS Allowed Origins (Production only - no localhost!)
  allowedOrigins: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : [
      'https://hoshino-996d0.web.app',
      'https://hoshino-996d0.firebaseapp.com'
    ],
  
  // Performance Configuration (Production optimized)
  maxBatchSize: parseInt(process.env.MAX_BATCH_SIZE) || 1000,
  connectionPoolSize: parseInt(process.env.CONNECTION_POOL_SIZE) || 20,
  cacheSizeBytes: process.env.CACHE_SIZE_BYTES || '1000000000',
  
  // Logging Configuration (Production safe)
  logLevel: process.env.LOG_LEVEL || 'warn',
  enableStructuredLogging: process.env.ENABLE_STRUCTURED_LOGGING !== 'false',
  enablePerformanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING !== 'false',
  
  // Error Handling (Production safe - no sensitive info)
  showErrorDetails: process.env.SHOW_ERROR_DETAILS === 'true',
  enableStackTraces: process.env.ENABLE_STACK_TRACES === 'true',
  
  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development'
};
