// Types for Cadrimil App

export interface Decreto {
    title: string;
    decree: string;
    date: string;
    link: string;
}

export interface AED {
    title: string;
    value: number;
}

export type Grupos = {
    [key: string]: string;
};

export type Localidades = {
    [key: string]: string;
};

export type Diarias = {
    [grupo: string]: {
        [localidade: string]: number;
    };
};

export interface CadrmilData {
    decretos: Decreto[];
    aed: AED;
    grupos: Grupos;
    localidades: Localidades;
    diarias: Diarias;
}

export interface Period {
    id: string;
    grupo: string;
    localidade: string;
    dataInicio: Date;
    dataFim: Date;
    quantidadeMilitares: number;
    contarUltimoDiaInteiro: boolean;
}

export interface Mission {
    id: string;
    nomeMissao: string;
    dataCriacao: string;
    periodos: Period[];
    incluirAED: boolean;
    valorTotal: number;
    decretosReferencia: Array<{ decree: string; date: string }>;
}

export interface MissionState {
    id: string | null;
    nomeMissao: string;
}
