// Calculation utilities for Cadrimil
import { CadrimilData, Period } from '../types';
import { DateHelpers } from './dateHelpers';

/**
 * Get the valor da diária for a specific grupo and localidade
 */
export function getValorDiaria(
    grupo: string,
    localidade: string,
    data: CadrimilData
): number {
    if (data.diarias[grupo] && data.diarias[grupo][localidade]) {
        return data.diarias[grupo][localidade];
    }
    return 0;
}

/**
 * Calculate the number of diárias for a period
 */
export function calcularDiarias(
    inicio: Date,
    fim: Date,
    contarInteiro: boolean
): number {
    const totalDays = DateHelpers.differenceInDays(fim, inicio) + 1;
    if (totalDays <= 0) return 0;

    const ultimoDia = contarInteiro ? 1.0 : 0.5;
    const diasCompletos = totalDays - 1;
    return diasCompletos + ultimoDia;
}

/**
 * Calculate total with full data context
 */
export function calculateTotal(
    periods: Period[],
    incluirAED: boolean,
    data: CadrimilData
): number {
    let total = 0;
    let totalMilitares = 0;

    periods.forEach((period) => {
        const valorUnitario = getValorDiaria(period.grupo, period.localidade, data);
        const numDiarias = calcularDiarias(
            period.dataInicio,
            period.dataFim,
            period.contarUltimoDiaInteiro
        );
        const custoPeriodo = numDiarias * valorUnitario * period.quantidadeMilitares;
        total += custoPeriodo;
        totalMilitares += period.quantidadeMilitares;
    });

    if (incluirAED) {
        total += data.aed.value * totalMilitares;
    }

    return total;
}
