import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { DataProvider } from './src/context/DataContext';
import { MissionProvider, useMission } from './src/context/MissionContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { View, StyleSheet, Text, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { isLocalFileUrl, isMissionFileUrl, readMissionFile } from './src/utils/missionImport';

const prefix = Linking.createURL('/');

const linking: any = {
  prefixes: [prefix, 'cadrimil://'],
  config: {
    screens: {
      Main: {
        screens: {
          Cálculo: 'calculo',
          Missões: 'missoes',
          Tabelas: 'tabelas',
          Decretos: 'decretos',
        },
      },
      Ajuda: 'ajuda',
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url != null && !isLocalFileUrl(url)) {
      return url;
    }
    return null;
  },
  subscribe(listener: (url: string) => void) {
    const onReceiveURL = ({ url }: { url: string }) => {
      // Files are handled by DeepLinkHandler; navigation only receives routes.
      if (isLocalFileUrl(url)) {
        return;
      }
      listener(url);
    };
    const subscription = Linking.addEventListener('url', onReceiveURL);
    return () => {
      subscription.remove();
    };
  },
};

function DeepLinkHandler() {
  const { importMission } = useMission();
  const importMissionRef = React.useRef(importMission);

  React.useEffect(() => {
    importMissionRef.current = importMission;
  }, [importMission]);

  React.useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      if (!url || !isMissionFileUrl(url)) {
        return;
      }

      const imported = await readMissionFile(url);
      if (!imported.ok) {
        Alert.alert('Erro ao importar missão', imported.error);
        return;
      }

      await importMissionRef.current(imported.mission);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <MissionProvider>
          <DeepLinkHandler />
          <View style={styles.container}>
            <NavigationContainer linking={linking} fallback={<Text>Carregando...</Text>}>
              <AppNavigator />
            </NavigationContainer>
            <StatusBar style="light" />
          </View>
        </MissionProvider>
      </DataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
