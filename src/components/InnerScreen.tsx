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
    isSelectionPage?: boolean; // New prop for selection page styling
    overlayMode?: boolean; // New prop for modal-like overlay effect
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
    backgroundImageSource,
    isSelectionPage = false,
    overlayMode = false
}) => {
    return (
        <View style={styles.tamagotchiScreenContainer}>
            {/* Background casing image */}
            <Image 
                source={require('../../assets/images/casing.png')} 
                style={[styles.mainBackground, overlayMode && styles.darkenedBackground]} 
                resizeMode="cover" 
            />
            
            {/* Top Status Bar */}
            {topStatusContent && (
                <View style={styles.topStatus}>
                    {topStatusContent}
                </View>
            )}

            {/* Inner screen with rounded borders */}
            <View style={[
                styles.innerScreen, 
                isSelectionPage && styles.innerScreenLarge,
                overlayMode && styles.overlayInnerScreen
            ]}>
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
            <View style={[styles.bottomButtonContainer, overlayMode && styles.darkenedButtons]}>
                <TouchableOpacity 
                    style={[styles.bottomButton, styles.left, leftButtonDisabled && styles.disabled]} 
                    onPress={!leftButtonDisabled ? onLeftButtonPress : undefined}
                >
                    <Image source={require('../../assets/images/button.png')} style={styles.buttonImage} />
                    <Text style={[styles.buttonText, leftButtonText === 'YES' && styles.yesButtonText]}>{leftButtonText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.bottomButton, styles.center, centerButtonDisabled && styles.disabled]}
                    onPress={!centerButtonDisabled ? onCenterButtonPress : undefined}
                >
                    <Image source={require('../../assets/images/button.png')} style={styles.buttonImage} />
                    <Text style={styles.buttonText}>{centerButtonText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.bottomButton, styles.right, rightButtonDisabled && styles.disabled]}
                    onPress={!rightButtonDisabled ? onRightButtonPress : undefined}
                >
                    <Image source={require('../../assets/images/button.png')} style={styles.buttonImage} />
                    <Text style={[styles.buttonText, rightButtonText === 'NO' && styles.noButtonText]}>{rightButtonText}</Text>
                </TouchableOpacity>
            </View>

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
        width: isTablet ? '75%' : '78%',
        height: isTablet ? '65%' : '51%',
        borderRadius: isTablet ? 25 : 15,
        overflow: 'hidden',
        position: 'relative',
        marginTop: isTablet ? -20 : -40,
        borderWidth: 2,
        borderColor: '#5A7B8A', // Same darker blue border as buttons
    },
    innerScreenLarge: {
        width: isTablet ? '85%' : '88%',
        height: isTablet ? '75%' : '65%',
        marginTop: isTablet ? -10 : -20,
    },
    darkenedBackground: {
        opacity: 0.3,
    },
    overlayInnerScreen: {
        zIndex: 1000,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    darkenedButtons: {
        opacity: 0.3,
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
    bottomButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: isTablet ? 40 : 55,
        position: 'absolute',
        bottom: isTablet ? 20 : 100,
    },
    bottomButton: {
        width: isTablet ? 80 : 75,
        height: isTablet ? 80 : 75,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: isTablet ? 40 : 30,
        overflow: 'hidden',
        position: 'relative',
    },
    left: {
        marginRight: 'auto',
    },
    center: {
        marginTop: isTablet ? 10 : 30, // 10px lower
    },
    right: {
        marginLeft: 'auto',
    },
    disabled: {
        opacity: 0.3,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    buttonText: {
        color: '#2E5A3E', // Dark green for better contrast
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: isTablet ? 40 : 30,
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
    yesButtonText: {
        color: '#4CAF50', // Softer green
    },
    noButtonText: {
        color: '#F44336', // Softer red
    },
});

export default InnerScreen; 