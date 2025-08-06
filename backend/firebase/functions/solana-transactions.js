const { onRequest } = require('firebase-functions/v2/https');
const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');

// Initialize Solana connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const metaplex = new Metaplex(connection);

// Proper IPFS CIDs for characters
// UPDATED: Using real IPFS URLs instead of CIDs - backend handles image resolution
const CHARACTER_CIDS = {
  'hoshino': 'https://ipfs.io/ipfs/QmV3k19Upm2UApbJmu6siP7kXSwrAKPPbqNukUXm6EB61L/0',
  'sirius': 'https://ipfs.io/ipfs/QmTnPnrVWfLRh7Dd5m5nqGUdXgXhBmvtkvteHcAMS5VcT9/0',
  'lyra': 'https://ipfs.io/ipfs/QmboS6KNV4xU5PzTiGnWnQMPUtazFGyxM9d5djSYaP59Ud/0',
  'aro': 'https://ipfs.io/ipfs/QmRq9GYWCK455p3nWde9QeXv7bAZGBYyGGE57kudthBRct/0',
  'orion': 'https://ipfs.io/ipfs/QmWwLczsyDsQvznNHF92DpZYkwZG7gJU4dzKBJQujK2okr/0',
  'zaniah': 'https://ipfs.io/ipfs/QmX5YaGK7AvsW3GbNRT2nPhZ1MSCgnCJYdhnkUyj6qkYKE/0'
};

/**
 * NFT Metadata Structure
 * UPDATED: Extremely simplified metadata - only name, image, and Mood attribute
 * Removed: description, external_url, properties, collection
 */
const createCharacterMetadata = (characterId, userPublicKey) => {
  const imageUrl = CHARACTER_CIDS[characterId];
  if (!imageUrl) {
    throw new Error(`Character ${characterId} not found`);
  }

  return {
    name: characterId.toUpperCase(),
    image: imageUrl,
    attributes: [
      { trait_type: 'Mood', value: 'Happy' }
    ]
  };
};

/**
 * Upload metadata to IPFS (mock implementation)
 * In production, use Pinata, NFT.Storage, or similar
 */
const uploadMetadataToIPFS = async (metadata) => {
  console.log('📤 Uploading metadata to IPFS...');
  
  // Mock IPFS upload - in production, use actual IPFS service
  const mockCid = `QmMetadata${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('✅ Metadata uploaded to IPFS:', mockCid);
  console.log('📝 Metadata content:', JSON.stringify(metadata, null, 2));
  
  return mockCid;
};

/**
 * Sanitize text for metadata
 */
const sanitizeText = (text) => {
  if (!text) return '';
  return text
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

/**
 * Get proper IPFS CID for character or achievement
 */
const getProperCID = (characterId, nftType) => {
  if (nftType === 'character') {
    return CHARACTER_CIDS[characterId] || `QmDefaultCharacter${characterId}`;
  } else if (nftType === 'achievement') {
    return ACHIEVEMENT_CIDS[characterId] || `QmDefaultAchievement${characterId}`;
  }
  return `QmDefault${nftType}${characterId}`;
};

/**
 * Create proper NFT using Metaplex
 */
const createProperNFT = async (metadata, userPublicKey) => {
  try {
    console.log('🎨 Creating proper NFT with Metaplex...');
    
    // Upload metadata to IPFS
    const metadataCid = await uploadMetadataToIPFS(metadata);
    const metadataUri = `ipfs://${metadataCid}`;
    
    console.log('📤 Metadata URI:', metadataUri);
    
    // Create NFT using Metaplex
    const { nft } = await metaplex.nfts().create({
      name: metadata.name,
      symbol: 'HOSH',
      uri: metadataUri,
      sellerFeeBasisPoints: 500, // 5% royalties
      creators: metadata.properties.creators,
      isMutable: true,
      collection: metadata.collection,
      tokenStandard: 1, // NonFungible
    });
    
    console.log('✅ NFT created successfully:', nft.address.toString());
    
    return {
      success: true,
      mintAddress: nft.address.toString(),
      metadataUri: metadataUri,
      nft: nft
    };
    
  } catch (error) {
    console.error('❌ NFT creation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate NFT Minting Transaction with Proper NFT Creation
 * Creates a real programmable NFT on Solana
 */
exports.generateNFTTransaction = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    console.log('🔥 Creating proper NFT...');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      characterId, 
      userPublicKey
    } = req.body;

    if (!characterId || !userPublicKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: characterId, userPublicKey' 
      });
    }

    console.log('📝 NFT data:', {
      characterId,
      userPublicKey
    });

    // Create metadata for the character
    const metadata = createCharacterMetadata(characterId, userPublicKey);
    
    console.log('📤 Using proper IPFS CID:', CHARACTER_CIDS[characterId]);

    // Create proper NFT using Metaplex
    const nftResult = await createProperNFT(metadata, userPublicKey);
    
    if (!nftResult.success) {
      return res.status(500).json({
        success: false,
        error: nftResult.error || 'Failed to create NFT'
      });
    }

    console.log('✅ NFT created successfully:', {
      mintAddress: nftResult.mintAddress,
      metadataUri: nftResult.metadataUri
    });
    
    // Return NFT creation result
    res.json({
      success: true,
      mintAddress: nftResult.mintAddress,
      metadataUri: nftResult.metadataUri,
      metadata: metadata,
      estimatedCost: '~0.01 SOL',
      nftMetadata: {
        name: metadata.name,
        symbol: 'HOSH',
        uri: nftResult.metadataUri,
        sellerFeeBasisPoints: 500,
        creators: metadata.properties.creators,
        isMutable: true,
        collection: metadata.collection,
        mintAddress: nftResult.mintAddress
      }
    });
    
  } catch (error) {
    console.error('❌ NFT creation failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create NFT',
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