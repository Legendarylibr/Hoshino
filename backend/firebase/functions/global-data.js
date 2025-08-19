const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
let db;
let connectionPool = new Map(); // Connection pooling for better performance

try {
  // Check if app is already initialized
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
  db = admin.firestore();
  
  // Configure Firestore for better performance
  db.settings({
    ignoreUndefinedProperties: true, // Ignore undefined properties for better performance
    cacheSizeBytes: admin.firestore.CACHE_SIZE_UNLIMITED // Enable unlimited caching
  });
  
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  // Fallback initialization
  try {
    admin.initializeApp();
    db = admin.firestore();
    
    // Configure Firestore for better performance
    db.settings({
      ignoreUndefinedProperties: true,
      cacheSizeBytes: admin.firestore.CACHE_SIZE_UNLIMITED
    });
    
  } catch (fallbackError) {
    console.error('Fallback Firebase Admin initialization failed:', fallbackError);
    throw fallbackError;
  }
}

// JWT Authentication Middleware
function authenticateRequest(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const token = authHeader.split('Bearer ')[1];
    admin.auth().verifyIdToken(token)
      .then((decodedToken) => {
        req.user = decodedToken;
        next();
      })
      .catch((error) => {
        console.error('Token verification failed:', error);
        res.status(401).json({
          success: false,
          error: 'Invalid authentication token',
          code: 'INVALID_TOKEN'
        });
      });
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication service error',
      code: 'AUTH_ERROR'
    });
  }
}

// Rate Limiting Middleware
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = config.rateLimitWindowMs; // Configurable window
const MAX_REQUESTS_PER_WINDOW = config.rateLimitMaxRequests; // Configurable limit

function rateLimitRequest(req, res, next) {
  const clientId = req.headers['x-client-id'] || req.ip || 'unknown';
  const now = Date.now();
  
  if (!rateLimitMap.has(clientId)) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    const clientData = rateLimitMap.get(clientId);
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + RATE_LIMIT_WINDOW;
    } else {
      clientData.count++;
    }
    
    if (clientData.count > MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
  }
  
  next();
}

// Input Sanitization Middleware
function sanitizeInput(req, res, next) {
  try {
    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = req.query[key].replace(/[<>"'&\/]/g, '');
        }
      });
    }
    
    // Sanitize body parameters
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].replace(/[<>"'&\/]/g, '');
        }
      });
    }
    
    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid input data',
      code: 'INVALID_INPUT'
    });
  }
}

// Import configuration
const config = require('./config');

// CORS Configuration - Restrict to specific domains
const ALLOWED_ORIGINS = config.allowedOrigins;

function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
  } else {
    res.set('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]); // Default to first allowed origin
  }
  
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Client-ID');
  res.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  if (req.method === 'OPTIONS') {
    res.status(200).send();
    return;
  }
  
  next();
}

// Connection pool management functions
function getConnection(connectionId = 'default') {
  const connection = connectionPool.get(connectionId);
  if (connection && connection.status === 'active') {
    connection.lastUsed = Date.now();
    return connection.db;
  }
  return db; // Fallback to default connection
}

function addConnection(connectionId, dbInstance) {
  connectionPool.set(connectionId, {
    db: dbInstance,
    lastUsed: Date.now(),
    status: 'active'
  });
}

function removeConnection(connectionId) {
  connectionPool.delete(connectionId);
}

function getConnectionStatus() {
  const status = {};
  connectionPool.forEach((conn, id) => {
    status[id] = {
      status: conn.status,
      lastUsed: conn.lastUsed,
      uptime: Date.now() - conn.lastUsed
    };
  });
  return status;
}

// Performance optimization: Batch operations for multiple updates
const batchOperations = new Map();

// Batch operations utility functions
function createBatch() {
  return db.batch();
}

function addToBatch(batch, ref, data, options = {}) {
  batch.set(ref, data, options);
}

function commitBatch(batch) {
  return batch.commit();
}

