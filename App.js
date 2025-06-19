import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import CarSelectionScreen from './src/screens/CarSelectionScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ControlScreen from './src/screens/ControlScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MonitoringScreen from './src/screens/MonitoringScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tab Navigator Component
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let emoji;
          
          if (route.name === 'Dashboard') {
            emoji = '🔋';
          } else if (route.name === 'Control') {
            emoji = '🎛️';
          } else if (route.name === 'Monitor') {
            emoji = '📊';
          } else if (route.name === 'Settings') {
            emoji = '⚙️';
          }

          return <Text style={{ fontSize: 24 }}>{emoji}</Text>;
        },
        tabBarActiveTintColor: '#00D4FF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
      />
      <Tab.Screen 
        name="Control" 
        component={ControlScreen}
      />
      <Tab.Screen 
        name="Monitor" 
        component={MonitoringScreen}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
      <Stack.Navigator 
        initialRouteName="CarSelection"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen 
          name="CarSelection" 
          component={CarSelectionScreen} 
        />
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
