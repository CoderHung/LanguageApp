import React, {  useState, useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';


export default function HiddenScreen() {
  const router = useRouter();
  const loadData = async () => {
    try {
      const hop = await AsyncStorage.getItem('@hop');
      if (hop !== null) {
        if (hop === 'concepts') {
          router.push(`/(drawer)/(tabs)/concepts`);
        }
        if (hop === 'definitions') {
          router.push(`/(drawer)/(tabs)/definitions`);
        }
        if (hop === 'examples') {
          router.push(`/(drawer)/(tabs)/examples`);
        }
        
      } else {
      router.push('/(drawer)/(tabs)');
    }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      
      loadData();
    }, [])
  );

 

  return (
    <View></View>
  );
}
