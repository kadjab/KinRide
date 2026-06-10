import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '../../lib/design';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: colors.ember,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 },
      headerStyle: { backgroundColor: colors.surface, borderBottomColor: colors.border, borderBottomWidth: 1 },
      headerTitleStyle: { color: colors.midnight, fontWeight: '600' },
    }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarLabel: 'Home', headerTitle: 'KinRide' }} />
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarLabel: 'Search', headerTitle: 'Find Rides' }} />
      <Tabs.Screen name="my-trips" options={{ title: 'My Trips', tabBarLabel: 'My Trips', headerTitle: 'Your Journeys' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarLabel: 'Messages', headerTitle: 'Chat' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarLabel: 'Profile', headerTitle: 'Your Profile' }} />
    </Tabs>
  );
}
