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

    const grupoDescricao = mission.meuGrupo
        ? cadrimilData.grupos[mission.meuGrupo] ?? mission.meuGrupo
        : 'Não definido';

    const createdAt = new Date(mission.dataCriacao);
    const createdText = Number.isNaN(createdAt.getTime())
        ? null
        : DateHelpers.format(createdAt, 'dd/MM/yyyy');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{mission.nomeMissao}</Text>
                {createdText && <Text style={styles.date}>Criada em {createdText}</Text>}
            </View>

            <Text style={styles.group}>
                Meu grupo: {mission.meuGrupo ?? '—'} - {grupoDescricao}
            </Text>

            {result.periodos.length === 0 ? (
                <Text style={styles.empty}>
                    Nenhum período deste grupo foi incluído na missão.
                </Text>
            ) : (
                <View style={styles.periods}>
                    {result.periodos.map((item, index) => (
                        <View key={item.period.id} style={styles.periodRow}>
                            <View style={styles.periodHeader}>
                                <Text style={styles.periodTitle}>
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

            <View style={styles.summary}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Diárias</Text>
                    <Text style={styles.summaryValue}>
                        R$ {formatCurrency(result.diariasTotal)}
                    </Text>
                </View>
                {mission.incluirAED && (
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>AED</Text>
                        <Text style={styles.summaryValue}>
                            R$ {formatCurrency(result.aedTotal)}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total individual</Text>
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
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    date: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 2,
    },
    group: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 10,
    },
    periods: {
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        paddingTop: 8,
        marginBottom: 8,
    },
    periodRow: {
        paddingVertical: 6,
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
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    periodValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.success,
    },
    periodDetails: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 2,
    },
    empty: {
        fontSize: 13,
        color: Colors.textMuted,
        fontStyle: 'italic',
        marginVertical: 8,
    },
    summary: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
    },
    summaryItem: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 12,
        color: Colors.textLight,
        marginBottom: 2,
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
    },
    totalBox: {
        backgroundColor: Colors.resultBackground,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    totalValue: {
        fontSize: 22,
        fontWeight: '700',
        color: Colors.primary,
    },
});
