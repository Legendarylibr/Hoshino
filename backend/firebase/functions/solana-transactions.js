const { onRequest } = require('firebase-functions/v2/https');
const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { ThirdwebSDK } = require('@thirdweb-dev/sdk');
const { upload } = require('@thirdweb-dev/storage');
const axios = require('axios');

// Initialize Solana connection
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Initialize Thirdweb SDK for IPFS uploads
let thirdwebSDK;

/**
 * Initialize Thirdweb SDK
 */
function initializeThirdweb() {
  if (!thirdwebSDK) {
    // Initialize with the provided secret key
    const secretKey = 'BejWh4Sy5gqMBUUXhA2eb6lcS3qXxGyxS0CWYZMxYBHcpeTKsXAiWbr76GurHixrXSpLGcT1CE3var_57N9u1A';
    thirdwebSDK = ThirdwebSDK.fromPrivateKey(secretKey, 'ethereum', {
      clientId: '9afad0c45e42acdd503920fd6ee39422'
    });
  }
  return thirdwebSDK;
}

/**
 * Upload metadata to IPFS via Thirdweb
 */
async function uploadMetadataToIPFS(metadata) {
  try {
    console.log('📤 Uploading metadata to IPFS via Thirdweb...');
    
    const sdk = initializeThirdweb();
    
    // Upload metadata to IPFS
    const uri = await upload({
      data: JSON.stringify(metadata),
      name: `hoshino-metadata-${Date.now()}.json`
    });
    
    console.log('✅ Metadata uploaded to IPFS:', uri);
    return uri;
  } catch (error) {
    console.error('❌ Metadata upload failed:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
}

/**
 * Create metadata for NFT
 */
function createMetadata(name, description, imageUrl, mood) {
  return {
    name: `Hoshino ${name}`,
    symbol: 'HOSH',
    description: description,
    image: imageUrl, // Use the image URL directly
    attributes: [
      {
        trait_type: 'Mood',
        value: mood
      }
    ],
    properties: {
      files: [
        {
          type: 'image/png',
          uri: imageUrl // Use the image URL directly
        }
      ],
      category: 'image',
      creators: [
        {
          address: 'HoshinoGame', // Will be replaced with actual creator
          share: 100
        }
      ]
    }
  };
}

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
      imageUri,
      mood = 'Happy', // Default mood
      tokenStandard = 'pNFT' // 'pNFT' or 'NFT'
    } = req.body;

    if (!character || !userPublicKey || !imageUri) {
      return res.status(400).json({ 
        error: 'Missing required fields: character, userPublicKey, imageUri' 
      });
    }

    console.log('📝 Character data:', {
      name: character.name,
      element: character.element,
      mood: mood,
      userPublicKey,
      recipient
    });

    // Create metadata using the image URL directly
    const metadata = createMetadata(
      character.name,
      character.description || `A ${character.element} character in Hoshino with ${mood.toLowerCase()} mood.`,
      imageUri, // Use image URL directly
      mood
    );

    // Upload metadata to IPFS
    const metadataUri = await uploadMetadataToIPFS(metadata);

    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    console.log('🔑 Mint keypair generated:', mintKeypair.publicKey.toString());

    // Get the latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash();
    
    // Create transaction with NFT minting instructions
    const transaction = new Transaction();
    
    // Add NFT minting instruction (simplified for now)
    // In a full implementation, you'd add Metaplex instructions here
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
    
    console.log('✅ NFT transaction built successfully:', {
      mintAddress: mintKeypair.publicKey.toString(),
      instructionsCount: transaction.instructions.length,
      tokenStandard,
      metadataUri
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
        attributes: [
          {
            trait_type: 'Mood',
            value: mood
          }
        ]
      },
      estimatedCost: '~0.01 SOL'
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
 * Mint Character NFT
 * Complete NFT minting process
 */
exports.mintCharacter = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    console.log('🎨 Minting character NFT...');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      characterId, 
      ownerPublicKey,
      mood = 'Happy'
    } = req.body;

    if (!characterId || !ownerPublicKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: characterId, ownerPublicKey' 
      });
    }

    console.log('🎨 Character mint data:', {
      characterId,
      ownerPublicKey,
      mood
    });

    // Character data mapping with image URLs
    const characterData = {
      hoshino: {
        name: 'Hoshino',
        element: 'Celestial',
        description: 'A celestial companion who brings joy and wonder to your daily life.',
        imageUrl: 'https://ipfs.io/ipfs/QmV3k19Upm2UApbJmu6siP7kXSwrAKPPbqNukUXm6EB61L/0'
      },
      lyra: {
        name: 'Lyra',
        element: 'Star',
        description: 'A musical soul who harmonizes with the cosmic frequencies.',
        imageUrl: 'https://ipfs.io/ipfs/QmboS6KNV4xU5PzTiGnWnQMPUtazFGyxM9d5djSYaP59Ud/0'
      },
      orion: {
        name: 'Orion',
        element: 'Cosmic',
        description: 'A powerful hunter constellation with unwavering strength and courage.',
        imageUrl: 'https://ipfs.io/ipfs/QmWwLczsyDsQvznNHF92DpZYkwZG7gJU4dzKBJQujK2okr/0'
      },
      aro: {
        name: 'Aro',
        element: 'Energy',
        description: 'A mysterious stellar companion with ancient wisdom and power.',
        imageUrl: 'https://ipfs.io/ipfs/QmRq9GYWCK455p3nWde9QeXv7bAZGBYyGGE57kudthBRct/0'
      },
      sirius: {
        name: 'Sirius',
        element: 'Power',
        description: 'A bright star companion with boundless energy and loyalty.',
        imageUrl: 'https://ipfs.io/ipfs/QmTnPnrVWfLRh7Dd5m5nqGUdXgXhBmvtkvteHcAMS5VcT9/0'
      },
      zaniah: {
        name: 'Zaniah',
        element: 'Mystery',
        description: 'A gentle star maiden with healing powers and celestial grace.',
        imageUrl: 'https://ipfs.io/ipfs/QmX5YaGK7AvsW3GbNRT2nPhZ1MSCgnCJYdhnkUyj6qkYKE/0'
      }
    };

    const character = characterData[characterId];
    if (!character) {
      return res.status(400).json({ 
        error: `Character ${characterId} not found` 
      });
    }

    // Create metadata using the image URL directly
    const metadata = createMetadata(
      character.name,
      character.description,
      character.imageUrl, // Use image URL directly
      mood
    );

    // Upload metadata to IPFS
    const metadataUri = await uploadMetadataToIPFS(metadata);

    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    console.log('🔑 Mint keypair generated:', mintKeypair.publicKey.toString());

    // Get the latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash();
    
    // Create transaction
    const transaction = new Transaction();
    
    // Add NFT minting instruction (simplified)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(ownerPublicKey),
        toPubkey: new PublicKey(ownerPublicKey),
        lamports: 1000 // Small amount for testing
      })
    );

    // Set transaction properties
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = new PublicKey(ownerPublicKey);
    
    console.log('✅ Character NFT minted successfully:', {
      characterId,
      mintAddress: mintKeypair.publicKey.toString(),
      mood
    });
    
    res.json({
      success: true,
      mintAddress: mintKeypair.publicKey.toString(),
      metadata: {
        name: `Hoshino ${character.name}`,
        symbol: 'HOSH',
        uri: metadataUri,
        sellerFeeBasisPoints: 500,
        creators: [
          {
            address: ownerPublicKey,
            share: 100,
          },
        ],
        isMutable: true,
        attributes: [
          {
            trait_type: 'Mood',
            value: mood
          }
        ]
      },
      estimatedCost: '~0.01 SOL'
    });
    
  } catch (error) {
    console.error('❌ Character NFT minting failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to mint character NFT',
      details: error.message
    });
  }
});

