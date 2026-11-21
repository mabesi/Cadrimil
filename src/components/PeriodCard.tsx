// Period Card component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Period } from '../types';
import { DateHelpers } from '../utils/dateHelpers';
import { calcularDiarias, getPeriodValorUnitario } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { Colors } from '../constants/colors';
import { CustomButton } from './CustomButton';
import { useData } from '../context/DataContext';

interface PeriodCardProps {
    period: Period;
    onRemove: () => void;
    onEdit?: () => void;
}

export function PeriodCard({ period, onRemove, onEdit }: PeriodCardProps) {
    const { cadrimilData } = useData();

    if (!cadrimilData) return null;

    const numDiarias = calcularDiarias(
        period.dataInicio,
        period.dataFim,
        period.contarUltimoDiaInteiro
    );
    const valorUnitario = getPeriodValorUnitario(period, cadrimilData);
    const custoPeriodo = numDiarias * valorUnitario * period.quantidadeMilitares;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>
                        {cadrimilData.grupos[period.grupo]} ({period.quantidadeMilitares})
                    </Text>
                    <View style={styles.actions}>
                        <CustomButton
                            title="🗑️"
                            onPress={onRemove}
                            variant="danger"
                            style={styles.actionButton}
                        />
                        {onEdit && (
                            <CustomButton
                                title="✏️"
                                onPress={onEdit}
                                variant="secondary"
                                style={styles.actionButton}
                            />
                        )}
                    </View>
                </View>
                <Text style={styles.subtitle}>
                    {cadrimilData.localidades[period.localidade]}
                </Text>
                <Text style={styles.dates}>
                    {DateHelpers.format(period.dataInicio, 'dd/MM/yyyy')} -{' '}
                    {DateHelpers.format(period.dataFim, 'dd/MM/yyyy')}
                    <Text style={styles.diarias}> ({numDiarias.toFixed(1)} Diárias)</Text>
                </Text>
                <Text style={styles.cost}>
                    Custo: R$ {formatCurrency(custoPeriodo)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderLeftWidth: 4,
        borderLeftColor: Colors.periodBorder,
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
        borderWidth: 1,
        borderColor: Colors.borderLight,
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        flex: 1,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 8,
    },
    actionButton: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        minWidth: 40,
        borderRadius: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    dates: {
        fontSize: 13,
        color: Colors.textLight,
        marginBottom: 6,
    },
    diarias: {
        fontWeight: '600',
        color: Colors.primary,
        marginLeft: 8,
    },
    cost: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.success,
        marginTop: 2,
    },
});
