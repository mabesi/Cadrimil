// App Navigator with Bottom Tabs and Stack
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalculatorScreen } from '../screens/CalculatorScreen';
import { MissionsScreen } from '../screens/MissionsScreen';
import { TablesScreen } from '../screens/TablesScreen';
import { DecreesScreen } from '../screens/DecreesScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { Header } from '../components/Header';
import { Colors } from '../constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainScreen() {
    return (
        <View style={styles.main}>
            <Header />
            <TabNavigator />
        </View>
    );
}

function TabNavigator() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textMuted,
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopWidth: 1,
                    borderTopColor: Colors.border,
                    paddingBottom: insets.bottom + 5,
                    paddingTop: 5,
                    height: 60 + insets.bottom,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Cálculo"
                component={CalculatorScreen}
                options={{
                    tabBarLabel: 'Cálculo',
                    tabBarAccessibilityLabel: 'Aba de cálculo de diárias',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="calculator" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Missões"
                component={MissionsScreen}
                options={{
                    tabBarLabel: 'Missões',
                    tabBarAccessibilityLabel: 'Aba de missões salvas',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="folder" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Tabelas"
                component={TablesScreen}
                options={{
                    tabBarLabel: 'Tabelas',
                    tabBarAccessibilityLabel: 'Aba de tabelas de valores',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="table" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Decretos"
                component={DecreesScreen}
                options={{
                    tabBarLabel: 'Decretos',
                    tabBarAccessibilityLabel: 'Aba de decretos e legislação',
                    tabBarIcon: ({ color, size }) => (
                        <TabIcon name="book" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export function AppNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen
                name="Ajuda"
                component={HelpScreen}
                options={{
                    headerShown: false,
                    presentation: 'card'
                }}
            />
        </Stack.Navigator>
    );
}

// Simple icon component using text emojis
function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
    const icons: { [key: string]: string } = {
        calculator: '🧮',
        folder: '📁',
        table: '📊',
        book: '📖',
    };

    return (
        <Text style={{ fontSize: size, color }}>
            {icons[name] || '•'}
        </Text>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
});