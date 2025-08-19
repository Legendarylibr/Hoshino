const { onRequest } = require('firebase-functions/v2/https');

// Import AI chat functions from separate file
const aiChatFunctions = require('./ai-chat');

// Import Solana transaction functions from separate file
const solanaTransactionFunctions = require('./solana-transactions');

// Import global data functions from separate file
const globalDataFunctions = require('./global-data');

// Export all functions
exports.chat = aiChatFunctions.chat;
exports.getConversation = aiChatFunctions.getConversation;

// Export Solana transaction functions
exports.generateNFTTransaction = solanaTransactionFunctions.generateNFTTransaction;
exports.generateCurrencyPurchaseTransaction = solanaTransactionFunctions.generateCurrencyPurchaseTransaction;
exports.processStarDustPurchase = solanaTransactionFunctions.processStarDustPurchase;
exports.fetchNFTMetadata = solanaTransactionFunctions.fetchNFTMetadata;
exports.solanaHealth = solanaTransactionFunctions.solanaHealth;

// Export global data functions
exports.getGlobalLeaderboard = globalDataFunctions.getGlobalLeaderboard;
exports.getUserAchievements = globalDataFunctions.getUserAchievements;
exports.updateUserProgress = globalDataFunctions.updateUserProgress;
exports.unlockAchievement = globalDataFunctions.unlockAchievement;
exports.addMilestone = globalDataFunctions.addMilestone;
exports.addMemory = globalDataFunctions.addMemory;

// Health check
exports.health = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    functions: [
      'chat', 
      'getConversation', 
      'generateNFTTransaction',
      'generateCurrencyPurchaseTransaction',
      'processStarDustPurchase',
      'fetchNFTMetadata',
      'solanaHealth',
      'getGlobalLeaderboard',
      'getUserAchievements',
      'updateUserProgress',
      'unlockAchievement',
      'addMilestone',
      'addMemory',
      'health'
    ],
    modules: ['ai-chat', 'solana-transactions', 'global-data']
  });
}); 