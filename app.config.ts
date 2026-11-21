import { ExpoConfig, ConfigContext } from 'expo/config';

interface AdMobConfig {
    androidAppId?: string;
    iosAppId?: string;
    adUnitId?: string;
    androidAdUnitId?: string;
    iosAdUnitId?: string;
}

const TEST_ADMOB_IDS = {
    androidAppId: 'ca-app-pub-3940256099942544~3347511713',
    iosAppId: 'ca-app-pub-3940256099942544~1458002511',
    adUnitId: 'ca-app-pub-3940256099942544/5224354917',
};

const APP_ID_PATTERN = /^ca-app-pub-\d{16}~\d{10}$/;
const AD_UNIT_ID_PATTERN = /^ca-app-pub-\d{16}\/\d{10}$/;

function readEnv(name: string): string | undefined {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
}

function loadLocalAdConfig(): AdMobConfig {
    try {
        return require('./adConfig') as AdMobConfig;
    } catch (error) {
        const code = (error as { code?: string }).code;

        if (code !== 'MODULE_NOT_FOUND') {
            throw new Error(`Erro ao carregar adConfig.js: ${String(error)}`);
        }
    }

    try {
        return require('./adConfig.example') as AdMobConfig;
    } catch (error) {
        throw new Error(
            `Não foi possível carregar adConfig.js nem adConfig.example.js: ${String(error)}`
        );
    }
}

const localAdConfig = loadLocalAdConfig();

const androidAppId =
    readEnv('ADMOB_ANDROID_APP_ID') ?? localAdConfig.androidAppId ?? TEST_ADMOB_IDS.androidAppId;
const iosAppId =
    readEnv('ADMOB_IOS_APP_ID') ?? localAdConfig.iosAppId ?? TEST_ADMOB_IDS.iosAppId;
const androidAdUnitId =
    readEnv('ADMOB_ANDROID_REWARDED_UNIT_ID') ??
    localAdConfig.androidAdUnitId ??
    localAdConfig.adUnitId ??
    TEST_ADMOB_IDS.adUnitId;
const iosAdUnitId =
    readEnv('ADMOB_IOS_REWARDED_UNIT_ID') ??
    localAdConfig.iosAdUnitId ??
    localAdConfig.adUnitId ??
    TEST_ADMOB_IDS.adUnitId;

function validateProductionAdMobConfig(): void {
    if (process.env.EAS_BUILD_PROFILE !== 'production') {
        return;
    }

    const buildPlatform = process.env.EAS_BUILD_PLATFORM;
    const validateAndroid = buildPlatform !== 'ios';
    const validateIos = buildPlatform !== 'android';
    const ids: string[] = [];
    let invalidFormat = false;

    if (validateAndroid) {
        ids.push(androidAppId, androidAdUnitId);
        invalidFormat ||= !APP_ID_PATTERN.test(androidAppId);
        invalidFormat ||= !AD_UNIT_ID_PATTERN.test(androidAdUnitId);
    }

    if (validateIos) {
        ids.push(iosAppId, iosAdUnitId);
        invalidFormat ||= !APP_ID_PATTERN.test(iosAppId);
        invalidFormat ||= !AD_UNIT_ID_PATTERN.test(iosAdUnitId);
    }

    const usesTestIds = ids.some(id => Object.values(TEST_ADMOB_IDS).includes(id));

    if (usesTestIds || invalidFormat) {
        throw new Error(
            'AdMob: o build de produção não pode usar IDs de teste/exemplo. ' +
            'Configure ADMOB_ANDROID_APP_ID, ADMOB_IOS_APP_ID, ' +
            'ADMOB_ANDROID_REWARDED_UNIT_ID e ADMOB_IOS_REWARDED_UNIT_ID ' +
            'no ambiente "production" do EAS (eas env:set) ou no arquivo adConfig.js.'
        );
    }
}

validateProductionAdMobConfig();

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Cadrimil',
    slug: 'cadrimil',
    version: '1.0.2',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.mabesi.cadrimil',
    },
    scheme: 'cadrimil',
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#71FA55',
        },
        package: 'com.mabesi.cadrimil',
        versionCode: 2,
        predictiveBackGestureEnabled: false,
        intentFilters: [
            {
                action: 'VIEW',
                data: [
                    {
                        scheme: 'file',
                        mimeType: '*/*',
                        pathPattern: '.*\\.cmil',
                    },
                    {
                        scheme: 'content',
                        mimeType: '*/*',
                        pathPattern: '.*\\.cmil',
                    },
                ],
                category: ['BROWSABLE', 'DEFAULT'],
            },
        ],
    },
    plugins: [
        [
            'expo-splash-screen',
            {
                image: './assets/splash-icon.png',
                resizeMode: 'contain',
                backgroundColor: '#71FA55',
            },
        ],
        [
            'react-native-google-mobile-ads',
            {
                androidAppId,
                iosAppId,
            },
        ],
    ],
    extra: {
        eas: {
            projectId: '80c6f68f-a84d-4cc4-8fe8-211ae8f0fb25',
        },
        adMob: {
            androidRewardedUnitId: androidAdUnitId,
            iosRewardedUnitId: iosAdUnitId,
        },
    },
});
