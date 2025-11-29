// Decrees Screen
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Linking,
    TouchableOpacity,
} from 'react-native';
import { useData } from '../context/DataContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Colors } from '../constants/colors';
import { GlobalStyles } from '../constants/styles';

export function DecreesScreen() {
    const { cadrmilData, loading } = useData();

    if (loading || !cadrmilData) {
        return <LoadingSpinner message="Carregando decretos..." />;
    }

    const handleOpenLink = (url: string) => {
        Linking.openURL(url).catch(err => {
            console.error('Error opening link:', err);
        });
    };

    return (
        <ScrollView style={GlobalStyles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Referências Legais</Text>

                {cadrmilData.decretos.map((decreto, index) => (
                    <View key={index} style={styles.decreeCard}>
                        <Text style={styles.decreeTitle}>{decreto.title}</Text>
                        <View style={styles.decreeInfo}>
                            <Text style={styles.decreeNumber}>{decreto.decree}</Text>
                            <Text style={styles.decreeText}>, de {decreto.date}.</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.linkButton}
                            onPress={() => handleOpenLink(decreto.link)}
                        >
                            <Text style={styles.linkText}>[Ver na íntegra]</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    decreeCard: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    decreeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    decreeInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    decreeNumber: {
        fontSize: 14,
        color: Colors.secondary,
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    decreeText: {
        fontSize: 14,
        color: Colors.text,
    },
    linkButton: {
        marginTop: 4,
    },
    linkText: {
        fontSize: 14,
        color: '#6366f1',
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});
