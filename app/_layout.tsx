import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(content)" options={{ 
        headerShown: false,
        headerBackVisible: true,
        title: "" // Or whatever title you want
      }} />
      <Stack.Screen name="(drawer)" options={{ 
        headerShown: false,
        headerBackVisible: true,
        title: "" // Or whatever title you want
      }} />
      <Stack.Screen name="search" options={{ 
        headerShown: false,
        headerBackVisible: true,
        title: "" // Or whatever title you want
      }} />
    </Stack>
  );
}
