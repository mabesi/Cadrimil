// Custom Checkbox component
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface CustomCheckboxProps {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

export function CustomCheckbox({ label, value, onValueChange }: CustomCheckboxProps) {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onValueChange(!value)}
            activeOpacity={0.7}
        >
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                {value && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: Colors.border,
        borderRadius: 4,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
    },
    checkboxChecked: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
    },
    checkmark: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 14,
        color: Colors.text,
        flex: 1,
    },
});
