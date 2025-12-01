// Period Card component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Period, CadrmilData } from '../types';
import { DateHelpers } from '../utils/dateHelpers';
import { calcularDiarias, getValorDiaria } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { Colors } from '../constants/colors';
import { CustomButton } from './CustomButton';

interface PeriodCardProps {
    period: Period;
    cadrmilData: CadrmilData;
    onRemove: () => void;
}

export const PeriodCard: React.FC<PeriodCardProps> = ({
    period,
    cadrmilData,
    onRemove,
}) => {
    const numDiarias = calcularDiarias(
        period.dataInicio,
        period.dataFim,
        period.contarUltimoDiaInteiro
    );
    const valorUnitario = getValorDiaria(
        period.grupo,
        period.localidade,
        cadrmilData
    );
    const custoPeriodo = numDiarias * valorUnitario * period.quantidadeMilitares;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>
                        {cadrmilData.grupos[period.grupo]} ({period.quantidadeMilitares})
                    </Text>
                    <CustomButton
                        title="🗑️"
                        onPress={onRemove}
                        variant="danger"
                        style={styles.removeButton}
                    />
                </View>
                <Text style={styles.subtitle}>
                    {cadrmilData.localidades[period.localidade]}
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
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderLeftWidth: 4,
        borderLeftColor: Colors.periodBorder,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
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
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        flex: 1,
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
    removeButton: {
        minWidth: 40,
        borderRadius: 4,
    },
});
