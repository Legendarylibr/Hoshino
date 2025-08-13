# 🗂️ Asset Organization & Naming Conventions

## 📁 **New Asset Folder Structure**

```
assets/
├── moonlings/          # Character sprites and animations
├── ingredients/         # Food and ingredient images
├── backgrounds/         # Background images and textures
├── ui/                 # UI elements and icons
└── logos/              # Brand logos and icons
```

## 🏷️ **Naming Conventions**

### **File Naming Rules:**
- **All lowercase** with **dashes** (kebab-case)
- **No spaces** or underscores
- **No special characters** except dashes
- **Descriptive names** that clearly indicate content

### **Examples:**
✅ **Good Names:**
- `pink-sugar.png`
- `nova-egg.png`
- `mira-berry.png`
- `screen-bg.png`
- `star-life.png`
- `hoshino-star.png`
- `logo.png`

❌ **Bad Names:**
- `Pink Sugar.png` (spaces, title case)
- `nova_egg.png` (underscores)
- `Mira Berry.png` (spaces, title case)
- `screen bg.png` (spaces)
- `star_life.png` (underscores)

## 🎯 **Asset Categories**

### **1. Moonlings (`assets/moonlings/`)**
**Purpose:** Character sprites, animations, and character-specific assets
**Content:**
- Character GIFs (ARO.gif, LYRA.gif, ORION.gif, etc.)
- Character PNGs (ARO.png, LYRA.png, ORION.png, etc.)
- Character-specific accessories or variations

**Naming Pattern:** `{character-name}.{extension}`

### **2. Ingredients (`assets/ingredients/`)**
**Purpose:** Food items, ingredients, and consumables
**Content:**
- Food ingredients (pink-sugar.png, nova-egg.png, etc.)
- Recipe result images
- Food-related assets

**Naming Pattern:** `{ingredient-name}.{extension}`

### **3. Backgrounds (`assets/backgrounds/`)**
**Purpose:** Background images, textures, and environmental assets
**Content:**
- Screen backgrounds (screen-bg.png)
- Star patterns (star-life.png, star-life-3.png)
- Environmental textures (bgtest.png)

**Naming Pattern:** `{background-name}.{extension}`

### **4. UI (`assets/ui/`)**
**Purpose:** User interface elements, buttons, and icons
**Content:**
- Buttons (button.png)
- Icons (chat.png, feed.png, settings.png, etc.)
- UI decorations (hoshino-star.png, hoshino-star.gif)

**Naming Pattern:** `{ui-element-name}.{extension}`

### **5. Logos (`assets/logos/`)**
**Purpose:** Brand logos and official graphics
**Content:**
- App logos (logo.png, logo-final.png)
- Brand assets
- Official graphics

**Naming Pattern:** `{logo-name}.{extension}`

## 🔧 **Using the New Asset System**

### **Import the Asset Utilities:**
```typescript
import { 
    requireMoonlingImage, 
    requireIngredientImage, 
    requireBackgroundImage,
    requireUIImage,
    requireLogoImage,
    requireAsset
} from '../utils/assetPaths';
```

### **Load Specific Asset Types:**
```typescript
// Load moonling images
const lyraImage = requireMoonlingImage('LYRA.gif');

// Load ingredient images
const sugarImage = requireIngredientImage('pink-sugar.png');

// Load background images
const bgImage = requireBackgroundImage('screen-bg.png');

// Load UI images
const buttonImage = requireUIImage('button.png');

// Load logo images
const logoImage = requireLogoImage('logo.png');
```

### **Auto-Detect Asset Type:**
```typescript
// Automatically determines the correct folder
const anyAsset = requireAsset('LYRA.gif');        // → moonlings folder
const anyAsset2 = requireAsset('pink-sugar.png'); // → ingredients folder
const anyAsset3 = requireAsset('screen-bg.png');  // → backgrounds folder
```

## 📝 **Adding New Assets**

### **1. Choose the Right Folder:**
- **Character-related** → `assets/moonlings/`
- **Food/ingredients** → `assets/ingredients/`
- **Backgrounds** → `assets/backgrounds/`
- **UI elements** → `assets/ui/`
- **Logos** → `assets/logos/`

### **2. Use Consistent Naming:**
- **Lowercase** with **dashes**
- **Descriptive** names
- **No spaces** or special characters

### **3. Update Asset Utilities:**
Add new assets to the appropriate `require*` function in `src/utils/assetPaths.ts`

### **4. Example Adding New Asset:**
```typescript
// 1. Place file in correct folder
// assets/ingredients/new-ingredient.png

// 2. Update requireIngredientImage function
export const requireIngredientImage = (filename: string) => {
    switch (filename) {
        // ... existing cases
        case 'new-ingredient.png':
            return require('../../assets/ingredients/new-ingredient.png');
        default:
            return require('../../assets/ingredients/pink-sugar.png');
    }
};

// Example for logos:
// 1. Place file in correct folder
// assets/logos/new-logo.png

// 2. Update requireLogoImage function
export const requireLogoImage = (filename: string) => {
    switch (filename) {
        // ... existing cases
        case 'new-logo.png':
            return require('../../assets/logos/new-logo.png');
        default:
            return require('../../assets/logos/logo.png');
    }
};
```

## 🎨 **Design Guidelines**

### **Image Formats:**
- **PNG:** UI elements, logos, icons (with transparency)
- **GIF:** Animations, character sprites
- **WebP:** Optimized images (when supported)
- **JPG:** Backgrounds, photos (when transparency not needed)

### **File Sizes:**
- **UI elements:** Keep under 100KB
- **Character sprites:** Keep under 500KB
- **Backgrounds:** Keep under 1MB
- **Animations:** Keep under 2MB

### **Dimensions:**
- **UI icons:** 32x32, 64x64, or 128x128
- **Character sprites:** Maintain aspect ratio, optimize for mobile
- **Backgrounds:** Optimize for screen dimensions
- **Logos:** High resolution for various use cases

## 🚀 **Benefits of New Organization**

1. **Clear Structure:** Easy to find assets by category
2. **Consistent Naming:** Predictable file names
3. **Better Performance:** Organized loading and caching
4. **Easier Maintenance:** Clear separation of concerns
5. **Team Collaboration:** Standardized approach for all developers
6. **Scalability:** Easy to add new asset categories

## 🔍 **Migration Notes**

### **Old References:**
- `require('../../assets/images/LYRA.gif')` → `requireMoonlingImage('LYRA.gif')`
- `require('../../assets/images/pink-sugar.png')` → `requireIngredientImage('pink-sugar.png')`

### **Updated Components:**
- All components now use the new asset utilities
- Consistent asset loading across the app
- Better error handling with fallbacks

---

**Remember:** Always use the new asset utilities instead of direct `require()` statements. This ensures consistency and makes future asset organization changes easier! 🌟
