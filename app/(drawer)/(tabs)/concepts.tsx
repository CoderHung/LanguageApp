import React, { useState, useCallback } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Box from '@/components/Box';
import { useFocusEffect, useRouter } from 'expo-router';
import { LightStyles } from "../../../styles/style"
export default function VocabularyScreen() {
  const [data, setData] = useState<{ key: string; value: any }[]>([]);
  const [wasSearchingInitially, setWasSearchingInitially] = useState(false);

  const router = useRouter();

  const styles = LightStyles;
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
    setWasSearchingInitially(isSearching === 'true');

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

    // Split search terms by comma and clean them up
    const searchTerms = searchTerm
      .split(',')
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);

    // If no valid terms after splitting, return all items
    if (searchTerms.length === 0) {
      setData(keyValuePairs);
      return;
    }

    // Search for each term and combine results
    const allResults = searchTerms.flatMap(term => {
      const termLength = term.length;
      
      return keyValuePairs
        .map(item => {
          const word = item.key.toLowerCase();
          const distance = levenshteinDistance(term, word);
          const maxLength = Math.max(termLength, word.length);
          const similarityRatio = 1 - (distance / maxLength);
          
          return {
            ...item,
            distance,
            similarityRatio,
            matchedTerm: term // Track which term matched
          };
        })
        .filter(item => {
          return item.similarityRatio > 0.7 || item.distance <= 2;
        });
    });

    // Combine and deduplicate results, keeping the best match for each word
    const combinedResults = allResults.reduce((acc, current) => {
      const existingIndex = acc.findIndex(item => item.key === current.key);
      
      if (existingIndex === -1) {
        // New word, add to results
        return [...acc, current];
      } else if (current.similarityRatio > acc[existingIndex].similarityRatio) {
        // Existing word with better match, replace it
        const newAcc = [...acc];
        newAcc[existingIndex] = current;
        return newAcc;
      }
      // Existing word with worse match, keep original
      return acc;
    }, []);

    // Sort by highest similarity first, then by word length
    const finalResults = combinedResults.sort((a, b) => {
      // First sort by similarity ratio (descending)
      if (a.similarityRatio !== b.similarityRatio) {
        return b.similarityRatio - a.similarityRatio;
      }
      // Then by number of terms matched (descending)
      const aTermCount = allResults.filter(r => r.key === a.key).length;
      const bTermCount = allResults.filter(r => r.key === b.key).length;
      if (aTermCount !== bTermCount) {
        return bTermCount - aTermCount;
      }
      // Finally by word length (ascending)
      return a.key.length - b.key.length;
    });

    setData(finalResults);
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
  <View style={{ flex: 1 }}>
    {wasSearchingInitially && (
      <View style={{ position: 'relative', top: 1, zIndex: 1 }}>
        <Button title="Go Back" onPress={() => router.push('/(drawer)/(tabs)/hidden')} />
      </View>
    )}
    <ScrollView contentContainerStyle={styles.container}>
      {data.map(({ key, value }) => (
        <Box 
          // @ts-ignore
          key={key}
          storageKey={key} 
          title={key} 
          description={value.examples[0]} 
          value={""} 
          onDelete={() => deleteKey(key, key)} 
        />
      ))}
    </ScrollView>
  </View>
);

}



