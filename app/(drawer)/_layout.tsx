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

// Initialize AsyncStorage values
const initializeAsyncStorage = async () => {
  try {
    await AsyncStorage.multiSet([
      ['@current_tab_screen', ''],
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
        //console.log(currentTab);
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
        />
      ) : (
        <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.button}>
          <FontAwesome name="search" size={24} color="black" />
        </TouchableOpacity>
      )}
    </View>
  );
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

      <Link href="/(content)/add" asChild>
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