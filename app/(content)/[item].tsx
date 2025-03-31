import React, {  useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import Box from '@/components/Box';
import { useRoute } from '@react-navigation/native';

export default function ItemsScreen() {
  const [data, setData] = useState<{ key: string; value: any }[]>([]);
  const route = useRoute();
  // @ts-ignore
  const key = route.params.item;  
  const loadData = async () => {
    try {
        let wordsList = await AsyncStorage.getItem(key); // Get words list of concept
        if (!wordsList) {
            console.warn("No words found");
            setData([]);
            return;
        }
        wordsList = JSON.parse(wordsList);
        const keyValuePairs = await Promise.all(
            // @ts-ignore
            wordsList.map(async (word: string) => {
                const value = await AsyncStorage.getItem(word);
                return { key: word, value: value ? JSON.parse(value) : "No Data" };
            })
        );

        setData(keyValuePairs);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const deleteKey = async (storageKey: string, value : string) => {
    try {
      // Remove the item from AsyncStorage
      await AsyncStorage.removeItem(storageKey);

      // Update words array stored under 'aOlApM'
      const words = JSON.parse(await AsyncStorage.getItem('aOlApM')) || [];
      const updatedWords = words.filter((word) => word !== storageKey);
      await AsyncStorage.setItem('aOlApM', JSON.stringify(updatedWords));

      // Update state
      setData((prevData) => prevData.filter((item) => item.key !== storageKey)); 

      const concepts = JSON.parse(await AsyncStorage.getItem('oCrEwZ')) || [];
      
      // Iterate through concepts, check if storageKey exists in their word arrays, and remove it
      let updatedConcepts = concepts.map(async (conceptKey: string) => {
        let conceptArray = JSON.parse(await AsyncStorage.getItem(conceptKey)) || [];

        if (conceptArray.includes(storageKey)) {
            // Remove the word from the concept's array
            const updatedConceptArray = conceptArray.filter(word => word !== storageKey);

            // Save updated array back to AsyncStorage
            await AsyncStorage.setItem(conceptKey, JSON.stringify(updatedConceptArray));
        }
      });

      // Wait for all updates to complete
      await Promise.all(updatedConcepts);
    } catch (error) {
        console.error("Error deleting item:", error);
    } 
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {data.map(({ key, value }) => (
        <Box key={key} storageKey={key} title={key} description={value.examples[0]} value={""} onDelete={() => deleteKey(key, key)} />
      ))}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});