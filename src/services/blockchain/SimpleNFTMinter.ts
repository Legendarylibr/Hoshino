import React, { Component } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';
import { ASSET_REGISTRY, getAsset, NFTAsset } from '../../config/AssetRegistry';

export class SimpleNFTMinter extends Component<{ metaplex: Metaplex }> {
    private metaplex: Metaplex;

    constructor(props: { metaplex: Metaplex }) {
        super(props);
        this.metaplex = props.metaplex;
    }

    // ✅ Universal minting - works for ANY asset in registry
    async mintAsset(assetId: string, recipient?: PublicKey): Promise<string> {
        const asset = getAsset(assetId);

        if (!asset) {
            throw new Error(`Asset ${assetId} not found in registry. Available assets: ${Object.keys(ASSET_REGISTRY).join(', ')}`);
        }

        console.log(`🚀 Minting ${asset.name} (${asset.category}) NFT...`);

        try {
            // Simple NFT creation using pre-uploaded IPFS
            const nft = await this.metaplex.nfts().create({
                uri: `https://ipfs.io/ipfs/${asset.ipfsHash}`,
                name: asset.name,
                symbol: "HSH",
                collection: null, // Keep simple for now
                creators: [
                    {
                        address: this.metaplex.identity().publicKey,
                        share: 100,
                    },
                ],
                isMutable: false, // Immutable NFTs
                maxSupply: null, // Unlimited supply
                uses: null,
                sellerFeeBasisPoints: 0, // No royalties for simplicity
            });

            console.log(`✅ Successfully minted ${asset.name} NFT:`, nft);
            return nft.response.signature;

        } catch (error) {
            console.error(`❌ Failed to mint ${asset.name} NFT:`, error);
            throw new Error(`Failed to mint ${asset.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // ✅ Mint specific character by ID
    async mintCharacter(characterId: string): Promise<string> {
        const asset = getAsset(characterId);

        if (!asset) {
            throw new Error(`Character ${characterId} not found`);
        }

        if (asset.category !== 'character') {
            throw new Error(`Asset ${characterId} is not a character (it's ${asset.category})`);
        }

        return this.mintAsset(characterId);
    }

    // ✅ Mint specific achievement by ID
    async mintAchievement(achievementId: string): Promise<string> {
        const asset = getAsset(achievementId);

        if (!asset) {
            throw new Error(`Achievement ${achievementId} not found`);
        }

        if (asset.category !== 'achievement') {
            throw new Error(`Asset ${achievementId} is not an achievement (it's ${asset.category})`);
        }

        return this.mintAsset(achievementId);
    }

    // ✅ Mint specific item by ID
    async mintItem(itemId: string): Promise<string> {
        const asset = getAsset(itemId);

        if (!asset) {
            throw new Error(`Item ${itemId} not found`);
        }

        if (asset.category !== 'item') {
            throw new Error(`Asset ${itemId} is not an item (it's ${asset.category})`);
        }

        return this.mintAsset(itemId);
    }

    // ✅ Get all available assets by category
    getAvailableCharacters(): NFTAsset[] {
        return Object.values(ASSET_REGISTRY).filter(asset => asset.category === 'character');
    }

    getAvailableAchievements(): NFTAsset[] {
        return Object.values(ASSET_REGISTRY).filter(asset => asset.category === 'achievement');
    }

    getAvailableItems(): NFTAsset[] {
        return Object.values(ASSET_REGISTRY).filter(asset => asset.category === 'item');
    }

    // ✅ Validate that an asset exists and can be minted
    canMintAsset(assetId: string): boolean {
        const asset = getAsset(assetId);
        return asset !== null && asset.ipfsHash.length > 0;
    }

    // ✅ Get asset info for display
    getAssetInfo(assetId: string): NFTAsset | null {
        return getAsset(assetId);
    }

    render() {
        const characters = this.getAvailableCharacters();
        const achievements = this.getAvailableAchievements();
        const items = this.getAvailableItems();

        return (
            <ScrollView style= { styles.container } >
            <Text style={ styles.header }> Available Characters < /Text>
        {
            characters.map((asset, index) => (
                <View key= {`${asset.name}-${index}`} style = { styles.assetItem } >
                    <Text>{ asset.name } < /Text>
                    < Button
        title = "Mint"
        onPress = { async() => {
            try {
                // Assuming asset has an 'id' property; adjust if needed based on NFTAsset type
                // If no 'id', map from keys separately
                const sig = await this.mintCharacter(asset.id || Object.keys(ASSET_REGISTRY).find(key => ASSET_REGISTRY[key] === asset) || '');
                alert(`Minted: ${sig}`);
            } catch (e) {
                alert(`Error: ${(e as Error).message}`);
            }
        }
    }
            />
    < /View>
        ))}

<Text style={ styles.header }> Available Achievements < /Text>
{
    achievements.map((asset, index) => (
        <View key= {`${asset.name}-${index}`} style = { styles.assetItem } >
            <Text>{ asset.name } < /Text>
            < Button
title = "Mint"
onPress = { async() => {
    try {
        const sig = await this.mintAchievement(asset.id || Object.keys(ASSET_REGISTRY).find(key => ASSET_REGISTRY[key] === asset) || '');
        alert(`Minted: ${sig}`);
    } catch (e) {
        alert(`Error: ${(e as Error).message}`);
    }
}}
/>
    < /View>
        ))}

<Text style={ styles.header }> Available Items < /Text>
{
    items.map((asset, index) => (
        <View key= {`${asset.name}-${index}`} style = { styles.assetItem } >
            <Text>{ asset.name } < /Text>
            < Button
title = "Mint"
onPress = { async() => {
    try {
        const sig = await this.mintItem(asset.id || Object.keys(ASSET_REGISTRY).find(key => ASSET_REGISTRY[key] === asset) || '');
        alert(`Minted: ${sig}`);
    } catch (e) {
        alert(`Error: ${(e as Error).message}`);
    }
}}
/>
    < /View>
        ))}
</ScrollView>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    assetItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
});