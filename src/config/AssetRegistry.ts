export interface NFTAsset {
  id: string;
  name: string;
  description: string;
  ipfsHash: string; // Pre-uploaded to IPFS
  category: 'character' | 'achievement' | 'item';
}

// ✅ Hardcode all your IPFS assets here
export const ASSET_REGISTRY: Record<string, NFTAsset> = {
  // Characters
  'hoshino': {
    id: 'hoshino',
    name: 'Hoshino',
    description: 'A celestial companion who brings joy and wonder to your daily life.',
    ipfsHash: 'QmYourIPFSHash1234567890abcdef', // Replace with your actual IPFS hash
    category: 'character'
  },
  
  'luna': {
    id: 'luna', 
    name: 'Luna',
    description: 'A moonlight guardian with gentle energy and mysterious powers.',
    ipfsHash: 'QmYourIPFSHash2345678901bcdefg', // Replace with your actual IPFS hash
    category: 'character'
  },
  
  'sirius': {
    id: 'sirius',
    name: 'Sirius',
    description: 'A bright star companion with boundless energy and loyalty.',
    ipfsHash: 'QmYourIPFSHash3456789012cdefgh', // Replace with your actual IPFS hash
    category: 'character'
  },
  
  'lyra': {
    id: 'lyra',
    name: 'Lyra',
    description: 'A musical soul who harmonizes with the cosmic frequencies.',
    ipfsHash: 'QmYourIPFSHash4567890123defghi', // Replace with your actual IPFS hash
    category: 'character'
  },
  
  // Achievements  
  'first_feed': {
    id: 'first_feed',
    name: 'First Meal',
            description: 'Fed your moonling for the first time. The beginning of a beautiful friendship!',
    ipfsHash: 'QmAchievementHash1234567890abc', // Replace with your actual IPFS hash
    category: 'achievement'
  },
  
  'caretaker_10': {
    id: 'caretaker_10',
    name: 'Caring Soul',
            description: 'Fed your moonling 10 times. You\'re becoming a great caretaker!',
    ipfsHash: 'QmAchievementHash2345678901bcd', // Replace with your actual IPFS hash
    category: 'achievement'
  },
  
  'caretaker_50': {
    id: 'caretaker_50',
    name: 'Dedicated Caretaker', 
            description: 'Fed your moonling 50 times. Your dedication knows no bounds!',
    ipfsHash: 'QmAchievementHash3456789012cde', // Replace with your actual IPFS hash
    category: 'achievement'
  },
  
  'playful_friend': {
    id: 'playful_friend',
    name: 'Playful Friend',
            description: 'Played with your moonling 25 times. Fun is the key to happiness!',
    ipfsHash: 'QmAchievementHash4567890123def', // Replace with your actual IPFS hash
    category: 'achievement'
  },
  
  'night_owl': {
    id: 'night_owl',
    name: 'Night Owl',
            description: 'Put your moonling to sleep 20 times. Sweet dreams make for happy moonlings!',
    ipfsHash: 'QmAchievementHash5678901234efg', // Replace with your actual IPFS hash
    category: 'achievement'
  },
  
  // Items
  'cosmic_ball': {
    id: 'cosmic_ball',
    name: 'Cosmic Ball',
    description: 'A toy that brings endless joy and sparkles with stardust.',
    ipfsHash: 'QmItemHash1234567890abcdefgh', // Replace with your actual IPFS hash
    category: 'item'
  },
  
  'star_crown': {
    id: 'star_crown',
    name: 'Starlight Crown',
    description: 'A crown that sparkles with celestial light and grants wisdom.',
    ipfsHash: 'QmItemHash2345678901bcdefghi', // Replace with your actual IPFS hash
    category: 'item'
  },
  
  'energy_crystal': {
    id: 'energy_crystal',
    name: 'Energy Crystal',
    description: 'A powerful crystal that restores energy and vitality.',
    ipfsHash: 'QmItemHash3456789012cdefghij', // Replace with your actual IPFS hash
    category: 'item'
  }
  
  // ✅ ADD NEW ASSETS HERE - Just add new entries!
  // Example:
  // 'new_character': {
  //   id: 'new_character',
  //   name: 'New Character Name',
  //   description: 'Character description',
  //   ipfsHash: 'QmYourNewIPFSHash',
  //   category: 'character'
  // }
};

// Helper functions
export const getAsset = (id: string): NFTAsset | null => {
  return ASSET_REGISTRY[id] || null;
};

export const getAssetsByCategory = (category: NFTAsset['category']): NFTAsset[] => {
  return Object.values(ASSET_REGISTRY).filter(asset => asset.category === category);
};

export const getAllAssets = (): NFTAsset[] => {
  return Object.values(ASSET_REGISTRY);
};

export const getCharacterAssets = (): NFTAsset[] => {
  return getAssetsByCategory('character');
};

export const getAchievementAssets = (): NFTAsset[] => {
  return getAssetsByCategory('achievement');
};

export const getItemAssets = (): NFTAsset[] => {
  return getAssetsByCategory('item');
};