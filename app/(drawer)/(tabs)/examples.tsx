import React, {  useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import Box from '@/components/Box';

export default function ExamplesScreen() {
  const [data, setData] = useState<{ key: string; value: any }[]>([]);

  const loadData = async () => {
    try {
        const wordsListString = await AsyncStorage.getItem("aOlApM"); // Get words list
        if (!wordsListString) {
            console.warn("No words found in 'aOlApM'");
            setData([]);
            return;
        }

        const wordsList = JSON.parse(wordsListString); // Parse words array

        const keyValuePairs = await Promise.all(
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

  const deleteExamples = async (storageKey: string, value : string) => {
    try {
      const storedItem = await AsyncStorage.getItem(storageKey);

      if (!storedItem) return; // Exit if no data exists for this key

        // Parse the JSON object
      const parsedItem = JSON.parse(storedItem);

        // Ensure 'examples' exists and is an array
      if (!Array.isArray(parsedItem.examples)) return;

        // Filter out the specific example
      parsedItem.examples = parsedItem.examples.filter((example: string) => example !== value);

        // Save the updated object back to AsyncStorage
      await AsyncStorage.setItem(storageKey, JSON.stringify(parsedItem));
      // Update state
      loadData();

    } catch (error) {
        console.error("Error deleting item:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {data.map(({ key, value }) => (
        value.examples.map((example: string, index: any) => ( // Map over definitions array
          <Box 
            key={`${key}-${index}`} // Unique key for each Box
            storageKey={key} 
            title={example} 
            description={key} // Display each definition separately
            value={""} 
            onDelete={() => deleteExamples(key, example)} 
          />
        ))
      ))}
    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});