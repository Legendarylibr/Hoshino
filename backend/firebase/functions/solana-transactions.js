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
    
    // Generate comprehensive metadata based on character type
    const generateMetadata = (character, userPublicKey, metadataUri) => {
      const baseMetadata = {
        name: `Hoshino ${character.name}`,
        symbol: 'HOSH',
        description: character.description || `A ${character.element} character from the Hoshino universe.`,
        image: metadataUri,
        external_url: `https://hoshino.app/characters/${character.name.toLowerCase()}`,
        attributes: [
          {
            trait_type: "Character Type",
            value: character.element
          },
          {
            trait_type: "Rarity",
            value: character.rarity
          },
          {
            trait_type: "Generation",
            value: "1"
          },
          {
            trait_type: "Mint Date",
            value: new Date().toISOString().split('T')[0]
          }
        ],
        properties: {
          files: [
            {
              type: "image/png",
              uri: metadataUri
            }
          ],
          category: "image",
          creators: [
            {
              address: userPublicKey,
              share: 100
            }
          ]
        }
      };

      // Add character-specific attributes
      if (character.element === 'Achievement') {
        baseMetadata.attributes.push({
          trait_type: "Achievement Type",
          value: "Game Achievement"
        });
        baseMetadata.attributes.push({
          trait_type: "Points Reward",
          value: "10"
        });
      }

      return baseMetadata;
    };

    const metadata = generateMetadata(character, userPublicKey, metadataUri);

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
      metadata: metadata,
      metadataUri: metadataUri
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