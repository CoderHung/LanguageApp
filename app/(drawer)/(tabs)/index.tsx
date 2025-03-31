import React, {  useState, useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import Box from '@/components/Box';

export default function VocabularyScreen() {
  const [data, setData] = useState<{ key: string; value: any[] | string }[]>([]);

  const loadData = async () => {
    try {
        const wordsListString = await AsyncStorage.getItem("oCrEwZ"); // Get mainConcepts list
        if (!wordsListString) {
            console.warn("No words found in 'oCrEwZ'");
            setData([]);
            return;
        }
        
        const wordsList = JSON.parse(wordsListString); // Parse words array

        const keyValuePairs = await Promise.all(
            wordsList.map(async (word) => {
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
        //finish
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
        onDelete={deleteKey} 
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
