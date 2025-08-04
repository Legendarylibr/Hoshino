import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface WalletButtonProps {
    connected: boolean;
    publicKey?: string | null;
    onConnect: () => void;
    onDisconnect: () => void;
}

const WalletButton: React.FC<WalletButtonProps> = ({
    connected,
    publicKey,
    onConnect,
    onDisconnect
}) => {
    const getWalletDisplay = () => {
        if (!connected || !publicKey) {
            return 'Connect';
        }
        return `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
    };

    return (
        <View style={styles.container}>
            {connected && publicKey ? (
                <TouchableOpacity 
                    style={styles.connectedButton}
                    onPress={onDisconnect}
                >
                    <Text style={styles.connectedText}>{getWalletDisplay()}</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity 
                    style={styles.connectButton}
                    onPress={onConnect}
                >
                    <Text style={styles.connectText}>Connect</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1000,
    },
    connectButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    connectText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    connectedButton: {
        backgroundColor: '#A8E6CF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    connectedText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default WalletButton; 