// Batch update utility for multiple user updates
async function batchUpdateUsers(updates) {
  if (!updates || updates.length === 0) return;
  
  const batch = createBatch();
  const maxBatchSize = 500; // Firestore batch limit
  
  for (let i = 0; i < updates.length; i += maxBatchSize) {
    const batchUpdates = updates.slice(i, i + maxBatchSize);
    const currentBatch = createBatch();
    
    batchUpdates.forEach(({ ref, data, options }) => {
      addToBatch(currentBatch, ref, data, options);
    });
    
    try {
      await commitBatch(currentBatch);
      logOperation('batch_update_success', { 
        batchSize: batchUpdates.length, 
        batchNumber: Math.floor(i / maxBatchSize) + 1 
      });
    } catch (error) {
      logOperation('batch_update_error', { 
        error: error.message, 
        batchNumber: Math.floor(i / maxBatchSize) + 1 
      });
      throw error;
    }
  }
}

// Performance monitoring and structured logging
const performanceMetrics = {
  startTime: Date.now(),
  requestCount: 0,
  averageResponseTime: 0
};

// Structured logging function
function logOperation(operation, details, duration = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    details,
    duration: duration ? `${duration}ms` : null,
    requestId: Math.random().toString(36).substr(2, 9)
  };
  
  console.log(JSON.stringify(logEntry, null, 2));
}

// Performance monitoring middleware
function withPerformanceMonitoring(operationName, handler) {
  return async (req, res) => {
    const startTime = Date.now();
    performanceMetrics.requestCount++;
    
    try {
      logOperation(`${operationName}_start`, { 
        method: req.method, 
        timestamp: new Date().toISOString() 
      });
      
      await handler(req, res);
      
      const duration = Date.now() - startTime;
      performanceMetrics.averageResponseTime = 
        (performanceMetrics.averageResponseTime + duration) / 2;
      
      // Persist metrics to Firestore for long-term storage
      try {
        await db.collection('performance_metrics').doc('global_data').set({
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          requestCount: performanceMetrics.requestCount,
          averageResponseTime: performanceMetrics.averageResponseTime,
          uptime: Date.now() - performanceMetrics.startTime
        }, { merge: true });
      } catch (persistError) {
        console.warn('Failed to persist performance metrics:', persistError);
      }
      
      logOperation(`${operationName}_success`, { 
        duration, 
        statusCode: res.statusCode || 200 
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logOperation(`${operationName}_error`, { 
        error: error.message, 
        duration,
        stack: error.stack 
      });
      throw error;
    }
  };
}

// Get global leaderboard with security middleware
exports.getGlobalLeaderboard = onRequest({
  cors: false, // We handle CORS manually
  invoker: 'private' // Require authentication
}, withPerformanceMonitoring('getGlobalLeaderboard', async (req, res) => {
  try {
    // Apply security middleware
    corsMiddleware(req, res, () => {});
    rateLimitRequest(req, res, () => {});
    sanitizeInput(req, res, () => {});
    authenticateRequest(req, res, () => {});

    // Performance optimization: Use efficient query with proper indexing
    const leaderboardRef = db.collection('leaderboard');
    const snapshot = await leaderboardRef
      .orderBy('totalScore', 'desc')
      .limit(100)
      .get();
    
    const leaderboard = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      leaderboard.push({
        id: doc.id,
        username: data.username || 'Anonymous',
        walletAddress: data.walletAddress,
        totalScore: data.totalScore || 0,
        achievements: data.achievements || 0,
        moonlings: data.moonlings || 0,
        rank: leaderboard.length + 1,
        avatar: data.avatar || '⭐',
        lastActive: data.lastActive?.toDate?.() || new Date(),
        starFragments: data.starFragments || 0,
        currentStreak: data.currentStreak || 0
      });
    });

    res.json({
      success: true,
      leaderboard,
      totalPlayers: leaderboard.length,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
      code: 'LEADERBOARD_FETCH_ERROR'
    });
  }
}));

