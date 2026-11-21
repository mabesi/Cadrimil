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
 * Get the daily rate snapshot for a period, falling back to the current
 * table only for legacy periods saved before snapshots existed.
 */
export function getPeriodValorUnitario(period: Period, data: CadrimilData): number {
    return typeof period.valorUnitario === 'number'
        ? period.valorUnitario
        : getValorDiaria(period.grupo, period.localidade, data);
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
    data: CadrimilData,
    aedValue: number = data.aed.value
): number {
    let total = 0;
    let totalMilitares = 0;

    periods.forEach((period) => {
        const valorUnitario = getPeriodValorUnitario(period, data);
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
        total += aedValue * totalMilitares;
    }

    return total;
}

export interface IndividualPeriodCost {
    period: Period;
    numDiarias: number;
    valorUnitario: number;
    valorDiarias: number;
}

export interface IndividualMissionTotal {
    total: number;
    diariasTotal: number;
    aedTotal: number;
    periodos: IndividualPeriodCost[];
}

/**
 * Calculate the amount received by one specific military (the app user).
 * Only periods matching the user's group are considered, and the quantity
 * is always 1 because this is an individual view.
 */
export function calculateIndividualMissionTotal(
    periods: Period[],
    incluirAED: boolean,
    data: CadrimilData,
    aedValue: number = data.aed.value
): IndividualMissionTotal {
    const userPeriods = periods.filter(period => period.registrarEmMinhasMissoes);
    let diariasTotal = 0;

    const periodos = userPeriods.map(period => {
        const numDiarias = calcularDiarias(
            period.dataInicio,
            period.dataFim,
            period.contarUltimoDiaInteiro
        );
        const valorUnitario = getPeriodValorUnitario(period, data);
        const valorDiarias = numDiarias * valorUnitario;
        diariasTotal += valorDiarias;

        return {
            period,
            numDiarias,
            valorUnitario,
            valorDiarias,
        };
    });

    // AED is paid per military in each period, matching the total calculation.
    const aedTotal = incluirAED ? aedValue * userPeriods.length : 0;

    return {
        total: diariasTotal + aedTotal,
        diariasTotal,
        aedTotal,
        periodos,
    };
}
