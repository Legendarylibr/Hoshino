// Utility functions for consistent asset path handling

// Asset folder paths
export const ASSET_PATHS = {
    MOONLINGS: 'assets/moonlings',
    INGREDIENTS: 'assets/ingredients',
    BACKGROUNDS: 'assets/backgrounds',
    UI: 'assets/ui',
    LOGOS: 'assets/logos'
} as const;

// Helper function to get asset path
export const getAssetPath = (folder: keyof typeof ASSET_PATHS, filename: string): string => {
    return `${ASSET_PATHS[folder]}/${filename}`;
};

// Specific asset path helpers
export const getMoonlingImage = (filename: string): string => {
    return getAssetPath('MOONLINGS', filename);
};

export const getIngredientImage = (filename: string): string => {
    return getAssetPath('INGREDIENTS', filename);
};

export const getBackgroundImage = (filename: string): string => {
    return getAssetPath('BACKGROUNDS', filename);
};

export const getUIImage = (filename: string): string => {
    return getAssetPath('UI', filename);
};

export const getLogoImage = (filename: string): string => {
    return getAssetPath('LOGOS', filename);
};

// Asset loading helpers for React Native
export const requireMoonlingImage = (filename: string) => {
    switch (filename) {
        case 'ARO.gif':
            return require('../../assets/moonlings/ARO.gif');
        case 'LYRA.gif':
            return require('../../assets/moonlings/LYRA.gif');
        case 'ORION.gif':
            return require('../../assets/moonlings/ORION.gif');
        case 'SIRIUS.gif':
            return require('../../assets/moonlings/SIRIUS.gif');
        case 'ZANIAH.gif':
            return require('../../assets/moonlings/ZANIAH.gif');
        default:
            return require('../../assets/moonlings/LYRA.gif'); // fallback
    }
};

export const requireIngredientImage = (filename: string) => {
    switch (filename) {
        case 'pink-sugar.png':
            return require('../../assets/ingredients/pink-sugar.png');
        case 'nova-egg.png':
            return require('../../assets/ingredients/nova-egg.png');
        case 'mira-berry.png':
            return require('../../assets/ingredients/mira-berry.png');
        default:
            return require('../../assets/ingredients/pink-sugar.png'); // fallback
    }
};

export const requireBackgroundImage = (filename: string) => {
    switch (filename) {
        case 'screen-bg.png':
            return require('../../assets/backgrounds/screen-bg.png');
        case 'star-life.png':
            return require('../../assets/backgrounds/star-life.png');
        case 'star-life-3.png':
            return require('../../assets/backgrounds/star-life-3.png');
        case 'bgtest.png':
            return require('../../assets/backgrounds/bgtest.png');
        default:
            return require('../../assets/backgrounds/screen-bg.png'); // fallback
    }
};

export const requireUIImage = (filename: string) => {
    switch (filename) {
        case 'button.png':
            return require('../../assets/ui/button.png');
        case 'chat.png':
            return require('../../assets/ui/chat.png');
        case 'feed.png':
            return require('../../assets/ui/feed.png');
        case 'gallery.png':
            return require('../../assets/ui/gallery.png');
        case 'games.png':
            return require('../../assets/ui/games.png');
        case 'settings.png':
            return require('../../assets/ui/settings.png');
        case 'shop.png':
            return require('../../assets/ui/shop.png');
        case 'sleepzzzz.png':
            return require('../../assets/ui/sleepzzzz.png');
        case 'hoshino-star.png':
            return require('../../assets/ui/hoshino-star.png');
        case 'hoshino-star.gif':
            return require('../../assets/ui/hoshino-star.gif');
        default:
            return require('../../assets/ui/button.png'); // fallback
    }
};

export const requireLogoImage = (filename: string) => {
    switch (filename) {
        case 'logo.png':
            return require('../../assets/logos/logo.png');
        case 'logo-final.png':
            return require('../../assets/logos/logo-final.png');
        default:
            return require('../../assets/logos/logo.png'); // fallback
    }
};

// Generic asset loader that determines the correct folder
export const requireAsset = (filename: string) => {
    if (filename.includes('ARO') || filename.includes('LYRA') || filename.includes('ORION') || 
        filename.includes('SIRIUS') || filename.includes('ZANIAH')) {
        return requireMoonlingImage(filename);
    }
    
    if (filename.includes('sugar') || filename.includes('egg') || filename.includes('berry')) {
        return requireIngredientImage(filename);
    }
    
    if (filename.includes('bg') || filename.includes('star-life') || filename.includes('screen')) {
        return requireBackgroundImage(filename);
    }
    
    if (filename.includes('logo')) {
        return requireLogoImage(filename);
    }
    
    // Default to UI images
    return requireUIImage(filename);
};
