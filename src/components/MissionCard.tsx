// Mission Card component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Mission } from '../types';
import { CustomButton } from './CustomButton';
import { Colors } from '../constants/colors';

interface MissionCardProps {
    mission: Mission;
    onEdit: () => void;
    onDelete: () => void;
}

export function MissionCard({ mission, onEdit, onDelete }: MissionCardProps) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{mission.nomeMissao}</Text>
                <Text style={styles.id}>ID: {mission.id.substring(0, 8)}...</Text>
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
                <Text style={styles.totalValue}>
                    {mission.valorTotal.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    })}
                </Text>
            </View>

            <View style={styles.actions}>
                <CustomButton
                    title="Editar"
                    onPress={onEdit}
                    variant="primary"
                    style={styles.actionButton}
                />
                <CustomButton
                    title="Excluir"
                    onPress={onDelete}
                    variant="danger"
                    style={styles.actionButton}
                />
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
        padding: 16,
        marginBottom: 12,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
    },
    id: {
        fontSize: 11,
        color: Colors.textMuted,
        fontFamily: 'monospace',
        backgroundColor: Colors.backgroundSecondary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    infoGrid: {
        flexDirection: 'row',
        marginBottom: 12,
        backgroundColor: Colors.background,
        padding: 10,
        borderRadius: 6,
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '500',
        color: Colors.textLight,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    aedYes: {
        color: Colors.success,
    },
    aedNo: {
        color: Colors.textMuted,
    },
    totalContainer: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingTop: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.success,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
    },
});
