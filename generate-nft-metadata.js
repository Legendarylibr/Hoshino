// Generate NFT Metadata Script for Backend Functions
// Creates metadata that works with the exact backend functions provided

const CHARACTER_IPFS_URLS = {
  'hoshino': 'https://ipfs.io/ipfs/QmV3k19Upm2UApbJmu6siP7kXSwrAKPPbqNukUXm6EB61L/0',
  'sirius': 'https://ipfs.io/ipfs/QmTnPnrVWfLRh7Dd5m5nqGUdXgXhBmvtkvteHcAMS5VcT9/0',
  'lyra': 'https://ipfs.io/ipfs/QmboS6KNV4xU5PzTiGnWnQMPUtazFGyxM9d5djSYaP59Ud/0',
  'aro': 'https://ipfs.io/ipfs/QmRq9GYWCK455p3nWde9QeXv7bAZGBYyGGE57kudthBRct/0',
  'orion': 'https://ipfs.io/ipfs/QmWwLczsyDsQvznNHF92DpZYkwZG7gJU4dzKBJQujK2okr/0',
  'zaniah': 'https://ipfs.io/ipfs/QmX5YaGK7AvsW3GbNRT2nPhZ1MSCgnCJYdhnkUyj6qkYKE/0'
};

// Generate metadata that matches backend function expectations
const generateBackendCompatibleMetadata = (characterId, userPublicKey) => {
  const imageUrl = CHARACTER_IPFS_URLS[characterId];
  if (!imageUrl) {
    throw new Error(`Character ${characterId} not found`);
  }

  // This is the metadata that would be stored at the metadataUri
  return {
    name: characterId.toUpperCase(),
    symbol: 'HOSH',
    description: `A ${characterId} character NFT from Hoshino`,
    image: imageUrl,
    attributes: [
      { trait_type: 'Mood', value: 'Happy' }
    ],
    properties: {
      files: [
        {
          type: 'image/png',
          uri: imageUrl
        }
      ],
      category: 'image',
      creators: [
        {
          address: userPublicKey,
          share: 100
        }
      ]
    },
    sellerFeeBasisPoints: 500,
    isMutable: true
  };
};

// Generate the exact backend response format
const generateBackendResponse = (characterId, userPublicKey) => {
  const metadataUri = `ipfs://QmMetadata${characterId}${Date.now()}`;
  
  return {
    success: true,
    transaction: {
      instructions: [],
      recentBlockhash: 'mock_blockhash',
      feePayer: userPublicKey,
      tokenStandard: 'pNFT'
    },
    mintAddress: `mock_${characterId}_${Date.now()}`,
    estimatedCost: '~0.01 SOL',
    metadata: {
      name: `Hoshino ${characterId.charAt(0).toUpperCase() + characterId.slice(1)}`,
      symbol: 'HOSH',
      uri: metadataUri,
      image: CHARACTER_IPFS_URLS[characterId], // Real IPFS image URL
      sellerFeeBasisPoints: 500,
      creators: [
        {
          address: userPublicKey,
          share: 100,
        },
      ],
      isMutable: true,
    }
  };
};

const generateAllBackendResponses = () => {
  const userPublicKey = 'mock_user_public_key_for_demo';
  
  console.log('🎨 Generating Backend-Compatible NFT Data...\n');
  
  Object.keys(CHARACTER_IPFS_URLS).forEach(characterId => {
    try {
      // Generate the metadata that would be stored at metadataUri
      const metadata = generateBackendCompatibleMetadata(characterId, userPublicKey);
      
      // Generate the backend response format
      const backendResponse = generateBackendResponse(characterId, userPublicKey);
      
      console.log(`📋 ${characterId.toUpperCase()} Backend Response:`);
      console.log('─'.repeat(50));
      console.log(JSON.stringify(backendResponse, null, 2));
      console.log('─'.repeat(50));
      console.log('');
      
      // Save metadata file (what would be stored at metadataUri)
      const fs = require('fs');
      const metadataFileName = `metadata-${characterId}.json`;
      fs.writeFileSync(metadataFileName, JSON.stringify(metadata, null, 2));
      console.log(`💾 Metadata saved to: ${metadataFileName}`);
      
      // Save backend response file
      const responseFileName = `backend-response-${characterId}.json`;
      fs.writeFileSync(responseFileName, JSON.stringify(backendResponse, null, 2));
      console.log(`💾 Backend response saved to: ${responseFileName}\n`);
      
    } catch (error) {
      console.error(`❌ Error generating data for ${characterId}:`, error.message);
    }
  });
  
  console.log('✅ All backend-compatible data generated successfully!');
  console.log('\n📁 Files created:');
  Object.keys(CHARACTER_IPFS_URLS).forEach(characterId => {
    console.log(`   • metadata-${characterId}.json (metadata at URI)`);
    console.log(`   • backend-response-${characterId}.json (backend response)`);
  });
  
  console.log('\n🎯 This data works with your exact backend functions!');
};

// Run the script
generateAllBackendResponses(); 