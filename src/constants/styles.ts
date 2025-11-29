// Professional Minimalist Global Styles
import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const GlobalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    card: {
        backgroundColor: Colors.card,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardSecondary: {
        backgroundColor: Colors.cardSecondary,
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    shadow: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    shadowMd: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    shadowLg: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
});

export const Typography = {
    h1: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: Colors.text,
        letterSpacing: -0.5,
    },
    h2: {
        fontSize: 20,
        fontWeight: '600' as const,
        color: Colors.text,
        letterSpacing: -0.3,
    },
    h3: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: Colors.text,
        letterSpacing: -0.2,
    },
    h4: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    body: {
        fontSize: 16,
        color: Colors.text,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        color: Colors.textMuted,
        lineHeight: 16,
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
};

export const BorderRadius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
};
