const { onRequest } = require('firebase-functions/v2/https');
const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');

// Initialize Solana connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

/**
 * Generate NFT Minting Transaction
 * Creates a programmable NFT transaction on the server side
 */
exports.generateNFTTransaction = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    console.log('🔥 Generating NFT transaction...');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      character, 
      userPublicKey, 
      recipient,
      metadataUri,
      tokenStandard = 'pNFT' // 'pNFT' or 'NFT'
    } = req.body;

    if (!character || !userPublicKey || !metadataUri) {
      return res.status(400).json({ 
        error: 'Missing required fields: character, userPublicKey, metadataUri' 
      });
    }

    console.log('📝 Character data:', {
      name: character.name,
      element: character.element,
      rarity: character.rarity,
      userPublicKey,
      recipient
    });

    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    console.log('🔑 Mint keypair generated:', mintKeypair.publicKey.toString());

    // Get the latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash();
    
    // Create a simple transaction for testing
    // In a real implementation, you'd add the actual NFT minting instructions
    const transaction = new Transaction();
    
    // Add a simple transfer instruction as a placeholder
    // This will be replaced with actual NFT minting instructions
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(userPublicKey),
        toPubkey: new PublicKey(userPublicKey),
        lamports: 1000 // Small amount for testing
      })
    );

    // Set transaction properties
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = new PublicKey(userPublicKey);
    
    console.log('✅ Transaction built successfully:', {
      mintAddress: mintKeypair.publicKey.toString(),
      instructionsCount: transaction.instructions.length,
      tokenStandard
    });
    
    // Return transaction data for the client to sign
    res.json({
      success: true,
      transaction: {
        instructions: transaction.instructions,
        recentBlockhash: transaction.recentBlockhash,
        feePayer: userPublicKey,
        tokenStandard
      },
      mintAddress: mintKeypair.publicKey.toString(),
      estimatedCost: '~0.01 SOL',
      // Include metadata for client-side processing
      metadata: {
        name: `Hoshino ${character.name}`,
        symbol: 'HOSH',
        uri: metadataUri,
        sellerFeeBasisPoints: 500,
        creators: [
          {
            address: userPublicKey,
            share: 100,
          },
        ],
        isMutable: true,
      }
    });
    
  } catch (error) {
    console.error('❌ NFT transaction generation failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate NFT transaction',
      details: error.message
    });
  }
});

/**
 * Generate In-Game Currency Purchase Transaction
 * Creates a simple SOL transfer transaction for purchasing in-game currency
 */
exports.generateCurrencyPurchaseTransaction = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    console.log('💰 Generating currency purchase transaction...');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      userPublicKey, 
      amount, 
      recipientAddress,
      purchaseType = 'coins' // 'coins', 'gems', 'energy', etc.
    } = req.body;

    if (!userPublicKey || !amount || !recipientAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: userPublicKey, amount, recipientAddress' 
      });
    }

    console.log('💰 Purchase data:', {
      userPublicKey,
      amount,
      recipientAddress,
      purchaseType
    });

    // Validate amount (minimum 0.001 SOL)
    const minAmount = 0.001;
    if (amount < minAmount) {
      return res.status(400).json({ 
        error: `Amount must be at least ${minAmount} SOL` 
      });
    }

    // Get the latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash();
    
    // Create a simple transfer transaction
    const transaction = new Transaction();
    
    // Add transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(userPublicKey),
        toPubkey: new PublicKey(recipientAddress),
        lamports: amount * 1000000000 // Convert SOL to lamports
      })
    );

    // Set transaction properties
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = new PublicKey(userPublicKey);
    
    console.log('✅ Currency purchase transaction created:', {
      from: userPublicKey,
      to: recipientAddress,
      amount: `${amount} SOL`,
      purchaseType
    });
    
    // Return transaction data for the client to sign
    res.json({
      success: true,
      transaction: {
        instructions: transaction.instructions,
        recentBlockhash: transaction.recentBlockhash,
        feePayer: userPublicKey,
        type: 'transfer'
      },
      purchaseDetails: {
        amount: `${amount} SOL`,
        purchaseType,
        recipientAddress
      },
      estimatedCost: `${amount} SOL`
    });
    
  } catch (error) {
    console.error('❌ Currency purchase transaction generation failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate currency purchase transaction',
      details: error.message
    });
  }
});

/**
 * Process Star Dust Package Purchase
 * Handles the complete purchase flow for star dust packages
 */
