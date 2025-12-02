import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { DataProvider } from './src/context/DataContext';
import { MissionProvider, useMission } from './src/context/MissionContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Header } from './src/components/Header';
import { View, StyleSheet, Text } from 'react-native';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';

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
    if (url != null) {
      return url;
    }
    return null;
  },
  subscribe(listener: (url: string) => void) {
    const onReceiveURL = ({ url }: { url: string }) => listener(url);
    const subscription = Linking.addEventListener('url', onReceiveURL);
    return () => {
      subscription.remove();
    };
  },
};

export default function App() {
  const { loadMissionFromObject } = useMission();

  React.useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      if (url && (url.endsWith('.cmil') || url.startsWith('content://') || url.startsWith('file://'))) {
        try {
          const content = await FileSystem.readAsStringAsync(url);
          const missionData = JSON.parse(content);
          loadMissionFromObject(missionData);
        } catch (error) {
          console.error('Error reading file:', error);
        }
      }
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
  }, [loadMissionFromObject]);

  return (
    <SafeAreaProvider>
      <DataProvider>
        <MissionProvider>
          <View style={styles.container}>
            <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
              <View style={styles.content}>
                <Header />
                <AppNavigator />
              </View>
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
  content: {
    flex: 1,
  },
});
