// Standard Professional Button
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { Colors } from '../constants/colors';

interface CustomButtonProps {
    title: string;
    subtitle?: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
    disabled?: boolean;
    style?: ViewStyle;
}

export function CustomButton({
    title,
    subtitle,
    onPress,
    variant = 'primary',
    disabled = false,
    style
}: CustomButtonProps) {

    const buttonStyle = [
        styles.button,
        styles[variant],
        disabled && styles.disabled,
        style,
    ];

    const textStyle = [
        styles.text,
        variant === 'outline' && styles.textOutline,
    ];

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            {subtitle ? (
                <View style={styles.textContainer}>
                    <Text style={textStyle}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
            ) : (
                <Text style={textStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
    },
    primary: {
        backgroundColor: Colors.primary,
    },
    secondary: {
        backgroundColor: Colors.secondary,
    },
    success: {
        backgroundColor: Colors.success,
    },
    warning: {
        backgroundColor: Colors.warning,
    },
    danger: {
        backgroundColor: Colors.danger,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    disabled: {
        opacity: 0.6,
        backgroundColor: Colors.border,
    },
    textContainer: {
        alignItems: 'center',
    },
    text: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 11,
        marginTop: 2,
    },
    textOutline: {
        color: Colors.primary,
    },
});
