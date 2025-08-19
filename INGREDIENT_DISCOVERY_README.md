# 🍃 Ingredient Discovery System

## 🎯 **What It Does**

Your pet automatically finds ingredients every X hours while you're away! The system includes:

- **Automatic Discovery**: Pet finds ingredients every 2-12 hours (configurable)
- **Smart Notifications**: Beautiful animated notifications when ingredients are found
- **Rarity System**: Different drop rates for common, uncommon, rare, epic, and legendary ingredients
- **Daily Limits**: Prevents excessive discoveries with configurable daily caps
- **Customizable Settings**: Adjust timing, chances, and limits
- **Progress Tracking**: See discovery progress and time until next discovery

---

## 🚀 **Quick Start**

### **1. Add the Notification Component**
```tsx
// Note: IngredientDiscoveryNotification component has been removed
// Use the built-in notification system instead
```

### **2. Check for Discoveries**
```tsx
import { ingredientDiscoveryService } from './services/IngredientDiscoveryService';

// Check if pet should discover ingredients
if (ingredientDiscoveryService.shouldDiscoverIngredients()) {
    const discoveries = ingredientDiscoveryService.discoverIngredients();
    // Handle new discoveries
}
```

### **3. Get Discovery Status**
```tsx
// Get time until next discovery
const timeUntilNext = ingredientDiscoveryService.getTimeUntilNextDiscovery();

// Get today's progress
const progress = ingredientDiscoveryService.getDailyProgress();

// Get recent discoveries
const discoveries = ingredientDiscoveryService.getDiscoveries();
```

---

## 🧩 **Components Overview**

### **Note: Demo Components Removed**
- **IngredientDiscoveryNotification**: Component has been removed
- **DiscoverySettings**: Component has been removed  
- **IngredientDiscoveryDemo**: Component has been removed
- **Usage**: These were demo components and are no longer needed

---

## ⚙️ **Configuration Options**

### **Discovery Timing**
- **Interval**: 2, 4, 6, 8, or 12 hours between discoveries
- **Enabled/Disabled**: Toggle automatic discovery on/off
- **Daily Reset**: Automatic reset at midnight

### **Discovery Chances**
- **Success Rate**: 50% to 90% chance of finding ingredients
- **Quantity**: 1-3 ingredients per discovery (based on rarity)
- **Rarity Distribution**:
  - Common: 60% chance
  - Uncommon: 25% chance
  - Rare: 10% chance
  - Epic: 4% chance
  - Legendary: 1% chance

### **Daily Limits**
- **Max Discoveries**: 3, 4, 5, 6, or 8 per day
- **Progress Tracking**: Visual progress bar and counters
- **Manual Reset**: Option to reset daily progress

---

## 🔧 **Integration Examples**

### **Basic Integration**
```tsx
import React, { useEffect } from 'react';
import { ingredientDiscoveryService } from './services/IngredientDiscoveryService';
// Note: IngredientDiscoveryNotification component has been removed

const MyGameComponent = () => {
    useEffect(() => {
        // Check for discoveries every minute
        const interval = setInterval(() => {
            if (ingredientDiscoveryService.shouldDiscoverIngredients()) {
                const discoveries = ingredientDiscoveryService.discoverIngredients();
                // Handle discoveries
            }
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const handleIngredientCollected = (ingredientId: string, quantity: number) => {
        // Add to your inventory system
        addToInventory(ingredientId, quantity);
    };

    return (
        <View>
            {/* Note: IngredientDiscoveryNotification component has been removed */}
            {/* Your game content */}
        </View>
    );
};
```

### **Advanced Integration with Inventory**
```tsx
import { ingredientDiscoveryService } from './services/IngredientDiscoveryService';
import { useInventory } from './hooks/useInventory';

const GameWithInventory = () => {
    const { addIngredient } = useInventory();

    const handleIngredientCollected = (ingredientId: string, quantity: number) => {
        // Add to inventory
        addIngredient(ingredientId, quantity);
        
        // Show success message
        showSuccessMessage(`Found ${quantity}x ${ingredientId}!`);
        
        // Update UI
        updateInventoryDisplay();
    };

    // Check discoveries periodically
    useEffect(() => {
        const checkDiscoveries = () => {
            if (ingredientDiscoveryService.shouldDiscoverIngredients()) {
                const discoveries = ingredientDiscoveryService.discoverIngredients();
                
                if (discoveries.length > 0) {
                    // Show discovery celebration
                    showDiscoveryCelebration(discoveries);
                }
            }
        };

        const interval = setInterval(checkDiscoveries, 60000);
        checkDiscoveries(); // Check immediately

        return () => clearInterval(interval);
    }, []);

    return (
        <View>
            {/* Note: IngredientDiscoveryNotification component has been removed */}
            {/* Use built-in notification system instead */}
        </View>
    );
};
```

### **Settings Integration**
```tsx
// Note: DiscoverySettings component has been removed
// Use the built-in settings system instead

const GameSettings = () => {
    return (
        <ScrollView>
            {/* Note: DiscoverySettings component has been removed */}
            {/* Other settings */}
        </ScrollView>
    );
};
```

---

## 📱 **UI Customization**

### **Notification Styling**
The notification component uses a clean, modern design with:
- **Slide-in animation** from left
- **Auto-hide** after 5 seconds
- **Collect/Dismiss buttons**
- **Ingredient image display**
- **Timestamp information**

