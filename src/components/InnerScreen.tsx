import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';

// Get screen dimensions for responsive sizing
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768; // Common tablet breakpoint

interface InnerScreenProps {
    children: React.ReactNode;
    onLeftButtonPress?: () => void;
    onCenterButtonPress?: () => void;
    onRightButtonPress?: () => void;
    leftButtonText?: string;
    centerButtonText?: string;
    rightButtonText?: string;
    leftButtonDisabled?: boolean;
    centerButtonDisabled?: boolean;
    rightButtonDisabled?: boolean;
    showStatsBar?: boolean;
    statsBarContent?: React.ReactNode;
    topStatusContent?: React.ReactNode;
    showBackgroundImage?: boolean;
    backgroundImageSource?: any;
}

const InnerScreen: React.FC<InnerScreenProps> = ({
    children,
    onLeftButtonPress,
    onCenterButtonPress,
    onRightButtonPress,
    leftButtonText = '←',
    centerButtonText = '✓',
    rightButtonText = '→',
    leftButtonDisabled = false,
    centerButtonDisabled = false,
    rightButtonDisabled = false,
    showStatsBar = false,
    statsBarContent,
    topStatusContent,
    showBackgroundImage = true,
    backgroundImageSource
}) => {
    return (
        <View style={styles.tamagotchiScreenContainer}>
            {/* Background casing image */}
            <Image 
                source={require('../../assets/images/casing.png')} 
                style={styles.mainBackground} 
                resizeMode="cover" 
            />
            
            {/* Top Status Bar */}
            {topStatusContent && (
                <View style={styles.topStatus}>
                    {topStatusContent}
                </View>
            )}

            {/* Inner screen with rounded borders */}
            <View style={styles.innerScreen}>
                {/* Screen background */}
                {showBackgroundImage && (
                    <Image 
                        source={backgroundImageSource || require('../../assets/images/screen bg.png')} 
                        style={styles.innerBackground} 
                        resizeMode="cover" 
                    />
                )}
                
                {/* Stats Bar */}
                {showStatsBar && (
                    <View style={styles.statsBar}>
                        {statsBarContent || (
                            <>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Items</Text>
                                    <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Moonlings</Text>
                                    <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                                </View>
                                <View style={styles.statItem}>
                                    <Text style={styles.statLabel}>Total</Text>
                                    <Text style={styles.starRating}>⭐⭐⭐⭐⭐</Text>
                                </View>
                            </>
                        )}
                    </View>
                )}
                
                {/* Main content area */}
                <View style={styles.mainDisplayArea}>
                    {children}
                </View>
            </View>

            {/* Bottom Navigation Buttons */}
            <TouchableOpacity 
                style={[styles.bottomButton, styles.left, leftButtonDisabled && styles.disabled]} 
                onPress={!leftButtonDisabled ? onLeftButtonPress : undefined}
            >
                <Text style={styles.buttonText}>{leftButtonText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.bottomButton, styles.center, centerButtonDisabled && styles.disabled]}
                onPress={!centerButtonDisabled ? onCenterButtonPress : undefined}
            >
                <Text style={styles.buttonText}>{centerButtonText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.bottomButton, styles.right, rightButtonDisabled && styles.disabled]}
                onPress={!rightButtonDisabled ? onRightButtonPress : undefined}
            >
                <Text style={styles.buttonText}>{rightButtonText}</Text>
            </TouchableOpacity>

            {/* Physical Device Buttons - overlaid on background image */}
            <TouchableOpacity
                style={[styles.deviceButton, styles.leftPhysical]}
                onPress={!leftButtonDisabled ? onLeftButtonPress : undefined}
            />
            <TouchableOpacity
                style={[styles.deviceButton, styles.centerPhysical]}
                onPress={!centerButtonDisabled ? onCenterButtonPress : undefined}
            />
            <TouchableOpacity
                style={[styles.deviceButton, styles.rightPhysical]}
                onPress={!rightButtonDisabled ? onRightButtonPress : undefined}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    tamagotchiScreenContainer: {
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    topStatus: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        backgroundColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    innerScreen: {
        width: isTablet ? '75%' : '80%',
        height: isTablet ? '65%' : '70%',
        borderRadius: isTablet ? 25 : 15,
        overflow: 'hidden',
        position: 'relative',
    },
    innerBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: 'darkgray',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    starRating: {
        color: 'gold',
        fontSize: 14,
    },
    mainDisplayArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomButton: {
        position: 'absolute',
        bottom: 20,
        padding: 10,
        backgroundColor: 'gray',
        borderRadius: 5,
        alignItems: 'center',
        width: 50,
        height: 50,
        justifyContent: 'center',
    },
    left: {
        left: 20,
    },
    center: {
        left: '50%',
        transform: [{ translateX: -25 }],
    },
    right: {
        right: 20,
    },
    disabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deviceButton: {
        position: 'absolute',
        width: 50,
        height: 50,
        backgroundColor: 'transparent',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leftPhysical: {
        bottom: 20,
        left: 20,
    },
    centerPhysical: {
        bottom: 20,
        left: '50%',
        transform: [{ translateX: -25 }],
    },
    rightPhysical: {
        bottom: 20,
        right: 20,
    },
});

export default InnerScreen; 