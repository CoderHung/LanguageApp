import React, { useState, useCallback } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import Box from '@/components/Box';
import { LightStyles } from "../../../styles/style"
export default function VocabularyScreen() {
  const [data, setData] = useState<{ key: string; value: any[] | string }[]>([]);
  const [wasSearchingInitially, setWasSearchingInitially] = useState(false);
  const styles = LightStyles;
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
        setWasSearchingInitially(isSearching === 'true');
        const wordsListString = await AsyncStorage.getItem("oCrEwZ");
        if (!wordsListString || wordsListString === '[]') {
          console.warn("No words found in 'oCrEwZ'");
          setData([]);
          return;
        }
        
        const wordsList = JSON.parse(wordsListString);

        const keyValuePairs = await Promise.all(
          wordsList.map(async (word: string) => {
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

        // Split search terms by comma and trim whitespace
        const searchTerms = searchTerm
          .split(',')
          .map(term => term.trim())
          .filter(term => term.length > 0);

        // Process each search term separately
        const searchResults = searchTerms.map(term => {
          const target = term.toLowerCase();
          const targetLength = target.length;

          return keyValuePairs
            .map(item => {
              const conceptName = item.key.slice(0, -4).toLowerCase();
              const distance = levenshteinDistance(target, conceptName);
              const maxLength = Math.max(targetLength, conceptName.length);
              const similarityRatio = 1 - (distance / maxLength);
              
              return {
                ...item,
                distance,
                similarityRatio,
                matchedTerm: term
              };
            })
            .filter(item => {
              return item.similarityRatio > 0.7 || item.distance <= 2;
            });
        });

        // Combine results from all search terms
        const combinedResults = searchResults.flat();

        // Remove duplicates and keep the highest similarity match for each concept
        const uniqueResults = combinedResults.reduce((acc, current) => {
          const existing = acc.find(item => item.key === current.key);
          if (!existing || current.similarityRatio > existing.similarityRatio) {
            return [...acc.filter(item => item.key !== current.key), current];
          }
          return acc;
        }, []);

        // Sort by highest similarity
        const filteredAndSortedData = uniqueResults.sort((a, b) => {
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
        key ={key}
        storageKey={key} 
        title={key.slice(0,-4)} 
        description={Array.isArray(value) ? value.join(', ') : value} 
        value={""} 
        onDelete={() => deleteKey(key)} 
        isSpecialRoute={true}
      /> 
    ))}
  </ScrollView>
  </View>
  )
}

