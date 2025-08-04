import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useProgrammableNFT } from '../hooks/useProgrammableNFT';

/**
 * Simple working example of Programmable NFT integration with Solana Seeker support
 * Copy this pattern to use NFTs in your game components
 */
export const SimpleNFTExample: React.FC = () => {
    const {
        // Connection status
        connected,
        connecting,
        
        // Seeker-specific state
        isSeeker,
        seedVaultSupported,
        hardwareVerified,
        
        // Main NFT functions
        quickMintCharacter,
        quickMintAchievement,
        
        // Utility functions
        connectWallet,
        disconnect,
        getServiceStatus,
        getSeekerCapabilities
    } = useProgrammableNFT();

    const handleMintCharacter = async () => {
        if (!connected) {
            Alert.alert('Error', 'Please connect your wallet first');
            return;
        }

        const character = {
            id: 'lyra',
            name: 'Lyra',
            element: 'Celestial',
            rarity: 'Common' as const,
            image: 'LYRA.gif',
            description: 'A celestial character with starlight powers'
        };

        try {
            console.log('🎨 Minting character pNFT...');
            const result = await quickMintCharacter(character);
            
            if (result.success) {
                const hardwareMsg = result.hardwareVerified ? '\n🔐 Hardware-verified!' : '';
                Alert.alert(
                    'Success! 🎉', 
                    `${character.name} pNFT minted!\nMint: ${result.mintAddress}${hardwareMsg}`
                );
            } else {
                Alert.alert('Error', `Minting failed: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Minting failed:', error);
            Alert.alert('Error', 'Failed to mint NFT');
        }
    };

    const handleMintAchievement = async () => {
        if (!connected) {
            Alert.alert('Error', 'Please connect your wallet first');
            return;
        }

        const achievement = {
            id: 'first_moonling',
            name: 'First Moonling Befriended',
            description: 'You befriended your first moonling!',
            rarity: 'Common' as const
        };

        try {
            console.log('🏆 Minting achievement pNFT...');
            const result = await quickMintAchievement(achievement);
            
            if (result.success) {
                const hardwareMsg = result.hardwareVerified ? '\n🔐 Hardware-verified!' : '';
                Alert.alert(
                    'Achievement Unlocked! 🏆', 
                    `${achievement.name} pNFT minted!\nMint: ${result.mintAddress}${hardwareMsg}`
                );
            } else {
                Alert.alert('Error', `Achievement minting failed: ${result.error}`);
            }
        } catch (error) {
            console.error('❌ Achievement minting failed:', error);
            Alert.alert('Error', 'Failed to mint achievement NFT');
        }
    };

    const status = getServiceStatus();
    const seekerCaps = getSeekerCapabilities();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🚀 Programmable NFT Demo</Text>
            
            {/* Seeker Device Status */}
            {isSeeker && (
                <View style={styles.seekerContainer}>
                    <Text style={styles.seekerTitle}>🚀 Solana Seeker Detected!</Text>
                    <Text style={styles.seekerFeature}>
                        🔐 Seed Vault: {seedVaultSupported ? 'Available' : 'Not Available'}
                    </Text>
                    {hardwareVerified && (
                        <Text style={styles.verifiedText}>✅ Hardware Verification Active</Text>
                    )}
                </View>
            )}
            
            {/* Status Display */}
            <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                    Status: {connected ? 'Connected' : 'Disconnected'}
                </Text>
                {status.available && 'seeker' in status && (
                    <>
                        <Text style={styles.statusText}>
                            Device: {status.seeker.deviceType}
                        </Text>
                        <Text style={styles.statusText}>
                            Security: {status.seeker.securityLevel}
                        </Text>
                        <Text style={styles.statusText}>Standard: {status.standard}</Text>
                        <Text style={styles.statusText}>Type: {status.tokenStandard}</Text>
                    </>
                )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                {!connected ? (
                    <TouchableOpacity 
                        style={styles.connectButton} 
                        onPress={connectWallet}
                        disabled={connecting}
                    >
                        <Text style={styles.buttonText}>
                            {connecting ? 'Connecting...' : 'Connect Wallet'}
                        </Text>
                        {isSeeker && (
                            <Text style={styles.seekerButtonText}>
                                🚀 Seeker Device Ready
                            </Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity style={styles.mintButton} onPress={handleMintCharacter}>
                            <Text style={styles.buttonText}>Mint Character pNFT</Text>
                            <Text style={styles.costText}>
                                ~0.01 SOL {hardwareVerified ? '🔐' : ''}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.achievementButton} onPress={handleMintAchievement}>
                            <Text style={styles.buttonText}>Mint Achievement pNFT</Text>
                            <Text style={styles.costText}>
                                ~0.008 SOL {hardwareVerified ? '🔐' : ''}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
                            <Text style={styles.buttonText}>Disconnect</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Features Display */}
            <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>✨ Features:</Text>
                <Text style={styles.featureText}>• Token Metadata v1 standard</Text>
                <Text style={styles.featureText}>• Programmable NFTs (pNFTs)</Text>
                <Text style={styles.featureText}>• Update authority control</Text>
                <Text style={styles.featureText}>• IPFS metadata storage</Text>
                <Text style={styles.featureText}>• Marketplace compatible</Text>
                {isSeeker && (
                    <>
                        <Text style={styles.featureText}>🚀 Solana Seeker optimized</Text>
                        {seedVaultSupported && (
                            <Text style={styles.featureText}>🔐 Hardware-backed security</Text>
                        )}
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 20,
    },
    seekerContainer: {
        backgroundColor: '#1a4a3a',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#00ff88',
    },
    seekerTitle: {
        color: '#00ff88',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    seekerFeature: {
        color: '#ccffdd',
        fontSize: 14,
        marginBottom: 4,
    },
    verifiedText: {
        color: '#00ff88',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
    },
    statusContainer: {
        backgroundColor: '#2a2a2a',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    statusText: {
        color: '#ffffff',
        fontSize: 14,
        marginBottom: 5,
    },
    buttonContainer: {
        gap: 15,
        marginBottom: 20,
    },
    connectButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    mintButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    achievementButton: {
        backgroundColor: '#FF9800',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    disconnectButton: {
        backgroundColor: '#f44336',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    seekerButtonText: {
        color: '#00ff88',
        fontSize: 12,
        marginTop: 4,
    },
    costText: {
        color: '#cccccc',
        fontSize: 12,
        marginTop: 5,
    },
    featuresContainer: {
        backgroundColor: '#2a2a2a',
        padding: 15,
        borderRadius: 10,
    },
    featuresTitle: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    featureText: {
        color: '#cccccc',
        fontSize: 14,
        marginBottom: 5,
    },
}); 