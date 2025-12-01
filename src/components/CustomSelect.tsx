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
    const selectedItem = items.find(item => item.value === value);
    const displayText = selectedItem ? selectedItem.label : placeholder;

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
                {value && (
                    <View style={styles.textOverlay} pointerEvents="none">
                        <Text
                            style={styles.displayText}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                        >
                            {displayText}
                        </Text>
                    </View>
                )}
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
        color: Colors.textLight,
        marginBottom: 6,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 6,
        backgroundColor: Colors.white,
        position: 'relative',
    },
    textOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 30,
        bottom: 0,
        justifyContent: 'center',
        paddingHorizontal: 12,
        backgroundColor: Colors.white,
    },
    displayText: {
        fontSize: 16,
        color: Colors.text,
        textAlign: 'left',
    },
});

const pickerSelectStyles = {
    inputIOS: {
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        paddingRight: 30,
        color: 'transparent', // Hide native text, use overlay instead
        textAlign: 'left' as const,
        writingDirection: 'ltr' as const,
    },
    inputAndroid: {
        fontSize: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        paddingRight: 30,
        color: 'transparent', // Hide native text, use overlay instead
        textAlign: 'left' as const,
        writingDirection: 'ltr' as const,
    },
    placeholder: {
        color: Colors.textMuted,
    },
};
