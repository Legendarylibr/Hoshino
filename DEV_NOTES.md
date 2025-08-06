# 📋 Feature Requests & Limitations

## 🎯 **Feature Requests**

- [ ] Create inventory state controller for shop purchases
  - When user buys item in shop, add to ingredient selector inventory
  - Connect shop checkout to ingredient selector state
  - Handle currency deduction and inventory updates

- [ ] Implement proper NFT minting (replace test transactions)
  - Connect to Solana devnet for actual NFT creation
  - Handle transaction confirmation and error states

- [ ] Set up Firebase database for in-game currency tracking
  - Store user's in-game currency balance
  - Track Solana purchases and currency conversion
  - Sync currency across app sessions

- [ ] Gallery: Add two badges (need clarification on which badges)
- [ ] Crafting System: Implement Cloud Cake recipe
  - Combine Nova Egg, Pink Sugar, Mira Berry (already in shop)
  - Add crafting interface to combine ingredients

- [ ] Feeding: Redirect to inventory for ingredient selection
  - Connect feeding button to ingredient selector

- [ ] Sleep: Implement Pokemon Sleep reference
  - Add pet floating on pillow animation
  - Add "WAKE UP!" button at bottom
  
- [ ] UI Improvements: Add shading to buttons and screen for depth
- [ ] Layout: Divide interaction screen buttons into 2 rows (4 buttons each)
- [ ] Fix Safe Area Bleeding: Adjust inventory, shop, and feeding screens
  - Move content away from safe zones (top/bottom edges)
  - Use inner screen view boundaries instead of full screen?
  - Prevent content from bleeding into status bar/navigation areas

- [ ] Consistent Border Scheme: Fix inner screen and dialog box framing
  - Standardize border styles across all screens
  - Ensure consistent pixelated border system
  - Match dialog boxes with inner screen border design

- [ ] Consistent Font Theme: Standardize typography across the app
  - Use PressStart2P font consistently for all text elements
  - Ensure proper font sizing and spacing
  - Maintain retro aesthetic across all components

---

## 🚨 **Current Limitations & Blockers**

## 📱 **Immersive Mode**
**Request**: Hide navigation bar completely for full-screen experience
**Current**: Status bar hidden, nav bar transparent
**Why Not Full**: Requires ejecting from Expo managed workflow, would make managing the project 
more dificult in its current state
**Tried**: `react-native-immersive` - incompatible with Expo managed workflow

## 🎨 **UI Text Underlines**
**Request**: Make underlines under "Yes" and "No" buttons bolder/thicker
**Current**: Using font underline (textDecorationLine: 'underline')
**Why Not Custom**: Would require creating custom underline components with View/Line elements
**Impact**: Custom underlines harder to maintain and position consistently
**Tried**: Font underline only allows on/off, no thickness control

---

*Last Updated: [Current Date]*
*Focus: What we can't do and why* 