// Collapsible year group used to organize mission cards
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';

interface YearAccordionProps {
    year: number;
    count: number;
    summary?: string;
    expanded: boolean;
    onToggle: () => void;
    children: ReactNode;
}

export function YearAccordion({
    year,
    count,
    summary,
    expanded,
    onToggle,
    children,
}: YearAccordionProps) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={onToggle}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ expanded }}
            >
                <View style={styles.titleContainer}>
                    <View style={styles.titleRow}>
                        <Text style={styles.year}>{year}</Text>
                        <Text style={styles.count}>
                            {count} {count === 1 ? 'missão' : 'missões'}
                        </Text>
                    </View>
                    {summary && <Text style={styles.summary}>{summary}</Text>}
                </View>
                <Text style={styles.icon}>{expanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>

            {expanded && <View style={styles.content}>{children}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    titleContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    summary: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 3,
    },
    year: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    count: {
        fontSize: 12,
        color: Colors.textLight,
    },
    icon: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    content: {
        marginTop: 8,
    },
});
