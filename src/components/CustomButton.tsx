// Standard Professional Button
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface CustomButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
    disabled?: boolean;
    style?: ViewStyle;
}

export function CustomButton({
    title,
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
            <Text style={textStyle}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
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
    text: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
    textOutline: {
        color: Colors.primary,
    },
});
