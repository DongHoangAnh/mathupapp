import React from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import GameShowScreen from './screens/GameShowScreen';
import ProfileScreen from './screens/ProfileScreen';
import StatisticsScreen from './screens/StatisticsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons: Record<string, string> = {
  HomeTab: '🏠',
  GameShowTab: '🎮',
  StatsTab: '📊',
  ProfileTab: '👤',
};

/**
 * Main Tab Navigator
 */
function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: -4,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Trang Chủ',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{tabIcons.HomeTab}</Text>,
        }}
      />
      <Tab.Screen
        name="GameShowTab"
        component={GameShowScreen}
        initialParams={{
          userId: user?.id,
          displayName: user?.user_metadata?.full_name || 'Player',
          grade: user?.user_metadata?.grade,
        }}
        options={{
          tabBarLabel: 'GameShow',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{tabIcons.GameShowTab}</Text>,
        }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatisticsScreen}
        options={{
          tabBarLabel: 'Thống Kê',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{tabIcons.StatsTab}</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Hồ Sơ',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>{tabIcons.ProfileTab}</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {!user ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            animationEnabled: false,
          }}
        />
      ) : (
        <Stack.Screen
          name="MainApp"
          component={MainTabs}
          options={{
            animationEnabled: false,
          }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