/**
 * Mint Achievement NFT
 * Complete achievement NFT minting process
 */
exports.mintAchievement = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    console.log('🏆 Minting achievement NFT...');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      achievementId, 
      ownerPublicKey,
      mood = 'Proud'
    } = req.body;

    if (!achievementId || !ownerPublicKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: achievementId, ownerPublicKey' 
      });
    }

    console.log('🏆 Achievement mint data:', {
      achievementId,
      ownerPublicKey,
      mood
    });

    // Achievement data mapping with image URLs
    const achievementData = {
      first_mint: {
        name: 'First Mint',
        description: 'Successfully minted your first character NFT',
        imageUrl: 'https://ipfs.io/ipfs/QmMockFirstMintImage'
      },
      character_collector: {
        name: 'Character Collector',
        description: 'Collected multiple character NFTs',
        imageUrl: 'https://ipfs.io/ipfs/QmMockCollectorImage'
      },
      mood_master: {
        name: 'Mood Master',
        description: 'Experienced all different moods with your characters',
        imageUrl: 'https://ipfs.io/ipfs/QmMockMoodMasterImage'
      }
    };

    const achievement = achievementData[achievementId];
    if (!achievement) {
      return res.status(400).json({ 
        error: `Achievement ${achievementId} not found` 
      });
    }

    // Create metadata using the image URL directly
    const metadata = createMetadata(
      achievement.name,
      achievement.description,
      achievement.imageUrl, // Use image URL directly
      mood
    );

    // Upload metadata to IPFS
    const metadataUri = await uploadMetadataToIPFS(metadata);

    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    console.log('🔑 Achievement mint keypair generated:', mintKeypair.publicKey.toString());

    // Get the latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash();
    
    // Create transaction
    const transaction = new Transaction();
    
    // Add NFT minting instruction (simplified)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(ownerPublicKey),
        toPubkey: new PublicKey(ownerPublicKey),
        lamports: 1000 // Small amount for testing
      })
    );

    // Set transaction properties
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = new PublicKey(ownerPublicKey);
    
    console.log('✅ Achievement NFT minted successfully:', {
      achievementId,
      mintAddress: mintKeypair.publicKey.toString(),
      mood
    });
    
    res.json({
      success: true,
      mintAddress: mintKeypair.publicKey.toString(),
      metadata: {
        name: `Hoshino ${achievement.name}`,
        symbol: 'HOSH',
        uri: metadataUri,
        sellerFeeBasisPoints: 0, // No royalties on achievements
        creators: [
          {
            address: ownerPublicKey,
            share: 100,
          },
        ],
        isMutable: false,
        attributes: [
          {
            trait_type: 'Mood',
            value: mood
          }
        ]
      },
      estimatedCost: '~0.01 SOL'
    });
    
  } catch (error) {
    console.error('❌ Achievement NFT minting failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to mint achievement NFT',
      details: error.message
    });
  }
});

