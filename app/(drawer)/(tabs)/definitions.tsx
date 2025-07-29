import React, { useState, useCallback } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import Box from '@/components/Box';
import { LightStyles } from "../../../styles/style"
export default function DefinitionsScreen() {
  const [data, setData] = useState<{ key: string; value: any }[]>([]);
  const [displayDefinitions, setDisplayDefinitions] = useState<{parentKey: string; definition: string}[]>([]);
  const [wasSearchingInitially, setWasSearchingInitially] = useState(false);
  const router = useRouter();
  const styles = LightStyles;
  const loadData = async () => {
  try {
    await AsyncStorage.setItem('@current_tab_screen', 'definitions');

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
      setDisplayDefinitions([]);
      return;
    }

    const wordsList = JSON.parse(wordsListString);
    
    const keyValuePairs = await Promise.all(
      wordsList.map(async (word: string) => {
        const value = await AsyncStorage.getItem(word);
        return { key: word, value: value ? JSON.parse(value) : { definitions: [] } };
      })
    );

    // Flatten all definitions into a single array with parent key reference
    const allDefinitions = keyValuePairs.flatMap(item => 
      item.value.definitions?.map((definition: string) => ({
        parentKey: item.key,
        definition,
        parentWord: item.value.word || item.key // Include the word for reference
      })) || []
    );

    // If not searching or empty search term, return all definitions
    if (isSearching !== 'true' || !searchTerm?.trim()) {
      setData(keyValuePairs);
      setDisplayDefinitions(allDefinitions);
      return;
    }
    await AsyncStorage.setItem('@is_searching', 'false');

    // Split search terms by comma and clean them up
    const searchTerms = searchTerm
      .split(',')
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);

    // If no valid terms after splitting, return all definitions
    if (searchTerms.length === 0) {
      setDisplayDefinitions(allDefinitions);
      setData(keyValuePairs);
      return;
    }

    // Search for definitions matching ANY of the terms (OR logic)
    const filteredDefinitions = allDefinitions.filter(item => {
      const definitionLower = item.definition.toLowerCase();
      return searchTerms.some(term => definitionLower.includes(term));
    });

    // Optional: Sort by number of terms matched (definitions matching more terms first)
    const sortedDefinitions = filteredDefinitions.map(def => {
      const matchCount = searchTerms.filter(term => 
        def.definition.toLowerCase().includes(term)
      ).length;
      return { ...def, matchCount };
    }).sort((a, b) => b.matchCount - a.matchCount);

    setDisplayDefinitions(sortedDefinitions);
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

  const deleteDefinition = async (storageKey: string, value: string) => {
    try {
      const storedItem = await AsyncStorage.getItem(storageKey);

      if (!storedItem) return;

      const parsedItem = JSON.parse(storedItem);

      if (!Array.isArray(parsedItem.definitions)) return;

      parsedItem.definitions = parsedItem.definitions.filter((definition: string) => definition !== value);

      await AsyncStorage.setItem(storageKey, JSON.stringify(parsedItem));
      loadData(); // Refresh data after deletion

      const concepts = JSON.parse(await AsyncStorage.getItem('oCrEwZ')) || [];
      
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
      {displayDefinitions.map(({parentKey, definition}, index) => (
        <Box 
          // @ts-ignore
          key={`${parentKey}-${index}`}
          storageKey={parentKey} 
          title={definition} 
          description={parentKey}
          value={""} 
          onDelete={() => deleteDefinition(parentKey, definition)} 
        />
      ))}
    </ScrollView>
    </View>
  );
}

