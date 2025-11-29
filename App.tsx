import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { DataProvider } from './src/context/DataContext';
import { MissionProvider } from './src/context/MissionContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Header } from './src/components/Header';
import { View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <SafeAreaProvider>
      <DataProvider>
        <MissionProvider>
          <View style={styles.container}>
            <NavigationContainer>
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