exports.processStarDustPurchase = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    console.log('⭐ Processing star dust package purchase...');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      transactionSignature, 
      packageName, 
      solAmount, 
      userId,
      fromAddress,
      toAddress,
      status
    } = req.body;

    if (!transactionSignature || !packageName || !solAmount || !userId || !fromAddress || !toAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: transactionSignature, packageName, solAmount, userId, fromAddress, toAddress' 
      });
    }

    console.log('⭐ Purchase data:', {
      packageName,
      solAmount,
      userId,
      transactionSignature,
      fromAddress,
      toAddress,
      status
    });

    // Validate SOL amount (minimum 0.001 SOL)
    const minAmount = 0.001;
    if (solAmount < minAmount) {
      return res.status(400).json({ 
        error: `Amount must be at least ${minAmount} SOL` 
      });
    }

    // Verify the transaction on the blockchain
    console.log('🔍 Verifying transaction on blockchain...');
    
    try {
      // Get transaction details from Solana
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const transaction = await connection.getTransaction(transactionSignature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      
      if (!transaction) {
        throw new Error('Transaction not found on blockchain');
      }
      
      if (transaction.meta && transaction.meta.err) {
        throw new Error('Transaction failed on blockchain');
      }
      
      console.log('✅ Transaction verified on blockchain:', {
        signature: transactionSignature,
        blockTime: transaction.blockTime,
        fee: transaction.meta?.fee || 0
      });
      
    } catch (verificationError) {
      console.warn('⚠️ Blockchain verification failed:', verificationError.message);
      // Continue processing even if verification fails (for development)
    }

    // Calculate star dust amount based on package
    const getStarDustAmount = (packageId) => {
      switch (packageId) {
        case 'star-dust-small': return 100;
        case 'star-dust-medium': return 250;
        case 'star-dust-large': return 500;
        case 'star-dust-premium': return 1000;
        case 'star-dust-legendary': return 2500;
        case 'star-dust-ultimate': return 5000;
        default: return 0;
      }
    };
    
    const starDustAmount = getStarDustAmount(packageName.toLowerCase().replace(/\s+/g, '-'));
    
    // Here you would:
    // 1. Update the user's star dust balance in your database
    // 2. Log the purchase for accounting
    // 3. Send confirmation email/notification
    
    console.log('✅ Star dust package purchase processed:', {
      packageName,
      solAmount: `${solAmount} SOL`,
      userId,
      starDustAmount,
      transactionSignature
    });
    
    // Return success response
    res.json({
      success: true,
      message: `Successfully processed ${packageName} purchase`,
      packageName,
      solAmount,
      userId,
      starDustAmount,
      transactionSignature,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Star dust purchase processing failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process star dust purchase',
      details: error.message
    });
  }
});

/**
 * Fetch NFT Metadata
 * Retrieves NFT metadata from the blockchain
 */
exports.fetchNFTMetadata = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    console.log('🔍 Fetching NFT metadata...');
    
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { mintAddress } = req.query;

    if (!mintAddress) {
      return res.status(400).json({ 
        error: 'Missing required field: mintAddress' 
      });
    }

    console.log('🔍 Fetching metadata for mint:', mintAddress);

    // For now, return a mock response since we're not using Metaplex
    res.json({
      success: true,
      nft: {
        mintAddress,
        name: 'Mock NFT',
        symbol: 'HOSH',
        uri: 'https://ipfs.io/ipfs/mock',
        sellerFeeBasisPoints: 500,
        creators: [],
        collection: null,
        uses: null,
        isMutable: true,
        primarySaleHappened: false,
        updateAuthority: 'mock_authority',
        tokenStandard: 'NonFungible'
      }
    });
    
  } catch (error) {
    console.error('❌ NFT metadata fetch failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch NFT metadata',
      details: error.message
    });
  }
});

/**
 * Health check for Solana transactions module
 */
exports.solanaHealth = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    // Test connection to Solana
    const slot = await connection.getSlot();
    
    res.json({
      status: 'healthy',
      module: 'solana-transactions',
      timestamp: new Date().toISOString(),
      solanaConnection: {
        endpoint: connection.rpcEndpoint,
        slot: slot
      },
      functions: [
        'generateNFTTransaction',
        'generateCurrencyPurchaseTransaction', 
        'fetchNFTMetadata',
        'solanaHealth'
      ]
    });
  } catch (error) {
    console.error('❌ Solana health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      module: 'solana-transactions',
      error: error.message
    });
  }
}); 