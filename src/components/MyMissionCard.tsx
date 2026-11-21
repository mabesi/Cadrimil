// Individual mission summary for the current user
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Mission } from '../types';
import { useData } from '../context/DataContext';
import { calculateIndividualMissionTotal } from '../utils/calculations';
import { DateHelpers } from '../utils/dateHelpers';
import { formatCurrency } from '../utils/formatters';
import { Colors } from '../constants/colors';

interface MyMissionCardProps {
    mission: Mission;
}

export function MyMissionCard({ mission }: MyMissionCardProps) {
    const { cadrimilData } = useData();
    const result = calculateIndividualMissionTotal(
        mission.periodos,
        mission.meuGrupo,
        mission.incluirAED,
        cadrimilData
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title} numberOfLines={1}>
                    {mission.nomeMissao}
                </Text>
                <View style={styles.groupBadge}>
                    <Text style={styles.groupBadgeText}>
                        Grupo {mission.meuGrupo ?? '—'}
                    </Text>
                </View>
            </View>

            {result.periodos.length === 0 ? (
                <Text style={styles.empty}>
                    Nenhum período deste grupo foi incluído na missão.
                </Text>
            ) : (
                <View style={styles.periods}>
                    {result.periodos.map((item, index) => (
                        <View key={item.period.id} style={styles.periodRow}>
                            <View style={styles.periodHeader}>
                                <Text style={styles.periodTitle} numberOfLines={1}>
                                    {index + 1}.{' '}
                                    {cadrimilData.localidades[item.period.localidade]}
                                </Text>
                                <Text style={styles.periodValue}>
                                    R$ {formatCurrency(item.valorDiarias)}
                                </Text>
                            </View>
                            <Text style={styles.periodDetails}>
                                {DateHelpers.format(item.period.dataInicio, 'dd/MM/yyyy')} -{' '}
                                {DateHelpers.format(item.period.dataFim, 'dd/MM/yyyy')} •{' '}
                                {item.numDiarias.toFixed(1)} diárias
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>
                    R$ {formatCurrency(result.total)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderLeftWidth: 4,
        borderLeftColor: Colors.accent,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 8,
    },
    title: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    groupBadge: {
        backgroundColor: Colors.backgroundSecondary,
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    groupBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.primary,
    },
    periods: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingTop: 4,
        marginBottom: 4,
    },
    periodRow: {
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: Colors.backgroundSecondary,
    },
    periodHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    periodTitle: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
    },
    periodValue: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.success,
    },
    periodDetails: {
        fontSize: 11,
        color: Colors.textLight,
        marginTop: 1,
    },
    empty: {
        fontSize: 12,
        color: Colors.textMuted,
        fontStyle: 'italic',
        marginVertical: 4,
    },
    totalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.resultBackground,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginTop: 4,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.primary,
    },
});
