import { Stack } from 'expo-router';

export default function searchLayout() {
  return (
    <Stack>
      <Stack.Screen name="[search]" options ={{
        headerShown : true,
        title : "search"
      }}/>
      <Stack.Screen name="(words)/[search]" options ={{
        headerShown : true,
        title : "search"
      }}/>
    </Stack>
  );
}