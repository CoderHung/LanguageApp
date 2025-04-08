import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import Box from '@/components/Box';

export default function DefinitionsScreen() {
  const [data, setData] = useState<{ key: string; value: any }[]>([]);
  const [displayDefinitions, setDisplayDefinitions] = useState<{parentKey: string; definition: string}[]>([]);
  const router = useRouter();

  const loadData = async () => {
    try {
      await AsyncStorage.setItem('@current_tab_screen', 'definitions');

      // Check search state first
      const [isSearching, searchTerm] = await Promise.all([
        AsyncStorage.getItem('@is_searching'),
        AsyncStorage.getItem('@search_term')
      ]);

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
          definition
        })) || []
      );

      // If not searching or empty search term, return all definitions
      if (isSearching !== 'true' || !searchTerm?.trim()) {
        setData(keyValuePairs);
        setDisplayDefinitions(allDefinitions);
        return;
      }
      await AsyncStorage.setItem('@is_searching', 'false');

      // Implement simple contains search (case-insensitive)
      const searchTermLower = searchTerm.toLowerCase();
      const filteredDefinitions = allDefinitions.filter(item => 
        item.definition.toLowerCase().includes(searchTermLower)
      );

      setDisplayDefinitions(filteredDefinitions);
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
    <ScrollView contentContainerStyle={styles.container}>
      {displayDefinitions.map(({parentKey, definition}, index) => (
        <Box 
          key={`${parentKey}-${index}`}
          storageKey={parentKey} 
          title={definition} 
          description={parentKey}
          value={""} 
          onDelete={() => deleteDefinition(parentKey, definition)} 
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