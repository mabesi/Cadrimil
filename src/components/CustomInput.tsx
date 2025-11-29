// Standard Professional Input
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../constants/colors';

interface CustomInputProps extends TextInputProps {
    label: string;
    error?: string;
}

export function CustomInput({ label, error, style, ...props }: CustomInputProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, error && styles.inputError, style]}
                placeholderTextColor={Colors.textMuted}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: Colors.white,
        color: Colors.text,
    },
    inputError: {
        borderColor: Colors.danger,
        backgroundColor: Colors.dangerLight,
    },
    errorText: {
        fontSize: 12,
        color: Colors.danger,
        marginTop: 4,
    },
});