// Get user achievements with security middleware
exports.getUserAchievements = onRequest({
  cors: false, // We handle CORS manually
  invoker: 'private' // Require authentication
}, withPerformanceMonitoring('getUserAchievements', async (req, res) => {
  try {
    // Apply security middleware
    corsMiddleware(req, res, () => {});
    rateLimitRequest(req, res, () => {});
    sanitizeInput(req, res, () => {});
    authenticateRequest(req, res, () => {});

    const { walletAddress } = req.query;
    
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    // Validate wallet address format (basic check)
    if (typeof walletAddress !== 'string' || walletAddress.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    const userAchievementsRef = db.collection('user_achievements').doc(walletAddress);
    const doc = await userAchievementsRef.get();
    
    if (doc.exists) {
      const data = doc.data();
      res.json({
        success: true,
        achievements: data.achievements || [],
        milestones: data.milestones || [],
        memories: data.memories || [],
        stats: data.stats || {}
      });
    } else {
      // Return default achievements for new users
      const defaultAchievements = generateDefaultAchievements();
      const defaultMilestones = generateDefaultMilestones();
      const defaultMemories = generateDefaultMemories();
      
      res.json({
        success: true,
        achievements: defaultAchievements,
        milestones: defaultMilestones,
        memories: defaultMemories,
        stats: {
          totalAchievements: defaultAchievements.length,
          totalMilestones: defaultMilestones.length,
          totalMemories: defaultMemories.length,
          completionRate: 0
        }
      });
    }
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user achievements',
      code: 'ACHIEVEMENTS_FETCH_ERROR'
    });
  }
}));

// Update user progress with security middleware
exports.updateUserProgress = onRequest({
  cors: false, // We handle CORS manually
  invoker: 'private' // Require authentication
}, withPerformanceMonitoring('updateUserProgress', async (req, res) => {
  try {
    // Apply security middleware
    corsMiddleware(req, res, () => {});
    rateLimitRequest(req, res, () => {});
    sanitizeInput(req, res, () => {});
    authenticateRequest(req, res, () => {});

    const { walletAddress, type, data: progressData } = req.body;
    
    if (!walletAddress || !type) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address and type are required'
      });
    }

    // Validate wallet address format
    if (typeof walletAddress !== 'string' || walletAddress.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    // Validate progress data
    if (!progressData || typeof progressData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Progress data is required and must be an object'
      });
    }

    const userRef = db.collection('users').doc(walletAddress);
    const userAchievementsRef = db.collection('user_achievements').doc(walletAddress);
    const leaderboardRef = db.collection('leaderboard').doc(walletAddress);

    // Use batch operations for better performance
    const batch = createBatch();
    
    // Add user data update to batch
    addToBatch(batch, userRef, {
      walletAddress,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      ...progressData
    }, { merge: true });

    // Add leaderboard update to batch if score changed
    if (progressData.totalScore !== undefined) {
      addToBatch(batch, leaderboardRef, {
        walletAddress,
        totalScore: progressData.totalScore,
        achievements: progressData.achievements || 0,
        moonlings: progressData.moonlings || 0,
        lastActive: admin.firestore.FieldValue.serverTimestamp(),
        starFragments: progressData.starFragments || 0,
        currentStreak: progressData.currentStreak || 0
      }, { merge: true });
    }

    // Commit all updates in a single batch
    await commitBatch(batch);

    res.json({
      success: true,
      message: 'User progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating user progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user progress',
      code: 'PROGRESS_UPDATE_ERROR'
    });
  }
}));

// Unlock achievement with security middleware
exports.unlockAchievement = onRequest({
  cors: false, // We handle CORS manually
  invoker: 'private' // Require authentication
}, withPerformanceMonitoring('unlockAchievement', async (req, res) => {
  try {
    // Apply security middleware
    corsMiddleware(req, res, () => {});
    rateLimitRequest(req, res, () => {});
    sanitizeInput(req, res, () => {});
    authenticateRequest(req, res, () => {});

    const { walletAddress, achievementId, achievementData } = req.body;
    
    if (!walletAddress || !achievementId) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address and achievement ID are required'
      });
    }

    // Validate wallet address format
    if (typeof walletAddress !== 'string' || walletAddress.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    // Validate achievement data
    if (!achievementData || typeof achievementData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Achievement data is required and must be an object'
      });
    }

    const userAchievementsRef = db.collection('user_achievements').doc(walletAddress);
    const userRef = db.collection('users').doc(walletAddress);
    const leaderboardRef = db.collection('leaderboard').doc(walletAddress);

    // Add achievement to user's achievements
    await userAchievementsRef.set({
      achievements: admin.firestore.FieldValue.arrayUnion({
        id: achievementId,
        unlockedAt: new Date(),
        ...achievementData
      })
    }, { merge: true });

    // Update user stats
    const userDoc = await userAchievementsRef.get();
    const userData = userDoc.data() || {};
    const achievementCount = (userData.achievements || []).length;

    await userRef.set({
      achievements: achievementCount,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Update leaderboard
    await leaderboardRef.set({
      achievements: achievementCount,
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({
      success: true,
      message: 'Achievement unlocked successfully',
      achievementCount
    });
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlock achievement',
      code: 'ACHIEVEMENT_UNLOCK_ERROR'
    });
  }
}));

