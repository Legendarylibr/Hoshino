import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useProgrammableNFT } from '../hooks/useProgrammableNFT';

interface Props {
  onBack?: () => void;
}

const AssetRegistryDemo: React.FC<Props> = ({ onBack }) => {
  const { mockMintCharacterNFT } = useProgrammableNFT();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  const testCharacters = [
    { id: 'hoshino', name: 'HOSHINO' },
    { id: 'sirius', name: 'SIRIUS' },
    { id: 'lyra', name: 'LYRA' },
    { id: 'aro', name: 'ARO' },
    { id: 'orion', name: 'ORION' },
    { id: 'zaniah', name: 'ZANIAH' }
  ];

  const handleMockMint = async (characterId: string) => {
    setIsLoading(true);
    setLastResult('');

    try {
      console.log(`🎮 Testing mock mint for: ${characterId}`);
      
      const result = await mockMintCharacterNFT(characterId);
      
      if (result.success) {
        const successMessage = `✅ Mock NFT Created!\n\nCharacter: ${characterId.toUpperCase()}\nMint Address: ${result.mintAddress}\nMetadata URI: ${result.metadataUri}\nCost: ${result.actualCost}`;
        setLastResult(successMessage);
        Alert.alert('🎉 Success!', successMessage);
      } else {
        const errorMessage = `❌ Mock mint failed: ${result.error}`;
        setLastResult(errorMessage);
        Alert.alert('❌ Error', errorMessage);
      }
    } catch (error) {
      const errorMessage = `❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setLastResult(errorMessage);
      Alert.alert('❌ Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      {onBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.title}>🧪 Mock NFT Minting Test</Text>
      <Text style={styles.subtitle}>Test the simplified NFT minting without backend</Text>
      
      <View style={styles.characterGrid}>
        {testCharacters.map((character) => (
          <TouchableOpacity
            key={character.id}
            style={[styles.characterButton, isLoading && styles.disabledButton]}
            onPress={() => handleMockMint(character.id)}
            disabled={isLoading}
          >
            <Text style={styles.characterName}>{character.name}</Text>
            <Text style={styles.characterId}>{character.id}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🎮 Minting NFT...</Text>
        </View>
      )}

      {lastResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>📋 Last Result:</Text>
          <Text style={styles.resultText}>{lastResult}</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>ℹ️ What this tests:</Text>
        <Text style={styles.infoText}>• Mock NFT creation without backend</Text>
        <Text style={styles.infoText}>• Simplified metadata structure</Text>
        <Text style={styles.infoText}>• Uppercase character names</Text>
        <Text style={styles.infoText}>• Basic Mood attribute only</Text>
        <Text style={styles.infoText}>• Real IPFS image URLs</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#FF6B6B',
    padding: 10,
    borderRadius: 20,
    zIndex: 1000,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  characterButton: {
    width: '48%',
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  disabledButton: {
    opacity: 0.5,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  characterId: {
    fontSize: 12,
    color: '#888888',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#00ff88',
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#16213e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 12,
    color: '#cccccc',
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: '#0f3460',
    padding: 15,
    borderRadius: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 5,
  },
});

export default AssetRegistryDemo;