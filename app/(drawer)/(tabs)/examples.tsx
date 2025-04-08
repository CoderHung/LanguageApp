import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import Box from '@/components/Box';

export default function ExamplesScreen() {
  const [data, setData] = useState<{ key: string; value: any }[]>([]);
  const [displayExamples, setDisplayExamples] = useState<{parentKey: string; example: string}[]>([]);
  const router = useRouter();

  const loadData = async () => {
    try {
      await AsyncStorage.setItem('@current_tab_screen', 'examples');

      // Check search state first
      const [isSearching, searchTerm] = await Promise.all([
        AsyncStorage.getItem('@is_searching'),
        AsyncStorage.getItem('@search_term')
      ]);

      const wordsListString = await AsyncStorage.getItem("aOlApM");
      if (!wordsListString) {
        console.warn("No words found in 'aOlApM'");
        setData([]);
        setDisplayExamples([]);
        return;
      }

      const wordsList = JSON.parse(wordsListString);
      
      const keyValuePairs = await Promise.all(
        wordsList.map(async (word: string) => {
          const value = await AsyncStorage.getItem(word);
          return { key: word, value: value ? JSON.parse(value) : { examples: [] } };
        })
      );

      // Flatten all examples into a single array with parent key reference
      const allExamples = keyValuePairs.flatMap(item => 
        item.value.examples.map((example: string) => ({
          parentKey: item.key,
          example
        }))
      );

      // If not searching or empty search term, return all examples
      if (isSearching !== 'true' || !searchTerm?.trim()) {
        setData(keyValuePairs);
        setDisplayExamples(allExamples);
        return;
      }
      await AsyncStorage.setItem('@is_searching', 'false');

      // Implement simple contains search (case-insensitive)
      const searchTermLower = searchTerm.toLowerCase();
      const filteredExamples = allExamples.filter(item => 
        item.example.toLowerCase().includes(searchTermLower)
      );

      setDisplayExamples(filteredExamples);
      setData(keyValuePairs); // Still keep the full data for deletion handling
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const deleteExamples = async (storageKey: string, value: string) => {
    try {
      const storedItem = await AsyncStorage.getItem(storageKey);

      if (!storedItem) return;

      const parsedItem = JSON.parse(storedItem);

      if (!Array.isArray(parsedItem.examples)) return;

      parsedItem.examples = parsedItem.examples.filter((example: string) => example !== value);

      await AsyncStorage.setItem(storageKey, JSON.stringify(parsedItem));
      loadData(); // Refresh data after deletion

    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {displayExamples.map(({parentKey, example}, index) => (
        <Box 
          key={`${parentKey}-${index}`}
          storageKey={parentKey} 
          title={example} 
          description={parentKey}
          value={""} 
          onDelete={() => deleteExamples(parentKey, example)} 
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
});