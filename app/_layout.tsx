import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden'); 
     
    }
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(drawer)" options={{ 
        headerShown: false,
        headerBackVisible: true,
        title: ""
      }} />
      <Stack.Screen name="content" options={{ 
        headerShown: false,
        headerBackVisible: true,
        title: ""
      }} />
    </Stack>
  );
}
