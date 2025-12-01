import { ExpoConfig, ConfigContext } from 'expo/config';
const adConfig = require('./adConfig');

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Cadrimil',
    slug: 'cadrimil',
    version: '1.0.0',
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
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#003366',
        },
        package: 'com.mabesi.cadrimil',
        edgeToEdgeEnabled: true,
        predictiveBackGestureEnabled: false,
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