### **Settings UI**
The settings component provides:
- **Toggle switches** for enabling/disabling
- **Button selectors** for intervals and chances
- **Progress bars** for daily limits
- **Action buttons** for testing and resetting

---

## 🎮 **Game Balance Features**

### **Progressive Discovery**
- **Early Game**: More common ingredients, frequent discoveries
- **Mid Game**: Mix of rarities, balanced timing
- **Late Game**: Rare ingredients, strategic timing

### **Anti-Exploit Measures**
- **Daily Limits**: Prevents excessive discoveries
- **Time Gating**: Enforces minimum intervals
- **Rarity Balancing**: Maintains game economy

### **Player Engagement**
- **Regular Check-ins**: Encourages daily app usage
- **Surprise Factor**: Random discoveries create excitement
- **Progress Tracking**: Visual feedback on discovery status

---

## 🔍 **Testing & Debugging**

### **Test Discovery System**
```tsx
// Force a discovery for testing
const testDiscovery = () => {
    const currentSettings = ingredientDiscoveryService.getSettings();
    
    // Temporarily allow discovery
    ingredientDiscoveryService.updateSettings({
        lastDiscoveryTime: Date.now() - (currentSettings.intervalHours * 60 * 60 * 1000)
    });
    
    const discoveries = ingredientDiscoveryService.discoverIngredients();
    console.log('Test discoveries:', discoveries);
    
    // Restore settings
    ingredientDiscoveryService.updateSettings(currentSettings);
};
```

### **Debug Information**
```tsx
// Get current system status
const status = {
    settings: ingredientDiscoveryService.getSettings(),
    progress: ingredientDiscoveryService.getDailyProgress(),
    timeUntilNext: ingredientDiscoveryService.getTimeUntilNextDiscovery(),
    discoveries: ingredientDiscoveryService.getDiscoveries()
};

console.log('Discovery System Status:', status);
```

---

## 🚀 **Performance Considerations**

### **Efficient Checking**
- **Minimal Intervals**: Check every minute, not every second
- **Lazy Loading**: Only process discoveries when needed
- **Memory Management**: Clean up old discoveries weekly

### **Storage Optimization**
- **Local Storage**: Uses localStorage for persistence
- **Data Cleanup**: Automatically removes old discoveries
- **Minimal Data**: Stores only essential information

---

## 🎯 **Use Cases**

### **Mobile Games**
- **Idle Progression**: Players get rewards while away
- **Daily Engagement**: Encourages regular check-ins
- **Resource Collection**: Provides crafting materials

### **Pet Games**
- **Pet Autonomy**: Pets act independently
- **Surprise Rewards**: Unexpected discoveries
- **Player Bonding**: Pets bring gifts to players

### **Crafting Games**
- **Material Gathering**: Automatic resource collection
- **Recipe Progression**: Ingredients for better recipes
- **Economy Balance**: Controlled resource flow

---

## 🔮 **Future Enhancements**

### **Planned Features**
- **Location-based Discovery**: Different ingredients in different areas
- **Pet Level Effects**: Higher level pets find better ingredients
- **Weather Effects**: Weather influences discovery chances
- **Social Features**: Pets can share discoveries with friends

### **Customization Options**
- **Pet Personalities**: Different pets have different discovery styles
- **Discovery Themes**: Seasonal or event-based ingredient themes
- **Advanced Scheduling**: Custom discovery schedules

---

## 📚 **API Reference**

### **IngredientDiscoveryService Methods**

#### **Discovery Control**
- `shouldDiscoverIngredients()`: Check if discovery should occur
- `discoverIngredients()`: Trigger ingredient discovery
- `getTimeUntilNextDiscovery()`: Get time until next discovery

#### **Progress Tracking**
- `getDailyProgress()`: Get today's discovery progress
- `getDiscoveries()`: Get recent discoveries
- `getDiscoveryNotifications()`: Get notifications for UI

#### **Settings Management**
- `getSettings()`: Get current settings
- `updateSettings(settings)`: Update discovery settings
- `cleanupOldDiscoveries()`: Remove old discovery data

---

## 🌟 **Tips & Best Practices**

### **Implementation Tips**
1. **Start Simple**: Begin with basic notification integration
2. **Test Thoroughly**: Use the test discovery feature during development
3. **Balance Carefully**: Adjust timing and chances based on player feedback
4. **Monitor Usage**: Track how players interact with the system

### **Player Experience**
1. **Clear Feedback**: Make it obvious when ingredients are found
2. **Reasonable Timing**: Don't make discoveries too frequent or rare
3. **Visual Appeal**: Use attractive notifications and animations
4. **Progress Visibility**: Show discovery status clearly

---

## 🎉 **Conclusion**

The Ingredient Discovery System provides a robust, engaging way for pets to automatically find ingredients while players are away. It encourages regular app usage, provides surprise rewards, and integrates seamlessly with existing game systems.

**Key Benefits:**
- ✅ **Automatic Progression**: Players get rewards while away
- ✅ **Engagement Driver**: Encourages daily check-ins
- ✅ **Balanced Economy**: Controlled resource distribution
- ✅ **Customizable**: Adjustable timing and chances
- ✅ **Professional UI**: Beautiful notifications and settings

**Ready to implement?** Start with the basic notification component and gradually add more features as needed! 🚀
