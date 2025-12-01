// Modern Header component with gradient
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';

export function Header() {
    const navigation = useNavigation();

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container}
        >
            <View style={styles.logoContainer}>
                <Image
                    source={require('../../assets/logo_header.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <TouchableOpacity
                    style={styles.helpButton}
                    onPress={() => navigation.navigate('Ajuda' as never)}
                >
                    <Text style={styles.helpIcon}>?</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: '100%',
        backgroundColor: Colors.cardSecondary,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logo: {
        width: 210, // Increased from 200
        height: 64, // Increased from 60
    },
    helpButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.secondary,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    helpIcon: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
});
