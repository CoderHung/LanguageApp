import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

type BoxProps = {
  title: string;
  description: string;
  value: string;
  storageKey: string;
  onDelete: (key: string) => void;
  isSpecialRoute?: boolean; // New boolean prop
};

const Box = ({
  title, 
  description, 
  value, 
  storageKey, 
  onDelete, 
  isSpecialRoute = false // Default to false if not provided
}: BoxProps) => {
  const router = useRouter();

  const deleteValue = async () => {
    try {
      onDelete(storageKey);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handlePress = () => {
    if (!storageKey) {
      console.log("Invalid storage key!");
      return;
    }

    // Navigate to different routes based on isSpecialRoute
    if (isSpecialRoute) {
      router.push(`/content/${storageKey}`);
    } else {
      router.push(`/content/(words)/${storageKey}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.value}>{value}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={deleteValue}>
          <FontAwesome name="trash" size={24} color="black" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => console.log('Share icon pressed')}>
          <FontAwesome name="share" size={24} color="black" style={styles.icon} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Keep your existing styles unchanged
const styles = StyleSheet.create({
  container: {
    padding: 15,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    position: 'relative',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 10,
  },
});

export default Box;