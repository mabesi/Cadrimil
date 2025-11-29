// Elegant Custom Select component
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Colors } from '../constants/colors';

interface SelectOption {
    label: string;
    value: string;
}

interface CustomSelectProps {
    label: string;
    value: string;
    onValueChange: (value: string) => void;
    items: SelectOption[];
    placeholder?: string;
}

export function CustomSelect({
    label,
    value,
    onValueChange,
    items,
    placeholder = 'Selecione...',
}: CustomSelectProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.pickerContainer}>
                <RNPickerSelect
                    value={value}
                    onValueChange={onValueChange}
                    items={items}
                    placeholder={{ label: placeholder, value: '' }}
                    style={pickerSelectStyles}
                    useNativeAndroidPickerStyle={false}
                />
            </View>
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 6,
        backgroundColor: Colors.white,
    },
});

const pickerSelectStyles = {
    inputIOS: {
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        color: Colors.text,
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        color: Colors.text,
    },
    placeholder: {
        color: Colors.textMuted,
    },
};