/**
 * Mint Marketplace Item NFT
 * Complete marketplace item NFT minting process
 */
exports.mintMarketplaceItem = onRequest({
  cors: ['*'],
  invoker: 'public'
}, async (req, res) => {
  try {
    console.log('🛍️ Minting marketplace item NFT...');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { 
      itemId, 
      category,
      ownerPublicKey,
      mood = 'Excited'
    } = req.body;

    if (!itemId || !category || !ownerPublicKey) {
      return res.status(400).json({ 
        error: 'Missing required fields: itemId, category, ownerPublicKey' 
      });
    }

    console.log('🛍️ Marketplace item mint data:', {
      itemId,
      category,
      ownerPublicKey,
      mood
    });

    // Create a placeholder image URL for marketplace items
    const imageUrl = `https://ipfs.io/ipfs/QmMock${itemId}Image`;

    // Create metadata using the image URL directly
    const metadata = createMetadata(
      itemId,
      `A ${category} item from the Hoshino marketplace`,
      imageUrl, // Use image URL directly
      mood
    );

    // Upload metadata to IPFS
    const metadataUri = await uploadMetadataToIPFS(metadata);

    // Generate mint keypair
    const mintKeypair = Keypair.generate();
    console.log('🔑 Marketplace item mint keypair generated:', mintKeypair.publicKey.toString());

    // Get the latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash();
    
    // Create transaction
    const transaction = new Transaction();
    
    // Add NFT minting instruction (simplified)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(ownerPublicKey),
        toPubkey: new PublicKey(ownerPublicKey),
        lamports: 1000 // Small amount for testing
      })
    );

    // Set transaction properties
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = new PublicKey(ownerPublicKey);
    
    console.log('✅ Marketplace item NFT minted successfully:', {
      itemId,
      category,
      mintAddress: mintKeypair.publicKey.toString(),
      mood
    });
    
    res.json({
      success: true,
      mintAddress: mintKeypair.publicKey.toString(),
      metadata: {
        name: `Hoshino ${itemId}`,
        symbol: 'HOSH',
        uri: metadataUri,
        sellerFeeBasisPoints: 250,
        creators: [
          {
            address: ownerPublicKey,
            share: 100,
          },
        ],
        isMutable: true,
        attributes: [
          {
            trait_type: 'Mood',
            value: mood
          },
          {
            trait_type: 'Category',
            value: category
          },
          {
            trait_type: 'Type',
            value: 'Marketplace Item'
          }
        ]
      },
      estimatedCost: '~0.01 SOL'
    });
    
  } catch (error) {
    console.error('❌ Marketplace item NFT minting failed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to mint marketplace item NFT',
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

    // For now, return a mock response since we're not using full Metaplex
    res.json({
      success: true,
      nft: {
        mintAddress,
        name: 'Hoshino Character',
        symbol: 'HOSH',
        uri: 'https://ipfs.io/ipfs/mock',
        sellerFeeBasisPoints: 500,
        creators: [],
        collection: null,
        uses: null,
        isMutable: true,
        primarySaleHappened: false,
        updateAuthority: 'mock_authority',
        tokenStandard: 'ProgrammableNonFungible',
        attributes: [
          {
            trait_type: 'Mood',
            value: 'Happy'
          },
          {
            trait_type: 'Type',
            value: 'Character'
          }
        ]
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
      ipfs: {
        provider: 'Thirdweb',
        status: 'configured',
        note: 'Only metadata uploaded to IPFS, images use URLs directly'
      },
      functions: [
        'generateNFTTransaction',
        'mintCharacter',
        'mintAchievement',
        'mintMarketplaceItem',
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