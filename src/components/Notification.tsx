import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface NotificationProps {
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
    onClose: () => void;
    autoClose?: boolean;
    deploymentStatus?: string;
}

const Notification: React.FC<NotificationProps> = ({
    message,
    type,
    onClose,
    autoClose = true,
    deploymentStatus
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose();
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return { backgroundColor: '#22c55e', borderColor: '#16a34a' };
            case 'warning':
                return { backgroundColor: '#eab308', borderColor: '#ca8a04' };
            case 'info':
                return { backgroundColor: '#3b82f6', borderColor: '#2563eb' };
            case 'error':
                return { backgroundColor: '#ef4444', borderColor: '#dc2626' };
            default:
                return { backgroundColor: '#6b7280', borderColor: '#4b5563' };
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            case 'error':
                return '❌';
            default:
                return '📢';
        }
    };

    if (!isVisible) return null;

    return (
        <View style={[styles.notificationContainer, getTypeStyles()]}>
            <View style={styles.rowJustifyBetween}>
                <View style={styles.rowItemsStart}>
                    <Text style={styles.icon}>{getIcon()}</Text>
                    <View style={styles.flex1}>
                        <Text style={styles.message}>{message}</Text>
                        {deploymentStatus && (
                            <View style={styles.statusContainer}>
                                <Text style={styles.statusText}>{deploymentStatus}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        setIsVisible(false);
                        onClose();
                    }}
                    style={styles.closeButton}
                >
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const DeploymentStatusBanner: React.FC<{
    isVisible: boolean;
    status: string;
    onDismiss: () => void;
}> = ({ isVisible, status, onDismiss }) => {
    if (!isVisible) return null;

    const getStatusInfo = (status: string) => {
        if (status.includes('Custom programs deployed')) {
            return {
                type: 'success' as const,
                icon: '🚀',
                title: 'Enhanced Mode Active',
                description: 'Custom Solana programs deployed - All features optimized!'
            };
        } else if (status.includes('enhanced fallback')) {
            return {
                type: 'info' as const,
                icon: '⏳',
                title: 'Enhanced Fallback Mode',
                description: 'All features working perfectly with programmable NFTs'
            };
        } else {
            return {
                type: 'warning' as const,
                icon: '❓',
                title: 'Status Unknown',
                description: 'Game should work normally'
            };
        }
    };

    const statusInfo = getStatusInfo(status);

    return (
        <LinearGradient
            colors={['#9333ea', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bannerContainer}
        >
            <View style={styles.bannerRow}>
                <View style={styles.bannerContentRow}>
                    <Text style={styles.bannerIcon}>{statusInfo.icon}</Text>
                    <View>
                        <Text style={styles.bannerTitle}>{statusInfo.title}</Text>
                        <Text style={styles.bannerDescription}>{statusInfo.description}</Text>
                        {statusInfo.type === 'info' && (
                            <Text style={styles.bannerTip}>
                                💡 Custom programs can be deployed later for enhanced features
                            </Text>
                        )}
                    </View>
                </View>
                <TouchableOpacity onPress={onDismiss} style={styles.bannerCloseButton}>
                    <Text style={styles.bannerCloseText}>✕</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    notificationContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 9999,
        padding: 14,
        borderRadius: 8,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 25,
        elevation: 5,
        maxWidth: 320,
    },
    rowJustifyBetween: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    rowItemsStart: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    icon: {
        fontSize: 18,
        color: 'white',
        marginRight: 8,
    },
    flex1: {
        flex: 1,
    },
    message: {
        fontWeight: '500',
        color: 'white',
        fontSize: 12,
        lineHeight: 16.8,
        fontFamily: 'monospace',
    },
    statusContainer: {
        marginTop: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        color: 'white',
        fontFamily: 'monospace',
    },
    closeButton: {
        padding: 4,
    },
    closeText: {
        color: 'white',
        fontSize: 16,
    },
    bannerContainer: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        right: 4,
        zIndex: 40,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        padding: 16,
    },
    bannerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bannerContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bannerIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    bannerTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'white',
    },
    bannerDescription: {
        fontSize: 14,
        color: 'white',
        opacity: 0.9,
    },
    bannerTip: {
        fontSize: 12,
        marginTop: 4,
        color: 'white',
        opacity: 0.75,
    },
    bannerCloseButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 999,
        padding: 8,
    },
    bannerCloseText: {
        color: 'white',
        fontSize: 16,
    },
});

export default Notification;