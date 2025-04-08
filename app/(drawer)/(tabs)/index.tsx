import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import Box from '@/components/Box';

export default function VocabularyScreen() {
  const [data, setData] = useState<{ key: string; value: any[] | string }[]>([]);

  // Levenshtein distance function for fuzzy search
  function levenshteinDistance(a: string | any[], b: string | any[]) {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) return bn;
    if (bn === 0) return an;
    const matrix = Array.from({ length: an + 1 }, (_, i) => [i, ...Array(bn).fill(0)]);
    for (let j = 0; j <= bn; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= an; i++) {
        for (let j = 1; j <= bn; j++) {
            if (a[i - 1] === b[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, // deletion
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j - 1] + 1 // substitution
                );
            }
        }
    }
    return matrix[an][bn];
  }

  const loadData = async () => {
    try {
      await AsyncStorage.setItem('@current_tab_screen', '');

      // Check search state first
      const [isSearching, searchTerm] = await Promise.all([
        AsyncStorage.getItem('@is_searching'),
        AsyncStorage.getItem('@search_term')
      ]);

      const wordsListString = await AsyncStorage.getItem("oCrEwZ"); // Get mainConcepts list
      if (!wordsListString) {
          console.warn("No words found in 'oCrEwZ'");
          setData([]);
          return;
      }
      
      const wordsList = JSON.parse(wordsListString); // Parse concepts array

      const keyValuePairs = await Promise.all(
          wordsList.map(async (word) => {
              const value = await AsyncStorage.getItem(word);
              return { key: word, value: value ? JSON.parse(value) : "No Data" };
          })
      );

      // If not searching or empty search term, return all items
      if (isSearching !== 'true' || !searchTerm?.trim()) {
        setData(keyValuePairs);
        return;
      }
      await AsyncStorage.setItem('@is_searching', 'false');

      // Implement search logic when in search mode
      const target = searchTerm.toLowerCase();
      const targetLength = target.length;

      const filteredAndSortedData = keyValuePairs
        .map(item => {
          // Remove the "-con" suffix for search comparison
          const conceptName = item.key.slice(0, -4).toLowerCase();
          const distance = levenshteinDistance(target, conceptName);
          const maxLength = Math.max(targetLength, conceptName.length);
          const similarityRatio = 1 - (distance / maxLength);
          
          return {
            ...item,
            distance,
            similarityRatio
          };
        })
        .filter(item => {
          return item.similarityRatio > 0.7 || item.distance <= 2;
        })
        .sort((a, b) => {
          if (a.similarityRatio !== b.similarityRatio) {
            return b.similarityRatio - a.similarityRatio;
          }
          return a.key.length - b.key.length;
        });

      setData(filteredAndSortedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useFocusEffect(
      useCallback(() => {
        loadData();
      }, [])
    );

  const deleteKey = async (storageKey: string) => {
    try {
        // Remove the item from AsyncStorage
        await AsyncStorage.removeItem(storageKey);

        // Update concepts array stored under 'oCrEwZ'
        const concepts = JSON.parse(await AsyncStorage.getItem('oCrEwZ')) || [];
        const updatedConcepts = concepts.filter((concept) => concept !== storageKey);
        await AsyncStorage.setItem('oCrEwZ', JSON.stringify(updatedConcepts));

        // Update state
        setData((prevData) => prevData.filter((item) => item.key !== storageKey)); 

        const words = JSON.parse(await AsyncStorage.getItem('aOlApM')) || [];
        let updatedWords = words.map(async (wordKey: string) => {
          let wordObj = JSON.parse(await AsyncStorage.getItem(wordKey));
          if (wordObj && wordObj.mainConcepts) {
              wordObj.mainConcepts = wordObj.mainConcepts.filter(concept => concept !== storageKey);
              // Save updated word object back to AsyncStorage
              await AsyncStorage.setItem(wordKey, JSON.stringify(wordObj));
          }
        });

        // Wait for all updates to finish
        await Promise.all(updatedWords);        

    } catch (error) {
        console.error("Error deleting item:", error);
    }
  };
  
  return(
  <ScrollView contentContainerStyle={styles.container}>
    {data.map(({ key, value }) => (
      <Box 
        key={key} 
        storageKey={key} 
        title={key.slice(0,-4)} 
        description={Array.isArray(value) ? value.join(', ') : value} 
        value={""} 
        onDelete={() => deleteKey(key)} 
        isSpecialRoute={true}
      />
    ))}
  </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});