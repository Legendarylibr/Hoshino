export const IMAGES = {
  // Character images
  lyra: require('../../assets/PETS/PNG/LYRA.png'),
  orion: require('../../assets/PETS/PNG/ORION.png'),
  sirius: require('../../assets/PETS/PNG/sirius.png'),
  aro: require('../../assets/PETS/PNG/ARO.png'),
  zaniah: require('../../assets/PETS/PNG/Zaniah.png'),
  hoshino: require('../../assets/PETS/PNG/hoshino_official.png'),
  
  // Animated GIFs
  lyraGif: require('../../assets/PETS/GIFs/LYRA.gif'),
  orionGif: require('../../assets/PETS/GIFs/orion.gif'),
  siriusGif: require('../../assets/PETS/GIFs/sirius.gif'),
  aroGif: require('../../assets/PETS/GIFs/ARO.gif'),
  zaniahGif: require('../../assets/PETS/GIFs/zaniah.gif'),
  
  // UI elements - Updated to match original web version
  blankScreen: require('../../assets/blank screen.png'),
  screenBg: require('../../assets/screen bg.png'),
  hoshinoStar: require('../../assets/hoshino star.png'),
  eyes: require('../../assets/eyes.png'),
  glitter: require('../../assets/glitter.png'),

};

export const getCharacterImage = (characterId: string, animated: boolean = false): any => {
  const imageKey = animated ? `${characterId}Gif` : characterId;
  return IMAGES[imageKey as keyof typeof IMAGES] || IMAGES.hoshino;
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'Common':
      return '#ffffff';
    case 'Rare':
      return '#4CAF50';
    case 'Epic':
      return '#9C27B0';
    case 'Legendary':
      return '#FFD700';
    default:
      return '#ffffff';
  }
}; 