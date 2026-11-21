import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
    'Cálculo': undefined;
    'Missões': undefined;
    'Tabelas': undefined;
    'Decretos': undefined;
};

export type RootStackParamList = {
    Main: NavigatorScreenParams<MainTabParamList> | undefined;
    Ajuda: undefined;
};