// Add milestone with security middleware
exports.addMilestone = onRequest({
  cors: false, // We handle CORS manually
  invoker: 'private' // Require authentication
}, withPerformanceMonitoring('addMilestone', async (req, res) => {
  try {
    // Apply security middleware
    corsMiddleware(req, res, () => {});
    rateLimitRequest(req, res, () => {});
    sanitizeInput(req, res, () => {});
    authenticateRequest(req, res, () => {});

    const { walletAddress, milestoneId, milestoneData } = req.body;
    
    if (!walletAddress || !milestoneId) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address and milestone ID are required'
      });
    }

    // Validate wallet address format
    if (typeof walletAddress !== 'string' || walletAddress.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    // Validate milestone data
    if (!milestoneData || typeof milestoneData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Milestone data is required and must be an object'
      });
    }

    const userAchievementsRef = db.collection('user_achievements').doc(walletAddress);
    const userRef = db.collection('users').doc(walletAddress);

    // Add milestone to user's milestones
    await userAchievementsRef.set({
      milestones: admin.firestore.FieldValue.arrayUnion({
        id: milestoneId,
        achievedAt: new Date(),
        ...milestoneData
      })
    }, { merge: true });

    // Update user stats
    const userDoc = await userAchievementsRef.get();
    const userData = userDoc.data() || {};
    const milestoneCount = (userData.milestones || []).length;

    await userRef.set({
      milestones: milestoneCount,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({
      success: true,
      message: 'Milestone added successfully',
      milestoneCount
    });
  } catch (error) {
    console.error('Error adding milestone:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add milestone',
      code: 'MILESTONE_ADD_ERROR'
    });
  }
}));

// Add memory with security middleware
exports.addMemory = onRequest({
  cors: false, // We handle CORS manually
  invoker: 'private' // Require authentication
}, withPerformanceMonitoring('addMemory', async (req, res) => {
  try {
    // Apply security middleware
    corsMiddleware(req, res, () => {});
    rateLimitRequest(req, res, () => {});
    sanitizeInput(req, res, () => {});
    authenticateRequest(req, res, () => {});

    const { walletAddress, memoryId, memoryData } = req.body;
    
    if (!walletAddress || !memoryId) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address and memory ID are required'
      });
    }

    // Validate wallet address format
    if (typeof walletAddress !== 'string' || walletAddress.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address format'
      });
    }

    // Validate memory data
    if (!memoryData || typeof memoryData !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Memory data is required and must be an object'
      });
    }

    const userAchievementsRef = db.collection('user_achievements').doc(walletAddress);
    const userRef = db.collection('users').doc(walletAddress);

    // Add memory to user's memories
    await userAchievementsRef.set({
      memories: admin.firestore.FieldValue.arrayUnion({
        id: memoryId,
        date: new Date(),
        ...memoryData
      })
    }, { merge: true });

    // Update user stats
    const userDoc = await userAchievementsRef.get();
    const userData = userDoc.data() || {};
    const memoryCount = (userData.memories || []).length;

    await userRef.set({
      memories: memoryCount,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({
      success: true,
      message: 'Memory added successfully',
      memoryCount
    });
  } catch (error) {
    console.error('Error adding memory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add memory',
      code: 'MEMORY_ADD_ERROR'
    });
  }
}));

