import React, { useState, useEffect, useMemo } from 'react';
import MarketplaceService, {
    MarketplaceItem,
    ItemCategory,
    ItemRarity,
    UserInventory
} from '../services/MarketplaceService';
import { GlobalPointSystem } from '../services/GlobalPointSystem';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';

interface ShopProps {
    connection: Connection;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    onClose: () => void;
}

const Shop: React.FC<ShopProps> = ({ connection, onNotification, onClose }) => {
    const wallet = useWallet();
    const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all' | 'currency'>('currency');
    const [selectedRarity, setSelectedRarity] = useState<ItemRarity | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [userInventory, setUserInventory] = useState<UserInventory | null>(null);
    const [marketplaceService, setMarketplaceService] = useState<MarketplaceService | null>(null);
    const [globalPointSystem, setGlobalPointSystem] = useState<GlobalPointSystem | null>(null);
    const [starFragmentBalance, setStarFragmentBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const itemsPerPage = 12; // 3x4 grid

    // Initialize marketplace service and global point system
    useEffect(() => {
        if (wallet.wallet && connection) {
            const service = new MarketplaceService(connection, wallet as any);
            setMarketplaceService(service);

            // Load user inventory
            if (wallet.publicKey) {
                service.getUserInventory(wallet.publicKey).then(inventory => {
                    setUserInventory(inventory);
                });

                // Initialize GlobalPointSystem for Star Fragments
                const pointSystem = new GlobalPointSystem(wallet.publicKey.toString());
                setGlobalPointSystem(pointSystem);

                // Load or initialize user data
                let pointsData = pointSystem.getCurrentPoints();
                if (!pointsData) {
                    pointsData = pointSystem.initializeUser(wallet.publicKey.toString());
                }
                setStarFragmentBalance(pointsData.starFragments);
            }
        }
    }, [wallet, connection]);

    // Get filtered items
    const filteredItems = useMemo(() => {
        if (!marketplaceService) return [];

        if (selectedCategory === 'currency') {
            // Return Star Fragment packages
            return [
                {
                    id: 'sf-small',
                    name: 'Small Pack',
                    price: 0.1,
                    fragments: 10,
                    category: 'currency',
                    description: 'Perfect starter pack for new cosmic explorers',
                    rarity: ItemRarity.COMMON
                },
                {
                    id: 'sf-medium',
                    name: 'Medium Pack',
                    price: 0.5,
                    fragments: 50,
                    category: 'currency',
                    description: 'Great value for regular cosmic adventurers',
                    rarity: ItemRarity.UNCOMMON
                },
                {
                    id: 'sf-large',
                    name: 'Large Pack',
                    price: 1.0,
                    fragments: 100,
                    category: 'currency',
                    description: 'Recommended for serious cosmic collectors',
                    rarity: ItemRarity.RARE
                },
                {
                    id: 'sf-mega',
                    name: 'Mega Pack',
                    price: 2.0,
                    fragments: 200,
                    category: 'currency',
                    description: 'For dedicated cosmic entrepreneurs',
                    rarity: ItemRarity.EPIC
                },
                {
                    id: 'sf-ultra',
                    name: 'Ultra Pack',
                    price: 5.0,
                    fragments: 500,
                    category: 'currency',
                    description: 'Maximum value for cosmic power users',
                    rarity: ItemRarity.LEGENDARY
                },
                {
                    id: 'sf-cosmic',
                    name: 'Cosmic Pack',
                    price: 10.0,
                    fragments: 1000,
                    category: 'currency',
                    description: 'The ultimate cosmic currency package',
                    rarity: ItemRarity.MYTHIC
                }
            ];
        }

        let items = marketplaceService.getAllItems();

        // Filter by category
        if (selectedCategory !== 'all') {
            items = items.filter(item => item.category === selectedCategory);
        }

        // Filter by rarity
        if (selectedRarity !== 'all') {
            items = items.filter(item => item.rarity === selectedRarity);
        }

        // Filter by search query
        if (searchQuery) {
            items = marketplaceService.searchItems(searchQuery);
        }

        return items;
    }, [marketplaceService, selectedCategory, selectedRarity, searchQuery]);

    // Get featured items
    const featuredItems = useMemo(() => {
        if (!marketplaceService) return [];
        return marketplaceService.getFeaturedItems();
    }, [marketplaceService]);

    // Get paginated items for current page
    const paginatedItems = useMemo(() => {
        const startIndex = currentPage * itemsPerPage;
        return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(0);
    }, [selectedCategory, selectedRarity, searchQuery]);

    // Handle Star Fragment purchase
    const handleStarFragmentPurchase = async (solAmount: number, fragmentAmount: number) => {
        if (!globalPointSystem) {
            onNotification?.('❌ Point system not initialized', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const result = globalPointSystem.purchaseStarFragments(solAmount);

            if (result.success) {
                onNotification?.(
                    `✨ Successfully purchased ${fragmentAmount} Star Fragments! Cost: ${solAmount.toFixed(4)} SOL`,
                    'success'
                );
                setStarFragmentBalance(globalPointSystem.getStarFragmentBalance());
            } else {
                onNotification?.(`❌ Purchase failed: ${result.error}`, 'error');
            }
        } catch (error) {
            onNotification?.(`❌ Purchase error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle item purchase (with Star Fragments for in-game items)
    const handlePurchase = async (item: MarketplaceItem, quantity: number = 1) => {
        if (!marketplaceService || !wallet.publicKey) {
            onNotification?.('❌ Please connect your wallet first', 'error');
            return;
        }

        setIsLoading(true);

        try {
            // Check if item should be purchased with Star Fragments (non-character items)
            const starFragmentPrice = Math.floor(item.price * 1000); // Convert SOL price to Star Fragment price
            const isCharacterItem = item.name.toLowerCase().includes('character') || item.name.toLowerCase().includes('pet');

            if (!isCharacterItem && globalPointSystem && selectedCategory !== 'currency') {
                // Purchase with Star Fragments
                const totalCost = starFragmentPrice * quantity;
                const spendResult = globalPointSystem.spendStarFragments(totalCost);

                if (spendResult.success) {
                    onNotification?.(
                        `✨ Successfully purchased ${quantity}x ${item.name}! Cost: ${totalCost} Star Fragments`,
                        'success'
                    );
                    setStarFragmentBalance(globalPointSystem.getStarFragmentBalance());

                    // Refresh inventory (in a real app, this would update the blockchain inventory)
                    const updatedInventory = await marketplaceService.getUserInventory(wallet.publicKey);
                    setUserInventory(updatedInventory);
                } else {
                    onNotification?.(`❌ Purchase failed: ${spendResult.error}`, 'error');
                }
            } else if (selectedCategory === 'currency') {
                // Handle Star Fragment package purchase
                await handleStarFragmentPurchase((item as any).price, (item as any).fragments);
            } else {
                // Purchase with SOL (for characters or when point system unavailable)
                const result = await marketplaceService.purchaseItem(item, quantity, wallet.publicKey);

                if (result.success) {
                    onNotification?.(
                        `✅ Successfully purchased ${quantity}x ${item.name}! ${item.isNFT ? 'NFT minted to your wallet! ' : ''}Cost: ${(item.price * quantity).toFixed(4)} SOL`,
                        'success'
                    );

                    // Refresh inventory
                    const updatedInventory = await marketplaceService.getUserInventory(wallet.publicKey);
                    setUserInventory(updatedInventory);
                } else {
                    onNotification?.(`❌ Purchase failed: ${result.error}`, 'error');
                }
            }
        } catch (error) {
            onNotification?.(`❌ Purchase error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle item use from inventory
    const handleUseItem = async (itemId: string) => {
        if (!marketplaceService) return;

        setIsLoading(true);

        try {
            const result = await marketplaceService.useItem(itemId, 'character_id');

            if (result.success) {
                onNotification?.(
                    `✅ Item used successfully! Effects: ${result.effects.join(' • ')}`,
                    'success'
                );
            } else {
                onNotification?.(`❌ Failed to use item: ${result.error}`, 'error');
            }
        } catch (error) {
            onNotification?.(`❌ Error using item: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle item crafting
    const handleCraftItem = async (itemId: string) => {
        if (!marketplaceService || !wallet.publicKey) {
            onNotification?.('❌ Please connect your wallet first', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const result = await marketplaceService.craftItem(itemId, wallet.publicKey);

            if (result.success) {
                onNotification?.(
                    `🎨 Successfully crafted ${result.craftedItem?.name}! +${result.experienceGained} XP gained!`,
                    'success'
                );

                // Refresh inventory
                const updatedInventory = await marketplaceService.getUserInventory(wallet.publicKey);
                setUserInventory(updatedInventory);
            } else {
                onNotification?.(`❌ Crafting failed: ${result.error}`, 'error');
            }
        } catch (error) {
            onNotification?.(`❌ Crafting error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Get rarity color
    const getRarityColor = (rarity: ItemRarity): string => {
        switch (rarity) {
            case ItemRarity.COMMON: return '#9ca3af'; // Gray
            case ItemRarity.UNCOMMON: return '#10b981'; // Green
            case ItemRarity.RARE: return '#3b82f6'; // Blue
            case ItemRarity.EPIC: return '#8b5cf6'; // Purple
            case ItemRarity.LEGENDARY: return '#f59e0b'; // Orange/Gold
            case ItemRarity.MYTHIC: return '#ef4444'; // Red
            default: return '#6b7280';
        }
    };

    // Get category emoji
    const getCategoryEmoji = (category: ItemCategory | 'currency' | 'all'): string => {
        switch (category) {
            case 'currency': return '✨';
            case 'all': return '📦';
            case ItemCategory.INGREDIENTS: return '🌿';
            case ItemCategory.FOOD: return '🍎';
            case ItemCategory.TOYS: return '🎮';
            case ItemCategory.POWERUPS: return '⚡';
            case ItemCategory.COSMETICS: return '💄';
            case ItemCategory.UTILITIES: return '🔧';
            case ItemCategory.RARE_COLLECTIBLES: return '💎';
            default: return '📦';
        }
    };

    if (!wallet.connected) {
        return (
            <div className="tamagotchi-screen-container">
                {/* Top Status Bar */}
                <div className="tamagotchi-top-status">
                    <div className="gear-icon">🏪</div>
                    <div className="wallet-status-text">
                        Cosmic Marketplace - [wallet disconnected]
                    </div>
                </div>

                {/* Main LCD Screen */}
                <div className="tamagotchi-main-screen">
                    {/* Main Display Area */}
                    <div className="main-display-area shop-welcome">
                        <div className="shop-welcome-content">
                            <div className="shop-welcome-title">💫 Cosmic Marketplace</div>
                            <div className="shop-welcome-subtitle">Wallet connecting in background...</div>

                            <div className="shop-features-grid">
                                <div className="shop-feature">✨ Star Fragments</div>
                                <div className="shop-feature">🍎 Food Items</div>
                                <div className="shop-feature">⚡ Powerups</div>
                                <div className="shop-feature">💄 Cosmetics</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation Buttons */}
                <button className="bottom-button left" onClick={onClose} title="Go Back">
                    ←
                </button>
                <button className="bottom-button center" title="Marketplace">
                    💰
                </button>
                <button className="bottom-button right" title="Help">
                    ?
                </button>
            </div>
        );
    }

    return (
        <div className="tamagotchi-screen-container">
            {/* Top Status Bar */}
            <div className="tamagotchi-top-status">
                <div className="gear-icon">🏪</div>
                <div className="wallet-status-text">
                    {userInventory?.sol_balance.toFixed(4) || '0.0000'} SOL • {starFragmentBalance} ✨
                </div>
            </div>

            {/* Main LCD Screen */}
            <div className="tamagotchi-main-screen">
                {/* Stats Bar */}
                <div className="stats-bar">
                    <div className="stat-item">
                        <span className="stat-label">SOL</span>
                        <div className="stat-stars">
                            {userInventory?.sol_balance.toFixed(3) || '0'}
                        </div>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Star ✨</span>
                        <div className="stat-stars">
                            {starFragmentBalance}
                        </div>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Items</span>
                        <div className="stat-stars">
                            {filteredItems.length}
                        </div>
                    </div>
                </div>

                {/* Main Display Area */}
                <div className="main-display-area shop-selection">
                    {selectedItem ? (
                        // Item detail view
                        <div className="item-detail">
                            <div className="item-detail-header">
                                <div className="item-detail-icon">
                                    {selectedCategory === 'currency' ? '✨' : getCategoryEmoji(selectedItem.category)}
                                </div>
                                <h3>{selectedItem.name}</h3>
                                <p>{selectedItem.description || 'A valuable cosmic item for your pet'}</p>
                            </div>

                            <div className="item-detail-info">
                                <div className="item-price">
                                    {selectedCategory === 'currency' ?
                                        `${(selectedItem as any).price.toFixed(3)} SOL → ${(selectedItem as any).fragments} ✨` :
                                        selectedItem.name.toLowerCase().includes('character') || selectedItem.name.toLowerCase().includes('pet') ?
                                            `${selectedItem.price.toFixed(3)} SOL` :
                                            `${Math.floor(selectedItem.price * 1000)} ✨`
                                    }
                                </div>
                                <div
                                    className="item-rarity"
                                    style={{ color: getRarityColor(selectedItem.rarity) }}
                                >
                                    {selectedItem.rarity}
                                </div>
                                {selectedItem.isNFT && (
                                    <div className="item-nft-badge">🎨 NFT</div>
                                )}
                            </div>

                            <div className="item-actions">
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="back-button"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={() => handlePurchase(selectedItem)}
                                    disabled={isLoading}
                                    className={`purchase-button ${isLoading ? 'disabled' : 'available'}`}
                                >
                                    {isLoading ? '⏳ Processing...' :
                                        selectedCategory === 'currency' ? '💰 Buy Pack' :
                                            '🛒 Purchase'}
                                </button>
                            </div>

                            {/* Additional action buttons for inventory items */}
                            {userInventory && selectedItem.id && (
                                <div className="inventory-actions">
                                    <button
                                        onClick={() => handleUseItem(selectedItem.id)}
                                        disabled={isLoading}
                                        className="use-button"
                                    >
                                        🎮 Use Item
                                    </button>
                                    <button
                                        onClick={() => handleCraftItem(selectedItem.id)}
                                        disabled={isLoading}
                                        className="craft-button"
                                    >
                                        🔨 Craft
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Category and item grid view
                        <div className="shop-grid-view">
                            {/* Category Tabs */}
                            <div className="category-tabs">
                                <div
                                    className={`category-tab ${selectedCategory === 'currency' ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory('currency')}
                                >
                                    ✨ Currency
                                </div>
                                <div
                                    className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory('all')}
                                >
                                    📦 All
                                </div>
                                <div
                                    className={`category-tab ${selectedCategory === ItemCategory.FOOD ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(ItemCategory.FOOD)}
                                >
                                    🍎 Food
                                </div>
                                <div
                                    className={`category-tab ${selectedCategory === ItemCategory.POWERUPS ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(ItemCategory.POWERUPS)}
                                >
                                    ⚡ Power
                                </div>
                                <div
                                    className={`category-tab ${selectedCategory === ItemCategory.COSMETICS ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(ItemCategory.COSMETICS)}
                                >
                                    💄 Beauty
                                </div>
                            </div>

                            {/* Search and Filter Bar */}
                            <div className="search-filter-bar">
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                                <select
                                    value={selectedRarity}
                                    onChange={(e) => setSelectedRarity(e.target.value as ItemRarity | 'all')}
                                    className="rarity-filter"
                                >
                                    <option value="all">All Rarities</option>
                                    <option value={ItemRarity.COMMON}>Common</option>
                                    <option value={ItemRarity.UNCOMMON}>Uncommon</option>
                                    <option value={ItemRarity.RARE}>Rare</option>
                                    <option value={ItemRarity.EPIC}>Epic</option>
                                    <option value={ItemRarity.LEGENDARY}>Legendary</option>
                                    <option value={ItemRarity.MYTHIC}>Mythic</option>
                                </select>
                            </div>

                            {/* Items Grid */}
                            <div className="items-grid">
                                {/* Fill with items up to 12 slots */}
                                {Array.from({ length: itemsPerPage }, (_, index) => {
                                    const item = paginatedItems[index];

                                    if (item) {
                                        return (
                                            <div
                                                key={item.id}
                                                className="item-slot filled"
                                                onClick={() => setSelectedItem(item)}
                                            >
                                                <div className="item-icon">
                                                    {selectedCategory === 'currency' ? '✨' : getCategoryEmoji(item.category)}
                                                </div>
                                                <div className="item-name">
                                                    {item.name.slice(0, 8)}
                                                </div>
                                                <div className="item-price">
                                                    {selectedCategory === 'currency' ?
                                                        `${(item as any).price.toFixed(1)} SOL` :
                                                        item.name.toLowerCase().includes('character') || item.name.toLowerCase().includes('pet') ?
                                                            `${item.price.toFixed(3)} SOL` :
                                                            `${Math.floor(item.price * 1000)} ✨`
                                                    }
                                                </div>
                                                <div
                                                    className="item-rarity-indicator"
                                                    style={{ backgroundColor: getRarityColor(item.rarity) }}
                                                />
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={`empty-${index}`} className="item-slot empty">
                                            <div className="empty-slot-content">
                                                {getCategoryEmoji(selectedCategory)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="pagination-controls">
                                    <button
                                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                        disabled={currentPage === 0}
                                        className="page-button"
                                    >
                                        ←
                                    </button>
                                    <span className="page-info">
                                        {currentPage + 1} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                        disabled={currentPage === totalPages - 1}
                                        className="page-button"
                                    >
                                        →
                                    </button>
                                </div>
                            )}

                            <div className="shop-info">
                                {selectedCategory === 'currency' ?
                                    'Buy Star Fragments with SOL to purchase in-game items' :
                                    `Browse ${selectedCategory === 'all' ? 'all' : selectedCategory.toLowerCase()} items for your cosmic pet`
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <button className="bottom-button left" onClick={onClose} title="Go Back">
                ←
            </button>
            <button
                className="bottom-button center"
                onClick={() => {
                    setSelectedItem(null);
                    setSelectedCategory('all');
                }}
                title="Show All"
            >
                📦
            </button>
            <button
                className="bottom-button right"
                onClick={() => {
                    onNotification?.(`🏪 Marketplace Help: Buy Star Fragments with SOL • Use Star Fragments for in-game items • Characters cost SOL • Items boost your pet's stats!`, 'info');
                }}
                title="Help"
            >
                ?
            </button>

            {/* Physical Device Buttons - overlaid on background image */}
            <button
                className="device-button left-physical"
                onClick={onClose}
                title="Go Back"
                aria-label="Left physical button - Go Back"
            />
            <button
                className="device-button center-physical"
                onClick={() => {
                    setSelectedItem(null);
                    setSelectedCategory('all');
                }}
                title="Show All"
                aria-label="Center physical button - Show All"
            />
            <button
                className="device-button right-physical"
                onClick={() => {
                    onNotification?.(`🏪 Marketplace Help: Buy Star Fragments with SOL • Use Star Fragments for in-game items • Characters cost SOL • Items boost your pet's stats!`, 'info');
                }}
                title="Help"
                aria-label="Right physical button - Help"
            />

            <style>{`
        .shop-welcome {
          background: #D4B896;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .shop-welcome-content {
          text-align: center;
          color: #5D4E37;
          font-family: 'Press Start 2P', monospace;
        }

        .shop-welcome-title {
          font-size: 12px;
          margin-bottom: 10px;
        }

        .shop-welcome-subtitle {
          font-size: 8px;
          margin-bottom: 20px;
        }

        .shop-features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .shop-feature {
          font-size: 8px;
          padding: 8px;
          background: #E8D5A3;
          border: 2px solid #8B7355;
          border-radius: 8px;
        }

        .shop-selection {
          background: #D4B896;
          display: flex;
          flex-direction: column;
          padding: 10px;
        }

        .shop-grid-view {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .category-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .category-tab {
          font-family: 'Press Start 2P', monospace;
          font-size: 5px;
          padding: 4px 6px;
          background: #E8D5A3;
          border: 2px solid #8B7355;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #5D4E37;
        }

        .category-tab:hover {
          border-color: #4da6ff;
          transform: translateY(-1px);
        }

        .category-tab.active {
          background: #F0E5B8;
          border-color: #4da6ff;
          box-shadow: 0 0 8px rgba(77, 166, 255, 0.3);
        }

        .search-filter-bar {
          display: flex;
          gap: 6px;
          margin-bottom: 8px;
        }

        .search-input, .rarity-filter {
          font-family: 'Press Start 2P', monospace;
          font-size: 6px;
          padding: 4px;
          background: #E8D5A3;
          border: 2px solid #8B7355;
          border-radius: 4px;
          color: #5D4E37;
          flex: 1;
        }

        .search-input::placeholder {
          color: #8B7355;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 8px;
          flex: 1;
        }

        .item-slot {
          background: #E8D5A3;
          border: 2px solid #8B7355;
          border-radius: 8px;
          padding: 6px;
          text-align: center;
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          min-height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .item-slot.filled:hover {
          border-color: #4da6ff;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .item-slot.empty {
          border-style: dashed;
          border-color: #A0927D;
          cursor: default;
          opacity: 0.6;
        }

        .item-icon {
          font-size: 16px;
          margin-bottom: 2px;
        }

        .item-name {
          font-family: 'Press Start 2P', monospace;
          font-size: 5px;
          color: #5D4E37;
          margin-bottom: 2px;
          line-height: 1.2;
        }

        .item-price {
          font-family: 'Press Start 2P', monospace;
          font-size: 4px;
          color: #2563eb;
          margin-bottom: 2px;
        }

        .item-rarity-indicator {
          position: absolute;
          top: 2px;
          right: 2px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          border: 1px solid #5D4E37;
        }

        .empty-slot-content {
          font-size: 20px;
          opacity: 0.3;
          color: #8B7355;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .page-button {
          font-family: 'Press Start 2P', monospace;
          font-size: 6px;
          padding: 4px 8px;
          background: #E8D5A3;
          border: 2px solid #8B7355;
          border-radius: 4px;
          cursor: pointer;
          color: #5D4E37;
        }

        .page-button:hover:not(:disabled) {
          border-color: #4da6ff;
          background: #F0E5B8;
        }

        .page-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .page-info {
          font-family: 'Press Start 2P', monospace;
          font-size: 6px;
          color: #5D4E37;
        }

        .shop-info {
          font-family: 'Press Start 2P', monospace;
          font-size: 5px;
          color: #5D4E37;
          text-align: center;
          margin-top: auto;
        }

        .item-detail {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 10px;
        }

        .item-detail-header {
          text-align: center;
          margin-bottom: 15px;
        }

        .item-detail-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .item-detail h3 {
          font-family: 'Press Start 2P', monospace;
          font-size: 8px;
          color: #5D4E37;
          margin-bottom: 6px;
        }

        .item-detail p {
          font-family: 'Press Start 2P', monospace;
          font-size: 6px;
          color: #5D4E37;
          line-height: 1.4;
          margin-bottom: 10px;
        }

        .item-detail-info {
          background: #E8D5A3;
          border: 2px solid #8B7355;
          border-radius: 8px;
          padding: 8px;
          margin-bottom: 15px;
          text-align: center;
        }

        .item-price {
          font-family: 'Press Start 2P', monospace;
          font-size: 7px;
          color: #2563eb;
          margin-bottom: 4px;
        }

        .item-rarity {
          font-family: 'Press Start 2P', monospace;
          font-size: 6px;
          margin-bottom: 4px;
        }

        .item-nft-badge {
          font-family: 'Press Start 2P', monospace;
          font-size: 5px;
          color: #8b5cf6;
          background: #f3e8ff;
          border: 1px solid #8b5cf6;
          border-radius: 4px;
          padding: 2px 4px;
          display: inline-block;
        }

        .item-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }

        .back-button, .purchase-button {
          font-family: 'Press Start 2P', monospace;
          font-size: 6px;
          padding: 6px 12px;
          border: 2px solid #8B7355;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
        }

        .back-button {
          background: #E8D5A3;
          color: #5D4E37;
        }

        .back-button:hover {
          border-color: #4da6ff;
          background: #F0E5B8;
        }

        .purchase-button.available {
          background: #16a34a;
          color: white;
          border-color: #16a34a;
        }

        .purchase-button.available:hover {
          background: #15803d;
          border-color: #15803d;
        }

        .purchase-button.disabled {
          background: #9ca3af;
          color: #6b7280;
          border-color: #9ca3af;
          cursor: not-allowed;
        }

        .inventory-actions {
          display: flex;
          gap: 6px;
        }

        .use-button, .craft-button {
          font-family: 'Press Start 2P', monospace;
          font-size: 5px;
          padding: 4px 8px;
          border: 2px solid #8B7355;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
        }

        .use-button {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .use-button:hover:not(:disabled) {
          background: #2563eb;
          border-color: #2563eb;
        }

        .craft-button {
          background: #f59e0b;
          color: white;
          border-color: #f59e0b;
        }

        .craft-button:hover:not(:disabled) {
          background: #d97706;
          border-color: #d97706;
        }

        .use-button:disabled, .craft-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
        </div>
    );
};

export default Shop;