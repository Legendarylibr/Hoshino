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

            {/* Inner screen with pixelated borders */}
            <View style={[
                styles.innerScreen,
                isSelectionPage && styles.innerScreenLarge,
                overlayMode && styles.overlayInnerScreen
            ]}>
                {/* Pixelated border system for main screen */}
                <View style={styles.screenBorderTop} />
                <View style={styles.screenBorderBottom} />
                <View style={styles.screenBorderLeft} />
                <View style={styles.screenBorderRight} />

                {/* Pixelated corners */}
                <View style={styles.screenCornerTL} />
                <View style={styles.screenCornerTR} />
                <View style={styles.screenCornerBL} />
                <View style={styles.screenCornerBR} />

                {/* Additional corner pixels for authentic Game Boy look */}
                <View style={styles.screenCornerPixelTL1} />
                <View style={styles.screenCornerPixelTL2} />
                <View style={styles.screenCornerPixelTR1} />
                <View style={styles.screenCornerPixelTR2} />
                <View style={styles.screenCornerPixelBL1} />
                <View style={styles.screenCornerPixelBL2} />
                <View style={styles.screenCornerPixelBR1} />
                <View style={styles.screenCornerPixelBR2} />

                {/* Inner corner light fills - Game Boy LCD effect */}
                <View style={styles.innerCornerFillTL} />
                <View style={styles.innerCornerFillTR} />
                <View style={styles.innerCornerFillBL} />
                <View style={styles.innerCornerFillBR} />

                {/* Dithered shadow system */}
                <View style={styles.screenShadowMain} />
                <View style={styles.screenShadowCorner1} />
                <View style={styles.screenShadowCorner2} />
                <View style={styles.screenDither1} />
                <View style={styles.screenDither2} />
                <View style={styles.screenDither3} />
                <View style={styles.screenDither4} />

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
        borderRadius: 0, // Remove smooth corners
        overflow: 'visible', // Allow pixelated borders to show
        position: 'relative',
        marginTop: isTablet ? -20 : -40,
        borderWidth: 0, // Remove CSS border
        backgroundColor: 'transparent', // Let the background image show through
        // Add space for BIGGER shadows
        marginRight: isTablet ? 16 : 12,
        marginBottom: isTablet ? 16 : 12,
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
    },
    darkenedButtons: {
        opacity: 0.3,
    },
    innerBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 1,
    },

    // Pixelated border system for main screen - MUCH THICKER
    screenBorderTop: {
        position: 'absolute',
        top: 0,
        left: isTablet ? 12 : 8,
        right: isTablet ? 12 : 8,
        height: isTablet ? 8 : 6,
        backgroundColor: '#5A7B8A', // Same as original border color
        zIndex: 10,
    },
    screenBorderBottom: {
        position: 'absolute',
        bottom: 0,
        left: isTablet ? 12 : 8,
        right: isTablet ? 12 : 8,
        height: isTablet ? 8 : 6,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenBorderLeft: {
        position: 'absolute',
        top: isTablet ? 8 : 6,
        bottom: isTablet ? 8 : 6,
        left: 0,
        width: isTablet ? 8 : 6,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenBorderRight: {
        position: 'absolute',
        top: isTablet ? 8 : 6,
        bottom: isTablet ? 8 : 6,
        right: 0,
        width: isTablet ? 8 : 6,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },

    // Main corner pixels - MUCH BIGGER
    screenCornerTL: {
        position: 'absolute',
        top: isTablet ? 4 : 3,
        left: isTablet ? 4 : 3,
        width: isTablet ? 8 : 6,
        height: isTablet ? 8 : 6,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenCornerTR: {
        position: 'absolute',
        top: isTablet ? 4 : 3,
        right: isTablet ? 4 : 3,
        width: isTablet ? 8 : 6,
        height: isTablet ? 8 : 6,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenCornerBL: {
        position: 'absolute',
        bottom: isTablet ? 4 : 3,
        left: isTablet ? 4 : 3,
        width: isTablet ? 8 : 6,
        height: isTablet ? 8 : 6,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenCornerBR: {
        position: 'absolute',
        bottom: isTablet ? 4 : 3,
        right: isTablet ? 4 : 3,
        width: isTablet ? 8 : 6,
        height: isTablet ? 8 : 6,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },

    // Additional corner detail pixels - BIGGER AND MORE VISIBLE
    screenCornerPixelTL1: {
        position: 'absolute',
        top: isTablet ? 2 : 1,
        left: isTablet ? 12 : 8,
        width: isTablet ? 4 : 3,
        height: isTablet ? 4 : 3,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenCornerPixelTL2: {
        position: 'absolute',
        top: isTablet ? 12 : 8,
        left: isTablet ? 2 : 1,
        width: isTablet ? 4 : 3,
        height: isTablet ? 4 : 3,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenCornerPixelTR1: {
        position: 'absolute',
        top: isTablet ? 2 : 1,
        right: isTablet ? 12 : 8,
        width: isTablet ? 4 : 3,
        height: isTablet ? 4 : 3,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenCornerPixelTR2: {
        position: 'absolute',
        top: isTablet ? 12 : 8,
        right: isTablet ? 2 : 1,
        width: isTablet ? 4 : 3,
        height: isTablet ? 4 : 3,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenCornerPixelBL1: {
        position: 'absolute',
        bottom: isTablet ? 2 : 1,
        left: isTablet ? 12 : 8,
        width: isTablet ? 4 : 3,
        height: isTablet ? 4 : 3,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenCornerPixelBL2: {
        position: 'absolute',
        bottom: isTablet ? 12 : 8,
        left: isTablet ? 2 : 1,
        width: isTablet ? 4 : 3,
        height: isTablet ? 4 : 3,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenCornerPixelBR1: {
        position: 'absolute',
        bottom: isTablet ? 2 : 1,
        right: isTablet ? 12 : 8,
        width: isTablet ? 4 : 3,
        height: isTablet ? 4 : 3,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },
    screenCornerPixelBR2: {
        position: 'absolute',
        bottom: isTablet ? 12 : 8,
        right: isTablet ? 2 : 1,
        width: isTablet ? 4 : 3,
        height: isTablet ? 4 : 3,
        backgroundColor: '#5A7B8A',
        zIndex: 10,
    },

    // Dithered shadow system - BIGGER AND MORE VISIBLE
    screenShadowMain: {
        position: 'absolute',
        top: isTablet ? 12 : 8,
        right: isTablet ? -12 : -8,
        bottom: isTablet ? -12 : -8,
        width: isTablet ? 12 : 8,
        backgroundColor: '#4A6B7A', // Darker shadow
        zIndex: -1,
    },
    screenShadowCorner1: {
        position: 'absolute',
        bottom: isTablet ? -12 : -8,
        left: isTablet ? 12 : 8,
        right: isTablet ? -12 : -8,
        height: isTablet ? 12 : 8,
        backgroundColor: '#4A6B7A',
        zIndex: -1,
    },
    screenShadowCorner2: {
        position: 'absolute',
        bottom: isTablet ? -12 : -8,
        right: isTablet ? -12 : -8,
        width: isTablet ? 12 : 8,
        height: isTablet ? 12 : 8,
        backgroundColor: '#3A5B6A', // Even darker corner
        zIndex: -1,
    },

    // Dithering pixels for authentic Game Boy look - BIGGER
    screenDither1: {
        position: 'absolute',
        top: isTablet ? 8 : 6,
        right: isTablet ? -8 : -6,
        width: isTablet ? 4 : 3,
        height: isTablet ? 4 : 3,
        backgroundColor: '#5A7B8A', // Lighter dither
        zIndex: -1,
    },
    screenDither2: {
        position: 'absolute',
        bottom: isTablet ? -8 : -6,
        left: isTablet ? 8 : 6,
        width: isTablet ? 4 : 3,
        height: isTablet ? 4 : 3,
        backgroundColor: '#5A7B8A',
        zIndex: -1,
    },
    screenDither3: {
        position: 'absolute',
        top: isTablet ? 16 : 12,
        right: isTablet ? -6 : -4,
        width: isTablet ? 3 : 2,
        height: isTablet ? 3 : 2,
        backgroundColor: '#6A8B9A', // Medium dither
        zIndex: -1,
    },
    screenDither4: {
        position: 'absolute',
        bottom: isTablet ? -6 : -4,
        left: isTablet ? 16 : 12,
        width: isTablet ? 3 : 2,
        height: isTablet ? 3 : 2,
        backgroundColor: '#6A8B9A',
        zIndex: -1,
    },

    // Inner corner light fills - Game Boy LCD bezel effect
    innerCornerFillTL: {
        position: 'absolute',
        top: isTablet ? 8 : 6,
        left: isTablet ? 8 : 6,
        width: isTablet ? 6 : 4,
        height: isTablet ? 6 : 4,
        backgroundColor: '#7A9BAA', // Lighter fill color
        zIndex: 5,
    },
    innerCornerFillTR: {
        position: 'absolute',
        top: isTablet ? 8 : 6,
        right: isTablet ? 8 : 6,
        width: isTablet ? 6 : 4,
        height: isTablet ? 6 : 4,
        backgroundColor: '#7A9BAA',
        zIndex: 5,
    },
    innerCornerFillBL: {
        position: 'absolute',
        bottom: isTablet ? 8 : 6,
        left: isTablet ? 8 : 6,
        width: isTablet ? 6 : 4,
        height: isTablet ? 6 : 4,
        backgroundColor: '#7A9BAA',
        zIndex: 5,
    },
    innerCornerFillBR: {
        position: 'absolute',
        bottom: isTablet ? 8 : 6,
        right: isTablet ? 8 : 6,
        width: isTablet ? 6 : 4,
        height: isTablet ? 6 : 4,
        backgroundColor: '#7A9BAA',
        zIndex: 5,
    },

    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        backgroundColor: 'darkgray',
        zIndex: 2,
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
        zIndex: 2,
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