import { ExpoConfig, ConfigContext } from 'expo/config';
const adConfig = require('./adConfig');

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Cadrimil',
    slug: 'cadrimil',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#003366',
    },
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.mabesi.cadrimil',
    },
    scheme: 'cadrimil',
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#003366',
        },
        package: 'com.mabesi.cadrimil',
        versionCode: 2,
        edgeToEdgeEnabled: true,
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
            'react-native-google-mobile-ads',
            {
                androidAppId: adConfig.androidAppId,
                iosAppId: adConfig.iosAppId,
            },
        ],
    ],
    web: {
        favicon: './assets/favicon.png',
    },
    extra: {
        eas: {
            projectId: '80c6f68f-a84d-4cc4-8fe8-211ae8f0fb25',
        },
        adUnitId: adConfig.adUnitId,
    },
});
