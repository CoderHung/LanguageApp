import React, { useState, useCallback } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import Box from '@/components/Box';
import { LightStyles } from "../../../styles/style"
export default function ExamplesScreen() {
  const [data, setData] = useState<{ key: string; value: any }[]>([]);
  const [displayExamples, setDisplayExamples] = useState<{parentKey: string; example: string}[]>([]);
  const [wasSearchingInitially, setWasSearchingInitially] = useState(false);
  const router = useRouter();
  const styles = LightStyles;
  const loadData = async () => {
  try {
    await AsyncStorage.setItem('@current_tab_screen', 'examples');

    // Check search state first
    const [isSearching, searchTerm] = await Promise.all([
      AsyncStorage.getItem('@is_searching'),
      AsyncStorage.getItem('@search_term')
    ]);
    setWasSearchingInitially(isSearching === 'true');
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
        example,
        parentWord: item.value.word || item.key // Include parent word for context
      }))
    );

    // If not searching or empty search term, return all examples
    if (isSearching !== 'true' || !searchTerm?.trim()) {
      setData(keyValuePairs);
      setDisplayExamples(allExamples);
      return;
    }
    await AsyncStorage.setItem('@is_searching', 'false');

    // Split search terms by comma and clean them up
    const searchTerms = searchTerm
      .split(',')
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);

    // If no valid terms after splitting, return all examples
    if (searchTerms.length === 0) {
      setDisplayExamples(allExamples);
      setData(keyValuePairs);
      return;
    }

    // Search for examples matching ANY of the terms (OR logic)
    const filteredExamples = allExamples.filter(item => {
      const exampleLower = item.example.toLowerCase();
      return searchTerms.some(term => exampleLower.includes(term));
    });

    // Sort by relevance (number of terms matched, then by example length)
    const sortedExamples = filteredExamples
      .map(example => ({
        ...example,
        matchCount: searchTerms.filter(term => 
          example.example.toLowerCase().includes(term)
        ).length
      }))
      .sort((a, b) => {
        // First by number of terms matched (descending)
        if (a.matchCount !== b.matchCount) {
          return b.matchCount - a.matchCount;
        }
        // Then by example length (shorter examples first)
        return a.example.length - b.example.length;
      });

    setDisplayExamples(sortedExamples);
    setData(keyValuePairs); // Keep full data for other operations
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
    <View style={{ flex: 1 }}>
            {wasSearchingInitially && (
              <View style={{ position: 'relative', top: 1, zIndex: 1 }}>
                <Button title="Go Back" onPress={() => router.push('/(drawer)/(tabs)/hidden')} />
              </View>
            )}
    <ScrollView contentContainerStyle={styles.container}>
      {displayExamples.map(({parentKey, example}, index) => (
        <Box 
          storageKey={parentKey} 
          title={example} 
          description={parentKey}
          value={""} 
          onDelete={() => deleteExamples(parentKey, example)} 
          // @ts-ignore
          key={`${parentKey}-${index}`}
        />
      ))}
    </ScrollView>
  </View>
  );
}
