import { TouchableOpacity, Text, TextInput, StyleSheet, View } from 'react-native';
import React from 'react';
import { useState, useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';
import { FontAwesome } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router, Link } from 'expo-router';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import * as IntentLauncher from 'expo-intent-launcher';
import { StorageAccessFramework } from 'expo-file-system';
import { Buffer } from 'buffer'; // Needed for writing file
global.Buffer = Buffer;
// Initialize AsyncStorage values
const initializeAsyncStorage = async () => {
  try {
    await AsyncStorage.multiSet([
      ['@current_tab_screen', 'index'],
      ['@search_term', ''],
      ['@is_searching', 'false']
    ]);
  } catch (e) {
    console.error('Error initializing AsyncStorage:', e);
  }
};

const HeaderButtons = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearchSubmit = async () => {
    try {
      if (searchQuery.trim()) {
        // Get current tab screen
        const currentTab = await AsyncStorage.getItem('@current_tab_screen') || '';
        
        // Update search state
        await AsyncStorage.multiSet([
          ['@is_searching', 'true'],
          ['@search_term', searchQuery.trim()],
          ['@hop', currentTab]
        ]);
        router.push('/(drawer)/(tabs)/hidden');
        //router.push(`/(drawer)/(tabs)/${currentTab}/search/${searchQuery.trim()}`);
      }
    } catch (e) {
      console.error('Error during search:', e);
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  return (
    <View style={styles.headerButtonsContainer}>
      {isSearching ? (
        <TextInput
          style={styles.searchBox}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          onBlur={() => setIsSearching(false)}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          autoCapitalize="none"
        />
      ) : (
        <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.button}>
          <FontAwesome name="search" size={24} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
};


// Helper to decode storage
const parseItem = async (key) => {
  const item = await AsyncStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

const exportToExcel = async () => {
  try {
    const words = await parseItem('aOlApM') || [];
    const concepts = await parseItem('oCrEwZ') || [];

    // WORDS SHEET
    const wordRows = [];
    for (const word of words) {
      const data = await parseItem(word);
      if (data) {
        wordRows.push({
          Word: word,
          Tone: data.tone,
          Mode: data.mode,
          Register: data.register,
          Nuance: data.nuance,
          Dialect: data.dialect,
          Examples: data.examples.join('; '),
          Definitions: data.definitions.join('; '),
          MainConcepts: data.mainConcepts.map(c => c.replace('_con', '')).join('; ')
        });
      }
    }

    // CONCEPTS SHEET
    const conceptRows = [];
    for (const concept of concepts) {
      const linkedWords = await parseItem(concept);
      if (linkedWords) {
        conceptRows.push({
          Concept: concept.replace('_con', ''),
          LinkedWords: linkedWords.join('; ')
        });
      }
    }

    // Create workbook
    const wb = XLSX.utils.book_new();
    const wsWords = XLSX.utils.json_to_sheet(wordRows);
    const wsConcepts = XLSX.utils.json_to_sheet(conceptRows);

    XLSX.utils.book_append_sheet(wb, wsWords, 'Words');
    XLSX.utils.book_append_sheet(wb, wsConcepts, 'MainConcepts');

    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const uri = FileSystem.documentDirectory + 'vocab.xlsx';
    await FileSystem.writeAsStringAsync(uri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    await Sharing.shareAsync(uri);
  } catch (err) {
    console.error('Export failed:', err);
  }
};





const CustomDrawerContent = (props) => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.headerContainer}>
        <Image source={require('../../assets/images/book.png')} style={styles.image} />
        <Text style={styles.headerText}>Personal Vocabulary Vault</Text>
      </View>
      <DrawerItem
        icon={() => <FontAwesome name="search" size={24} color="black" />}
        label={"Extended Search"}
        onPress={() => {
          router.push('/');
        }}
      />
      <DrawerItem
        icon={() => <FontAwesome name="microphone" size={24} color="black" />}
        label={"Assistant"}
        onPress={() => {
          router.push('/');
        }}
      />
      <DrawerItem
        icon={() => <FontAwesome name="info-circle" size={24} color="black" />}
        label={"About"}
        onPress={() => {
          router.push('/');
        }}
      />
      <DrawerItem
        icon={() => <FontAwesome name="share-alt" size={24} color="black" />}
        label={"Share"}
        onPress={() => {
          router.push('/');
        }}
      />
      <DrawerItem
        icon={() => <FontAwesome name="file-excel-o" size={24} color="black" />}
        label={"Export to Excel"}
        onPress={exportToExcel}
      />

    </DrawerContentScrollView>
  );
};

export default function Layout() {
  useEffect(() => {
    initializeAsyncStorage();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: '',
            headerRight: () => <HeaderButtons />,
          }}
        />
      </Drawer>

      <Link href="/content/add" asChild>
        <TouchableOpacity onPress={() => {}} style={styles.roundButton}>
          <FontAwesome name="plus" size={30} color="white" />
        </TouchableOpacity>
      </Link>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: 'row',
    marginRight: 10,
  },
  button: {
    marginHorizontal: 10,
  },
  roundButton: {
    position: 'absolute',
    bottom: 70,
    right: 60,
    backgroundColor: 'black',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    width: 70,
    height: 100,
    marginRight: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  searchBox: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginRight: 8,
  },
});