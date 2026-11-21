// Reading, validating and normalizing mission files (.cmil / .json).
import * as FileSystem from 'expo-file-system/legacy';
import { Mission } from '../types';
import { DateHelpers } from './dateHelpers';
import { createId } from './id';

export type MissionImportResult =
    | { ok: true; mission: Mission }
    | { ok: false; error: string };

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNonEmptyString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}

function toNonNegativeNumber(value: unknown): number | null {
    const parsed = typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : value;

    if (typeof parsed !== 'number' || !Number.isFinite(parsed) || parsed < 0) {
        return null;
    }

    return parsed;
}

function toPositiveInteger(value: unknown): number | null {
    const parsed = typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : value;

    if (typeof parsed !== 'number' || !Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}

function toDate(value: unknown): Date | null {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
    }

    if (typeof value !== 'string' || value.trim() === '') return null;

    const parsed = DateHelpers.parseISO(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function invalid(error: string): MissionImportResult {
    return { ok: false, error };
}

/**
 * Validates and normalizes a decoded mission object. Legacy fields are kept
 * so the mission context can apply the same migrations used by saved missions.
 */
export function validateMissionObject(value: unknown): MissionImportResult {
    if (!isRecord(value)) {
        return invalid('O arquivo não contém uma missão válida.');
    }

    if (!Array.isArray(value.periodos) || value.periodos.length === 0) {
        return invalid('O arquivo não contém nenhum período de missão.');
    }

    const usedIds = new Set<string>();
    const periodos: UnknownRecord[] = [];

    for (let index = 0; index < value.periodos.length; index++) {
        const rawPeriod = value.periodos[index];
        const label = `Período ${index + 1}`;

        if (!isRecord(rawPeriod)) {
            return invalid(`${label}: formato inválido.`);
        }

        const grupo = toNonEmptyString(rawPeriod.grupo);
        const localidade = toNonEmptyString(rawPeriod.localidade);
        if (!grupo || !localidade) {
            return invalid(`${label}: grupo ou localidade ausente.`);
        }

        const dataInicio = toDate(rawPeriod.dataInicio);
        const dataFim = toDate(rawPeriod.dataFim);
        if (!dataInicio || !dataFim) {
            return invalid(`${label}: datas inválidas.`);
        }

        if (DateHelpers.differenceInDays(dataFim, dataInicio) < 0) {
            return invalid(`${label}: a data final é anterior à data inicial.`);
        }

        const quantidadeMilitares = toPositiveInteger(rawPeriod.quantidadeMilitares);
        if (quantidadeMilitares === null) {
            return invalid(`${label}: quantidade de militares inválida.`);
        }

        let id = toNonEmptyString(rawPeriod.id) ?? createId();
        while (usedIds.has(id)) {
            id = createId();
        }
        usedIds.add(id);

        const period: UnknownRecord = {
            ...rawPeriod,
            id,
            grupo,
            localidade,
            dataInicio,
            dataFim,
            quantidadeMilitares,
            contarUltimoDiaInteiro: rawPeriod.contarUltimoDiaInteiro === true,
        };

        const valorUnitario = toNonNegativeNumber(rawPeriod.valorUnitario);
        if (valorUnitario !== null) {
            period.valorUnitario = valorUnitario;
        } else {
            // The context fills legacy periods with the current table rate.
            delete period.valorUnitario;
        }

        if (typeof rawPeriod.registrarEmMinhasMissoes !== 'boolean') {
            // Keep it absent so the legacy mission-level flag can be applied.
            delete period.registrarEmMinhasMissoes;
        }

        periodos.push(period);
    }

    const dataCriacao = toDate(value.dataCriacao);
    const aedValue = toNonNegativeNumber(value.aedValue);
    const mission: UnknownRecord = {
        ...value,
        nomeMissao:
            toNonEmptyString(value.nomeMissao) ?? 'Missão Importada',
        dataCriacao: dataCriacao
            ? dataCriacao.toISOString()
            : new Date().toISOString(),
        periodos,
        incluirAED: value.incluirAED === true,
    };

    if (aedValue !== null) {
        mission.aedValue = aedValue;
    } else {
        delete mission.aedValue;
    }

    return { ok: true, mission: mission as unknown as Mission };
}

export function parseMissionFileContent(content: string): MissionImportResult {
    const normalizedContent = content.replace(/^\uFEFF/, '');

    let parsed: unknown;
    try {
        parsed = JSON.parse(normalizedContent);
    } catch (error) {
        console.error('Invalid mission file JSON:', error);
        return invalid('O arquivo não contém um JSON válido.');
    }

    return validateMissionObject(parsed);
}

/**
 * Reads a mission from any file URI. content:// URIs are copied to the app
 * cache first and removed afterwards.
 */
export async function readMissionFile(uri: string): Promise<MissionImportResult> {
    let fileUri = uri;
    let temporaryFile: string | null = null;

    try {
        if (uri.startsWith('content://')) {
            if (!FileSystem.cacheDirectory) {
                return invalid('Não foi possível acessar o armazenamento temporário.');
            }

            temporaryFile = `${FileSystem.cacheDirectory}mission_import_${createId()}.cmil`;
            await FileSystem.copyAsync({ from: uri, to: temporaryFile });
            fileUri = temporaryFile;
        }

        const content = await FileSystem.readAsStringAsync(fileUri);
        return parseMissionFileContent(content);
    } catch (error) {
        console.error('Error reading mission file:', error);
        return invalid('Não foi possível ler o arquivo selecionado.');
    } finally {
        if (temporaryFile) {
            try {
                await FileSystem.deleteAsync(temporaryFile, { idempotent: true });
            } catch (error) {
                console.warn('Error removing temporary mission file:', error);
            }
        }
    }
}

export function isLocalFileUrl(url: string): boolean {
    return url.startsWith('file://') || url.startsWith('content://');
}

/**
 * file:// URLs must point to a .cmil file. content:// URLs are accepted
 * because Android providers often do not expose the original file name.
 */
export function isMissionFileUrl(url: string): boolean {
    const path = url.split(/[?#]/)[0];

    if (path.startsWith('file://')) {
        return /\.cmil$/i.test(path);
    }

    return path.startsWith('content://');
}
