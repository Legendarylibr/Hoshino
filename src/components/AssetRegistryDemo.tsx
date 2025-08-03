import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { getCharacterAssets, getAchievementAssets, getItemAssets, getAsset } from '../config/AssetRegistry';

export const AssetRegistryDemo = () => {
    const [selectedCategory, setSelectedCategory] = useState<'character' | 'achievement' | 'item'>('character');

    const getAssetsByCategory = () => {
        switch (selectedCategory) {
            case 'character':
                return getCharacterAssets();
            case 'achievement':
                return getAchievementAssets();
            case 'item':
                return getItemAssets();
            default:
                return [];
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>🎮 Asset Registry Demo</Text>

            <View style={styles.categorySelector}>
                <Text style={styles.subtitle}>Select Category:</Text>
                <View style={styles.buttonContainer}>
                    {(['character', 'achievement', 'item'] as const).map(category => (
                        <TouchableOpacity
                            key={category}
                            onPress={() => setSelectedCategory(category)}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category ? styles.selectedButton : styles.unselectedButton,
                                category !== 'item' ? styles.buttonMargin : null
                            ]}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    selectedCategory === category ? styles.selectedButtonText : styles.unselectedButtonText
                                ]}
                            >
                                {category}s
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View>
                <Text style={[styles.subtitle, { marginBottom: 15 }]}>
                    Available {selectedCategory}s: ({getAssetsByCategory().length})
                </Text>

                <View style={styles.assetList}>
                    {getAssetsByCategory().map(asset => (
                        <View key={asset.id} style={styles.assetCard}>
                            <Text style={styles.assetName}>{asset.name}</Text>

                            <View style={[styles.assetDetail, { flexDirection: 'row' }]}>
                                <Text style={styles.detailLabel}>ID: </Text>
                                <Text style={styles.detailValue}>{asset.id}</Text>
                            </View>

                            <View style={[styles.assetDetail, { flexDirection: 'row' }]}>
                                <Text style={styles.detailLabel}>Category: </Text>
                                <Text style={styles.detailValue}>{asset.category}</Text>
                            </View>

                            <View style={styles.assetDetail}>
                                <Text style={styles.detailLabel}>Description:</Text>
                                <Text style={styles.description}>{asset.description}</Text>
                            </View>

                            <View style={styles.assetDetail}>
                                <Text style={styles.detailLabel}>IPFS Hash:</Text>
                                <Text style={styles.ipfsHash}>{asset.ipfsHash}</Text>
                            </View>

                            <Text style={styles.readyText}>✅ Ready for NFT minting</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>✅ Asset Registry System Active</Text>
                <Text style={styles.summaryText}>
                    • <Text style={styles.bold}>Total Assets:</Text> {getCharacterAssets().length + getAchievementAssets().length + getItemAssets().length}{'\n'}
                    • <Text style={styles.bold}>Characters:</Text> {getCharacterAssets().length}{'\n'}
                    • <Text style={styles.bold}>Achievements:</Text> {getAchievementAssets().length}{'\n'}
                    • <Text style={styles.bold}>Items:</Text> {getItemAssets().length}{'\n'}
                    • <Text style={styles.bold}>All IPFS hashes ready for instant minting</Text>{'\n'}
                    • <Text style={styles.bold}>Add new assets by just updating AssetRegistry.ts</Text>
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    contentContainer: {
        padding: 20,
    },
    title: {
        fontSize: 16,
        marginBottom: 20,
        color: '#FCD34D',
        fontFamily: 'Press Start 2P, monospace',
    },
    categorySelector: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 12,
        marginBottom: 10,
        color: '#FCD34D',
        fontFamily: 'Press Start 2P, monospace',
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    categoryButton: {
        borderWidth: 2,
        borderColor: '#FCD34D',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    selectedButton: {
        backgroundColor: '#FCD34D',
    },
    unselectedButton: {
        backgroundColor: '#4a4a4a',
    },
    buttonMargin: {
        marginRight: 10,
    },
    buttonText: {
        fontSize: 8,
        textTransform: 'capitalize',
        fontFamily: 'Press Start 2P, monospace',
    },
    selectedButtonText: {
        color: '#1a1a1a',
    },
    unselectedButtonText: {
        color: '#FCD34D',
    },
    assetList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    assetCard: {
        width: 250,
        backgroundColor: '#2a2a2a',
        borderWidth: 2,
        borderColor: '#FCD34D',
        borderRadius: 8,
        padding: 15,
        margin: 7.5,
    },
    assetName: {
        fontSize: 10,
        marginBottom: 8,
        color: '#FFD700',
        fontFamily: 'Press Start 2P, monospace',
    },
    assetDetail: {
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 10,
        color: '#FCD34D',
        fontFamily: 'Press Start 2P, monospace',
        fontWeight: 'bold',
    },
    detailValue: {
        fontSize: 10,
        color: '#FCD34D',
        fontFamily: 'Press Start 2P, monospace',
    },
    description: {
        fontSize: 8,
        marginTop: 4,
        lineHeight: 11.2,
        color: '#FCD34D',
        fontFamily: 'Press Start 2P, monospace',
    },
    ipfsHash: {
        fontSize: 6,
        marginTop: 4,
        color: '#888',
        fontFamily: 'Press Start 2P, monospace',
    },
    readyText: {
        fontSize: 8,
        color: '#4ade80',
        marginTop: 10,
        fontFamily: 'Press Start 2P, monospace',
    },
    summaryContainer: {
        marginTop: 30,
        padding: 15,
        backgroundColor: '#0a4d0a',
        borderWidth: 2,
        borderColor: '#4ade80',
        borderRadius: 8,
    },
    summaryTitle: {
        fontSize: 12,
        marginBottom: 10,
        color: '#4ade80',
        fontFamily: 'Press Start 2P, monospace',
    },
    summaryText: {
        fontSize: 8,
        lineHeight: 12.8,
        color: '#FCD34D',
        fontFamily: 'Press Start 2P, monospace',
    },
    bold: {
        fontWeight: 'bold',
    },
});

export default AssetRegistryDemo;