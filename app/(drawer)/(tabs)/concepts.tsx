import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Box from '@/components/Box';
import { useFocusEffect, useRouter } from 'expo-router';

export default function VocabularyScreen() {
  const [data, setData] = useState<{ key: string; value: any }[]>([]);
  const router = useRouter();
  // Levenshtein distance function from your search implementation
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

      await AsyncStorage.setItem('@current_tab_screen', 'concepts');

      // Check search state first
      const [isSearching, searchTerm] = await Promise.all([
        AsyncStorage.getItem('@is_searching'),
        AsyncStorage.getItem('@search_term')
      ]);

      const wordsListString = await AsyncStorage.getItem("aOlApM");
      if (!wordsListString) {
        console.warn("No words found in 'aOlApM'");
        setData([]);
        return;
      }

      const wordsList = JSON.parse(wordsListString);
      
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
          const word = item.key.toLowerCase();
          const distance = levenshteinDistance(target, word);
          const maxLength = Math.max(targetLength, word.length);
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

  // Rest of your component remains the same
  const deleteKey = async (storageKey: string, value: string) => {
    try {
      await AsyncStorage.removeItem(storageKey);
      const words = JSON.parse(await AsyncStorage.getItem('aOlApM')) || [];
      const updatedWords = words.filter((word) => word !== storageKey);
      await AsyncStorage.setItem('aOlApM', JSON.stringify(updatedWords));
      setData((prevData) => prevData.filter((item) => item.key !== storageKey)); 

      const concepts = JSON.parse(await AsyncStorage.getItem('oCrEwZ')) || [];
      let updatedConcepts = concepts.map(async (conceptKey: string) => {
        let conceptArray = JSON.parse(await AsyncStorage.getItem(conceptKey)) || [];
        if (conceptArray.includes(storageKey)) {
          const updatedConceptArray = conceptArray.filter(word => word !== storageKey);
          await AsyncStorage.setItem(conceptKey, JSON.stringify(updatedConceptArray));
        }
      });
      await Promise.all(updatedConcepts);
    } catch (error) {
      console.error("Error deleting item:", error);
    } 
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {data.map(({ key, value }) => (
        <Box 
          key={key} 
          storageKey={key} 
          title={key} 
          description={value.examples[0]} 
          value={""} 
          onDelete={() => deleteKey(key, key)} 
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