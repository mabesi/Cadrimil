// Period Card component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Period } from '../types';
import { useData } from '../context/DataContext';
import { calcularDiarias, getValorDiaria } from '../utils/calculations';
import { DateHelpers } from '../utils/dateHelpers';
import { CustomButton } from './CustomButton';
import { Colors } from '../constants/colors';

interface PeriodCardProps {
    period: Period;
    onRemove: () => void;
}

export function PeriodCard({ period, onRemove }: PeriodCardProps) {
    const { cadrmilData } = useData();

    if (!cadrmilData) return null;

    const numDiarias = calcularDiarias(
        period.dataInicio,
        period.dataFim,
        period.contarUltimoDiaInteiro
    );
    const valorUnitario = getValorDiaria(period.grupo, period.localidade, cadrmilData);
    const custoPeriodo = numDiarias * valorUnitario * period.quantidadeMilitares;

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>
                    Grupo {period.grupo} ({period.quantidadeMilitares}x)
                </Text>
                <Text style={styles.subtitle}>
                    {cadrmilData.localidades[period.localidade]}
                </Text>
                <Text style={styles.dates}>
                    {DateHelpers.format(period.dataInicio, 'dd/MM/yyyy')} -{' '}
                    {DateHelpers.format(period.dataFim, 'dd/MM/yyyy')}
                    <Text style={styles.diarias}> ({numDiarias.toFixed(1)} Diárias)</Text>
                </Text>
                <Text style={styles.cost}>
                    Custo: R$ {custoPeriodo.toFixed(2).replace('.', ',')}
                </Text>
            </View>
            <CustomButton
                title="Remover"
                onPress={onRemove}
                variant="danger"
                style={styles.removeButton}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderLeftWidth: 4,
        borderLeftColor: Colors.periodBorder,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
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
        marginRight: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
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
        paddingVertical: 6,
        paddingHorizontal: 12,
        minWidth: 80,
        borderRadius: 4,
    },
});
