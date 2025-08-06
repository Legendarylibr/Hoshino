const { onRequest } = require('firebase-functions/v2/https');

// Import AI chat functions from separate file
const aiChatFunctions = require('./ai-chat');

// Import Solana transaction functions from separate file
const solanaTransactionFunctions = require('./solana-transactions');

// Export all functions
exports.chat = aiChatFunctions.chat;
exports.getConversation = aiChatFunctions.getConversation;

// Export Solana transaction functions
exports.generateNFTTransaction = solanaTransactionFunctions.generateNFTTransaction;
exports.mintCharacter = solanaTransactionFunctions.mintCharacter;
exports.mintAchievement = solanaTransactionFunctions.mintAchievement;
exports.mintMarketplaceItem = solanaTransactionFunctions.mintMarketplaceItem;
exports.generateCurrencyPurchaseTransaction = solanaTransactionFunctions.generateCurrencyPurchaseTransaction;
exports.fetchNFTMetadata = solanaTransactionFunctions.fetchNFTMetadata;
exports.solanaHealth = solanaTransactionFunctions.solanaHealth;

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
      'mintCharacter',
      'mintAchievement',
      'mintMarketplaceItem',
      'generateCurrencyPurchaseTransaction',
      'fetchNFTMetadata',
      'solanaHealth',
      'health'
    ],
    modules: ['ai-chat', 'solana-transactions']
  });
}); 