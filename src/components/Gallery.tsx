import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
    onBack: () => void;
}

const Gallery: React.FC<Props> = ({ onBack }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Gallery</Text>
                <Text style={styles.subtitle}>Coming Soon!</Text>
            </View>
            
            <View style={styles.content}>
                <Text style={styles.placeholder}>
                    🖼️ Gallery functionality will be implemented here
                </Text>
                <Text style={styles.placeholder}>
                    Show character achievements, milestones, and memories
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 50,
    },
    title: {
        fontSize: 32,
        color: '#fff',
        fontFamily: 'PressStart2P',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
        fontFamily: 'PressStart2P',
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    placeholder: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'PressStart2P',
    },
});

export default Gallery;