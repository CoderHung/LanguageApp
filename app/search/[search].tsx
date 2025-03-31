import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Box from '@/components/Box';
import { useLocalSearchParams } from 'expo-router';

export default function SearchScreen() {
  const { search } = useLocalSearchParams();
  const searchString = Array.isArray(search) ? search[0] : search || "";

  const [data, setData] = useState<{ key: string; value: any }[]>([]);
  
  function levenshteinDistance(a, b) {
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
        const wordsListString = await AsyncStorage.getItem("aOlApM");
        if (!wordsListString) {
            console.warn("No words found in 'aOlApM'");
            setData([]);
            return;
        }

        const wordsList = JSON.parse(wordsListString);
        
        // Get all words and their data
        const keyValuePairs = await Promise.all(
            wordsList.map(async (word) => {
                const value = await AsyncStorage.getItem(word);
                return { key: word, value: value ? JSON.parse(value) : "No Data" };
            })
        );

        if (!searchString.trim()) {
            setData(keyValuePairs);
            return;
        }

        const target = searchString.toLowerCase();
        const targetLength = target.length;

        // Calculate similarity scores with additional filtering
        const filteredAndSortedData = keyValuePairs
            .map(item => {
                const word = item.key.toLowerCase();
                const distance = levenshteinDistance(target, word);
                
                // Calculate similarity ratio (0-1 where 1 is perfect match)
                const maxLength = Math.max(targetLength, word.length);
                const similarityRatio = 1 - (distance / maxLength);
                
                return {
                    ...item,
                    distance,
                    similarityRatio
                };
            })
            .filter(item => {
                // Filter out completely dissimilar words
                // Only keep words with at least 30% similarity or length difference <= 2
                return item.similarityRatio > 0.7 || item.distance <= 2;
            })
            .sort((a, b) => {
                // Sort by highest similarity ratio first
                if (a.similarityRatio !== b.similarityRatio) {
                    return b.similarityRatio - a.similarityRatio;
                }
                // If ratios are equal, prefer shorter words
                return a.key.length - b.key.length;
            });


        setData(filteredAndSortedData);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};



  useEffect(() => {
    loadData();
  },[]);

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
