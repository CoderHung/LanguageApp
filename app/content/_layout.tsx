import { Stack } from 'expo-router';

export default function contentLayout() {
  return (
    <Stack>
      <Stack.Screen name="[item]" options={{ 
        headerShown: true,
        headerBackVisible: true,
        title: "" // Or whatever title you want
      }} />
      <Stack.Screen name="add" options={{ 
        headerShown: true,
        headerBackVisible: true,
        title: "Add Item" // Or whatever title you want
      }} />
      <Stack.Screen name="(words)/[item]" options={{ 
        headerShown: true,
        headerBackVisible: true,
        title: "" // Or whatever title you want
      }} />
    </Stack>
  );
}