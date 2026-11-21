// Runtime validation for data received from the Cadrimil API
import { CadrimilData, Decreto } from '../types';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isStringMap(value: unknown): value is Record<string, string> {
    if (!isRecord(value)) return false;

    const entries = Object.values(value);
    return entries.length > 0 && entries.every(isNonEmptyString);
}

function isNumberMap(value: unknown): value is Record<string, number> {
    if (!isRecord(value)) return false;

    const entries = Object.values(value);
    return entries.length > 0 && entries.every(isNonNegativeNumber);
}

function isDecreto(value: unknown): value is Decreto {
    if (!isRecord(value)) return false;

    return (
        isNonEmptyString(value.title) &&
        isNonEmptyString(value.decree) &&
        isNonEmptyString(value.date) &&
        isNonEmptyString(value.link)
    );
}

function isCadrimilMeta(value: unknown): boolean {
    if (!isRecord(value)) return false;

    if (
        typeof value.schemaVersion !== 'number' ||
        !Number.isInteger(value.schemaVersion) ||
        value.schemaVersion < 1
    ) {
        return false;
    }

    if (
        !isNonEmptyString(value.updatedAt) ||
        Number.isNaN(new Date(value.updatedAt).getTime())
    ) {
        return false;
    }

    if (value.validFrom !== undefined) {
        if (
            !isNonEmptyString(value.validFrom) ||
            Number.isNaN(new Date(value.validFrom).getTime())
        ) {
            return false;
        }
    }

    if (value.source !== undefined && !isNonEmptyString(value.source)) {
        return false;
    }

    return true;
}

function isDiarias(
    value: unknown,
    grupos: Record<string, string>,
    localidades: Record<string, string>
): boolean {
    if (!isRecord(value)) return false;

    const grupoKeys = Object.keys(value);
    if (grupoKeys.length === 0) return false;

    return grupoKeys.every((grupo) => {
        const valores = value[grupo];

        if (!Object.prototype.hasOwnProperty.call(grupos, grupo)) return false;
        if (!isNumberMap(valores)) return false;

        return Object.keys(valores).every((localidade) =>
            Object.prototype.hasOwnProperty.call(localidades, localidade)
        );
    });
}

/**
 * Validates the structure of the JSON returned by the Cadrimil API.
 * Returns true only when all fields required by the app are present and valid.
 */
export function isCadrimilData(value: unknown): value is CadrimilData {
    if (!isRecord(value)) return false;

    if (!isCadrimilMeta(value.meta)) {
        return false;
    }

    if (!Array.isArray(value.decretos) || !value.decretos.every(isDecreto)) {
        return false;
    }

    const aed = value.aed;
    if (!isRecord(aed)) return false;
    if (!isNonEmptyString(aed.title) || !isNonNegativeNumber(aed.value)) {
        return false;
    }

    const grupos = value.grupos;
    const localidades = value.localidades;
    if (!isStringMap(grupos) || !isStringMap(localidades)) return false;

    return isDiarias(value.diarias, grupos, localidades);
}
