// Mission Card component
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Mission } from '../types';
import { Colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';
import { serializeMissionDates } from '../utils/missionSerialization';

interface MissionCardProps {
    mission: Mission;
    onEdit: () => void;
    onDelete: () => void;
}

export function MissionCard({ mission, onEdit, onDelete }: MissionCardProps) {
    const handleExport = async () => {
        try {
            // Normalize string to remove accents (NFD decomposes characters, e.g., 'ç' becomes 'c' + '¸')
            // Then remove the diacritical marks
            const normalizedName = mission.nomeMissao
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

            const fileName = `${normalizedName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.cmil`;
            // @ts-ignore
            const fileUri = (FileSystem.cacheDirectory || FileSystem.documentDirectory) + fileName;
            await FileSystem.writeAsStringAsync(
                fileUri,
                JSON.stringify(serializeMissionDates(mission), null, 2)
            );

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: `Compartilhar ${mission.nomeMissao}`,
                    UTI: 'com.mabesi.cadrimil.mission' // Custom UTI for iOS if needed, or stick to public.json but with .cmil
                });
            } else {
                Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
            }
        } catch (error) {
            console.error('Export Error:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            Alert.alert('Erro ao Exportar', `Detalhes: ${errorMessage}`);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>{mission.nomeMissao}</Text>
                </View>

                <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Períodos:</Text>
                        <Text style={styles.infoValue}>{mission.periodos.length}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>AED Incluído:</Text>
                        <Text style={[
                            styles.infoValue,
                            mission.incluirAED ? styles.aedYes : styles.aedNo
                        ]}>
                            {mission.incluirAED ? 'Sim' : 'Não'}
                        </Text>
                    </View>
                </View>

                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>
                        R$ {formatCurrency(mission.valorTotal)}
                    </Text>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={onDelete} style={[styles.iconButton, { backgroundColor: Colors.danger }]}>
                    <Text style={styles.iconText}>🗑️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onEdit} style={[styles.iconButton, { backgroundColor: Colors.primary }]}>
                    <Text style={styles.iconText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleExport} style={[styles.iconButton, { backgroundColor: Colors.success }]}>
                    <Text style={styles.iconText}>📤</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderLeftWidth: 4,
        borderLeftColor: Colors.secondary,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row', // Side by side layout
        overflow: 'hidden',
    },
    contentContainer: {
        flex: 1,
        padding: 12,
    },
    actionsContainer: {
        width: 52,
        backgroundColor: Colors.backgroundSecondary,
        borderLeftWidth: 1,
        borderLeftColor: Colors.borderLight,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingVertical: 6,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 6,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    iconButton: {
        padding: 6,
        width: 38,
        height: 38,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 2,
    },
    iconText: {
        fontSize: 18,
        color: Colors.white,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    infoItem: {
        alignItems: 'flex-start',
    },
    infoLabel: {
        fontSize: 11,
        color: Colors.textLight,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.text,
    },
    aedYes: {
        color: Colors.success,
        fontWeight: 'bold',
    },
    aedNo: {
        color: Colors.textMuted,
    },
    totalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingTop: 6,
        marginTop: 2,
    },
    totalLabel: {
        fontSize: 12,
        color: Colors.textMuted,
    },
    totalValue: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
});