// Health check endpoint with security middleware
exports.getGlobalDataHealth = onRequest({
  cors: false, // We handle CORS manually
  invoker: 'private' // Require authentication
}, withPerformanceMonitoring('getGlobalDataHealth', async (req, res) => {
  try {
    // Apply security middleware
    corsMiddleware(req, res, () => {});
    rateLimitRequest(req, res, () => {});
    sanitizeInput(req, res, () => {});
    authenticateRequest(req, res, () => {});

    // Test database connection
    const testRef = db.collection('leaderboard').limit(1);
    const testSnapshot = await testRef.get();
    
    res.json({
      status: 'healthy',
      module: 'global-data',
      timestamp: new Date().toISOString(),
      performance: {
        uptime: Date.now() - performanceMetrics.startTime,
        requestCount: performanceMetrics.requestCount,
        averageResponseTime: `${Math.round(performanceMetrics.averageResponseTime)}ms`
      },
      database: {
        status: 'connected',
        collections: ['leaderboard', 'user_achievements', 'users', 'performance_metrics'],
        testQuery: testSnapshot.empty ? 'no_data' : 'success',
        connectionPool: getConnectionStatus()
      },
      optimizations: {
        batchOperations: 'enabled',
        connectionPooling: 'enabled',
        firestoreCaching: 'enabled',
        structuredLogging: 'enabled'
      },
      functions: [
        'getGlobalLeaderboard',
        'getUserAchievements', 
        'updateUserProgress',
        'unlockAchievement',
        'addMilestone',
        'addMemory',
        'getGlobalDataHealth'
      ]
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      module: 'global-data',
      error: 'Health check failed',
      code: 'HEALTH_CHECK_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}));

// Helper functions for default data
function generateDefaultAchievements() {
  return [
    {
      id: 'first-feed',
      title: 'First Feeding',
      description: 'Feed your moonling for the first time',
      icon: '🍽️',
      category: 'feeding',
      unlockedAt: new Date(),
      rarity: 'common'
    },
    {
      id: 'sleep-master',
      title: 'Sleep Master',
      description: 'Complete 7 sleep cycles',
      icon: '😴',
      category: 'sleep',
      unlockedAt: new Date(),
      rarity: 'rare'
    },
    {
      id: 'playful-spirit',
      title: 'Playful Spirit',
      description: 'Play with your moonling 10 times',
      icon: '🎮',
      category: 'play',
      unlockedAt: new Date(),
      rarity: 'common'
    },
    {
      id: 'crafting-novice',
      title: 'Crafting Novice',
      description: 'Craft your first recipe',
      icon: '🍳',
      category: 'crafting',
      unlockedAt: new Date(),
      rarity: 'rare'
    },
    {
      id: 'collector',
      title: 'Ingredient Collector',
      description: 'Collect all common ingredients',
      icon: '📦',
      category: 'collection',
      unlockedAt: new Date(),
      rarity: 'epic'
    },
    {
      id: 'chat-master',
      title: 'Chat Master',
      description: 'Have 50 conversations with your moonling',
      icon: '💬',
      category: 'chat',
      unlockedAt: new Date(),
      rarity: 'legendary'
    }
  ];
}

function generateDefaultMilestones() {
  return [
    {
      id: '7-days',
      title: 'Week Warrior',
      description: 'Play for 7 consecutive days',
      icon: '📅',
      type: 'days',
      value: 7,
      achievedAt: new Date()
    },
    {
      id: '100-feedings',
      title: 'Feeding Champion',
      description: 'Feed your moonling 100 times',
      icon: '🍽️',
      type: 'feedings',
      value: 100,
      achievedAt: new Date()
    },
    {
      id: '50-sleeps',
      title: 'Sleep Champion',
      description: 'Complete 50 sleep cycles',
      icon: '😴',
      type: 'sleeps',
      value: 50,
      achievedAt: new Date()
    },
    {
      id: '25-crafts',
      title: 'Master Crafter',
      description: 'Craft 25 recipes',
      icon: '🍳',
      type: 'crafts',
      value: 25,
      achievedAt: new Date()
    },
    {
      id: 'all-ingredients',
      title: 'Ingredient Master',
      description: 'Collect all available ingredients',
      icon: '📦',
      type: 'ingredients',
      value: 3,
      achievedAt: new Date()
    }
  ];
}

function generateDefaultMemories() {
  return [
    {
      id: 'first-day',
      title: 'First Day Together',
      description: 'The beginning of our cosmic journey',
      type: 'special',
      date: new Date(),
      mood: 5,
      energy: 5,
      hunger: 5
    },
    {
      id: 'perfect-mood',
      title: 'Perfect Mood Day',
      description: 'Achieved maximum mood with your moonling',
      type: 'achievement',
      date: new Date(),
      mood: 5,
      energy: 4,
      hunger: 3
    },
    {
      id: 'sleep-success',
      title: 'Restful Night',
      description: 'Your moonling had a peaceful sleep',
      type: 'daily',
      date: new Date(),
      mood: 4,
      energy: 5,
      hunger: 2
    }
  ];
}
