import { TouchableOpacity, Text,TextInput, StyleSheet, View } from 'react-native';
import React from 'react';
import { useState } from 'react';
import { Drawer } from 'expo-router/drawer';
import { FontAwesome } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router, Link } from 'expo-router';
import { Image } from 'expo-image';

const HeaderButtons = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/search/${searchQuery.trim()}`);
    }
    setIsSearching(false);
    setSearchQuery('');
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
          onSubmitEditing={handleSearchSubmit} // Handles submission when enter key is pressed
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



// Custom drawer content
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
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: '',
            headerRight: () => <HeaderButtons />, // Use HeaderButtons component here
          }}
        />
      </Drawer>

      {/* Floating round button */}
      <Link href = "/(content)/add" asChild>
        <TouchableOpacity onPress={() => {}} style={styles.roundButton}>
          <FontAwesome name="plus" size={30} color="white" />
        </TouchableOpacity>
      </Link>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  headerButtonsContainer: {
    flexDirection: 'row',      // Ensures buttons are in a row
    marginRight: 10,
  },
  button: {
    marginHorizontal: 10,      // Adds horizontal spacing between buttons
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
    flexDirection: 'row',       // Aligns image and text in a row
    alignItems: 'center',       // Centers the items vertically
    marginBottom: 15,           // Adds space below the header
  },
  image: {
    width: 70,   // Set your desired width
    height: 100,  // Set your desired height
    marginRight: 10, // Adds space between the image and text
  },
  headerText: {
    fontSize: 18, // You can adjust this to your preference
    fontWeight: 'bold', // You can adjust this to your preference
    color: 'black', // Text color
  },
  searchBox: {
    // Style for the TextInput search box
    borderColor: 'gray',
    borderWidth: 1,
    padding: 8,
    borderRadius: 5,
    marginRight: 8,  // Adjust as needed to match spacing with buttons
  },
});
