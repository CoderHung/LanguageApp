import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Modal} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, AntDesign } from '@expo/vector-icons';
import {useRouter} from 'expo-router'
import { useRoute } from '@react-navigation/native';
const FIELD_OPTIONS = {
  tone: ['Neutral', 'Formal', 'Informal', 'Humorous', 'Sarcastic', 'Poetic'],
  mode: ['Written', 'Spoken', 'Both'],
  register: ['Technical', 'Slang', 'Colloquial', 'Vulgar', 'Academic', 'Literary'],
  dialect: ['Standard', 'Northern', 'Southern', 'Eastern', 'Western', 'Central'],
  nuance: ['Positive', 'Negative', 'Neutral', 'Strong', 'Weak', 'Emotional']
};
export default function ItemScreen() {
  const DEFAULT_WORD_DATA = {
    word: '',
    tone: '',
    mode: '',
    register: '',
    nuance: '',
    dialect: '',
    examples: [],
    definitions: [],
    mainConcepts: []
  };
  const router = useRouter();
  const route = useRoute();
  // @ts-ignore
  const key = route.params.item;
  const [storedData, setStoredData] = useState(DEFAULT_WORD_DATA);
  const [newExample, setNewExample] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newMainConcept, setNewMainConcept] = useState('');
  const [conceptSuggestions, setConceptSuggestions] = useState([]);
  const [filteredConcepts, setFilteredConcepts] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [currentValue, setCurrentValue] = useState('');


  const [editingExample, setEditingExample] = useState<string | null>(null);
  const [editingDefinition, setEditingDefinition] = useState<string | null>(null);
  const [editedExampleText, setEditedExampleText] = useState('');
  const [editedDefinitionText, setEditedDefinitionText] = useState('');

  const handleEditExample = (example: string) => {
    setEditingExample(example);
    setEditedExampleText(example);
  };

  // Function to save edited example
  const saveEditedExample = async () => {
    if (!editedExampleText.trim()) {
      Alert.alert('Error', 'Example cannot be empty');
      return;
    }

    try {
      const storedItem = await AsyncStorage.getItem(key);
      if (!storedItem) return;

      const parsedItem = JSON.parse(storedItem);
      if (!Array.isArray(parsedItem.examples)) return;

      // Update the example in the array
      const index = parsedItem.examples.findIndex((e: string) => e === editingExample);
      if (index !== -1) {
        parsedItem.examples[index] = editedExampleText.trim();
        await AsyncStorage.setItem(key, JSON.stringify(parsedItem));
        fetchData();
      }

      setEditingExample(null);
      setEditedExampleText('');
    } catch (error) {
      console.error("Error saving edited example:", error);
      Alert.alert('Error', 'Failed to save example');
    }
  };

  // Function to handle editing a definition
  const handleEditDefinition = (definition: string) => {
    setEditingDefinition(definition);
    setEditedDefinitionText(definition);
  };

  // Function to save edited definition
  const saveEditedDefinition = async () => {
    if (!editedDefinitionText.trim()) {
      Alert.alert('Error', 'Definition cannot be empty');
      return;
    }

    try {
      const storedItem = await AsyncStorage.getItem(key);
      if (!storedItem) return;

      const parsedItem = JSON.parse(storedItem);
      if (!Array.isArray(parsedItem.definitions)) return;

      // Update the definition in the array
      const index = parsedItem.definitions.findIndex((d: string) => d === editingDefinition);
      if (index !== -1) {
        parsedItem.definitions[index] = editedDefinitionText.trim();
        await AsyncStorage.setItem(key, JSON.stringify(parsedItem));
        fetchData();
      }

      setEditingDefinition(null);
      setEditedDefinitionText('');
    } catch (error) {
      console.error("Error saving edited definition:", error);
      Alert.alert('Error', 'Failed to save definition');
    }
  };

  // Function to handle pressing an info item
  const handleInfoItemPress = (field: string, currentValue: string) => {
    setCurrentField(field);
    setCurrentValue(currentValue);
    setModalVisible(true);
  };

  // Function to update a field value
  const updateFieldValue = async (newValue: string) => {
    try {
      const storedItem = await AsyncStorage.getItem(key);
      if (!storedItem) return;

      const parsedItem = JSON.parse(storedItem);
      parsedItem[currentField] = newValue;
      
      await AsyncStorage.setItem(key, JSON.stringify(parsedItem));
      fetchData();
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating field:", error);
      Alert.alert('Error', 'Failed to update field');
    }
  };

  // Modify your infoRow items to be pressable
  const renderInfoItem = (label: string, field: string, value: string) => (
    <TouchableOpacity 
      style={styles.infoItem}
      onPress={() => handleInfoItemPress(field, value)}
    >
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoText}>{value || 'Not set'}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const suggestionsStr = await AsyncStorage.getItem('oCrEwZ');
        if (suggestionsStr) {
          setConceptSuggestions(JSON.parse(suggestionsStr));
        }
      } catch (error) {
        console.error("Error loading concept suggestions", error);
      }
    };
    loadSuggestions();
  }, []);
  
  // Add this function to handle concept input changes
  const handleMainConceptChange = (text) => {
    setNewMainConcept(text);
    if (text) {
      const filtered = conceptSuggestions.filter(concept =>
        concept.toLowerCase().startsWith(text.toLowerCase())
      );
      setFilteredConcepts(filtered);
    } else {
      setFilteredConcepts([]);
    }
  };
  
  // Add this function to add new main concepts
  const addNewMainConcept = async () => {
    if (!newMainConcept.trim()) {
      Alert.alert('Error', 'Concept cannot be empty');
      return;
    }
  
    const conceptWithSuffix = newMainConcept.trim() + "_con";
  
    try {
      // 1. Add to current word's mainConcepts
      const storedItem = await AsyncStorage.getItem(key);
      if (!storedItem) return;
  
      const parsedItem = JSON.parse(storedItem);
      if (!Array.isArray(parsedItem.mainConcepts)) {
        parsedItem.mainConcepts = [];
      }
  
      if (!parsedItem.mainConcepts.includes(conceptWithSuffix)) {
        parsedItem.mainConcepts.push(conceptWithSuffix);
        await AsyncStorage.setItem(key, JSON.stringify(parsedItem));
      }
  
      // 2. Add to global concepts list if not exists
      const concepts = JSON.parse(await AsyncStorage.getItem('oCrEwZ')) || [];
      if (!concepts.includes(conceptWithSuffix)) {
        concepts.push(conceptWithSuffix);
        await AsyncStorage.setItem('oCrEwZ', JSON.stringify(concepts));
      }
  
      // 3. Create concept entry if not exists
      const conceptWords = JSON.parse(await AsyncStorage.getItem(conceptWithSuffix)) || [];
      if (!conceptWords.includes(key)) {
        conceptWords.push(key);
        await AsyncStorage.setItem(conceptWithSuffix, JSON.stringify(conceptWords));
      }
  
      setNewMainConcept('');
      setFilteredConcepts([]);
      fetchData();
    } catch (error) {
      console.error("Error adding main concept:", error);
      Alert.alert('Error', 'Failed to add main concept');
    }
  };

  const fetchData = async () => {
    try {
      const data = await AsyncStorage.getItem(key);
      if (data !== null) {
        setStoredData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
    }
  };

  useEffect(() => {
    if (key) {
      fetchData();
    }
  }, [key]); 

  const deleteExample = async (exampleText: string) => {
    try {
      Alert.alert(
        'Delete Example',
        `Are you sure you want to delete this example?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const storedItem = await AsyncStorage.getItem(key);
              if (!storedItem) return;
  
              const parsedItem = JSON.parse(storedItem);
              if (!Array.isArray(parsedItem.examples)) return;
  
              parsedItem.examples = parsedItem.examples.filter(
                (example: string) => example !== exampleText
              );
  
              await AsyncStorage.setItem(key, JSON.stringify(parsedItem));
              fetchData();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting example:", error);
      Alert.alert('Error', 'Failed to delete example');
    }
  };
  
  const addNewExample = async () => {
    if (!newExample.trim()) {
      Alert.alert('Error', 'Example cannot be empty');
      return;
    }
  
    try {
      const storedItem = await AsyncStorage.getItem(key);
      if (!storedItem) return;
  
      const parsedItem = JSON.parse(storedItem);
      if (!Array.isArray(parsedItem.examples)) {
        parsedItem.examples = [];
      }
  
      parsedItem.examples.push(newExample.trim());
      await AsyncStorage.setItem(key, JSON.stringify(parsedItem));
      setNewExample('');
      fetchData();
    } catch (error) {
      console.error("Error adding example:", error);
      Alert.alert('Error', 'Failed to add example');
    }
  };


  const deleteDefinition = async (definitionText: string) => {
    try {
      Alert.alert(
        'Delete Definition',
        `Are you sure you want to delete this definition?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const storedItem = await AsyncStorage.getItem(key);
              if (!storedItem) return;
  
              const parsedItem = JSON.parse(storedItem);
              if (!Array.isArray(parsedItem.definitions)) return;
  
              parsedItem.definitions = parsedItem.definitions.filter(
                (definition: string) => definition !== definitionText
              );
  
              await AsyncStorage.setItem(key, JSON.stringify(parsedItem));
              fetchData();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting definition:", error); 
      Alert.alert('Error', 'Failed to delete definition');
    }
  };

  const addNewDefinition = async () => {
    if (!newDefinition.trim()) {
      Alert.alert('Error', 'Definition cannot be empty');
      return;
    }

    try {
      const storedItem = await AsyncStorage.getItem(key);
      if (!storedItem) return;

      const parsedItem = JSON.parse(storedItem);
      if (!Array.isArray(parsedItem.definitions)) {
        parsedItem.definitions = [];
      }

      parsedItem.definitions.push(newDefinition.trim());
      await AsyncStorage.setItem(key, JSON.stringify(parsedItem));
      setNewDefinition('');
      fetchData();
    } catch (error) {
      console.error("Error adding definition:", error);
      Alert.alert('Error', 'Failed to add definition');
    }
  };


  const deleteMainConcept = async (concept: string) => {
    try {
      // Confirm deletion with user
      Alert.alert(
        'Delete Concept',
        `Are you sure you want to delete "${concept.slice(0, -4)}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // 1. Remove concept from current word's mainConcepts
              const storedItem = await AsyncStorage.getItem(key);
              if (storedItem) {
                const parsedItem = JSON.parse(storedItem);
                if (Array.isArray(parsedItem.mainConcepts)) {
                  parsedItem.mainConcepts = parsedItem.mainConcepts.filter(
                    (c: string) => c !== concept
                  );
                  await AsyncStorage.setItem(key, JSON.stringify(parsedItem));
                }
              }

              // 2. Remove concept from global concepts list ('oCrEwZ')
              const concepts = JSON.parse(await AsyncStorage.getItem('oCrEwZ')) || [];
              const updatedConcepts = concepts.filter((c: string) => c !== concept);
              await AsyncStorage.setItem('oCrEwZ', JSON.stringify(updatedConcepts));

              // 3. Remove concept from all words that reference it
              const words = JSON.parse(await AsyncStorage.getItem('aOlApM')) || [];
              await Promise.all(
                words.map(async (wordKey: string) => {
                  const wordData = await AsyncStorage.getItem(wordKey);
                  if (wordData) {
                    const wordObj = JSON.parse(wordData);
                    if (wordObj.mainConcepts && Array.isArray(wordObj.mainConcepts)) {
                      wordObj.mainConcepts = wordObj.mainConcepts.filter(
                        (c: string) => c !== concept
                      );
                      await AsyncStorage.setItem(wordKey, JSON.stringify(wordObj));
                    }
                  }
                })
              );

              // Refresh the displayed data
              fetchData();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting main concept:', error);
      Alert.alert('Error', 'Failed to delete concept');
    }
  };

  const deleteWord = async () => {
    try {
      Alert.alert(
        'Delete Word',
        `Are you sure you want to delete "${key}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // 1. Remove the word from AsyncStorage
              await AsyncStorage.removeItem(key);
  
              // 2. Update words array ('aOlApM')
              const words = JSON.parse(await AsyncStorage.getItem('aOlApM')) || [];
              const updatedWords = words.filter((word: string) => word !== key);
              await AsyncStorage.setItem('aOlApM', JSON.stringify(updatedWords));
  
              // 3. Remove word from all concepts that reference it
              const concepts = JSON.parse(await AsyncStorage.getItem('oCrEwZ')) || [];
              await Promise.all(
                concepts.map(async (conceptKey: string) => {
                  const conceptWords = JSON.parse(await AsyncStorage.getItem(conceptKey)) || [];
                  if (conceptWords.includes(key)) {
                    const updatedConceptWords = conceptWords.filter((word: string) => word !== key);
                    await AsyncStorage.setItem(conceptKey, JSON.stringify(updatedConceptWords));
                  }
                })
              );
  
              // Navigate back after successful deletion
              router.push('/(drawer)/(tabs)/concepts');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting word:', error);
      Alert.alert('Error', 'Failed to delete word');
    }
  };

  return (
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled" // This ensures keyboard handling works properly
    >
      {/* Word */}
      <View style={styles.wordContainer}>
        <Text style={styles.wordLabel}>Word:</Text>
        <Text style={styles.wordText}>{storedData.word}</Text>
      </View>

      <TouchableOpacity 
        onPress={deleteWord}
        style={styles.deleteWordButton}
      >
        <FontAwesome name="trash" size={20} color="#e74c3c" />
        <Text style={styles.deleteWordText}>Delete Word</Text>
      </TouchableOpacity>

      {/* Basic Info Row */}
      <View style={styles.infoRow}>
        {renderInfoItem('Tone', 'tone', storedData.tone)}
        {renderInfoItem('Mode', 'mode', storedData.mode)}
      </View>

      <View style={styles.infoRow}>
        {renderInfoItem('Register', 'register', storedData.register)}
        {renderInfoItem('Dialect', 'dialect', storedData.dialect)}
      </View>

      <View style={styles.infoRow}>
        {renderInfoItem('Nuance', 'nuance', storedData.nuance)}
        <View style={styles.infoItem}>
          {/* Empty view to maintain layout */}
        </View>
      </View>

      {/* Definitions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Definitions:</Text>
        {storedData.definitions.map((definition, index) => (
          <View key={index} style={styles.definitionItem}>
            {editingDefinition === definition ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={editedDefinitionText}
                  onChangeText={setEditedDefinitionText}
                  multiline
                  autoFocus
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity 
                    onPress={saveEditedDefinition}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setEditingDefinition(null)}
                    style={styles.cancelEditButton}
                  >
                    <Text style={styles.cancelEditButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.definitionContent}>
                <Text style={styles.listBullet}>•</Text>
                <TouchableOpacity
                  style={styles.editableTextContainer}
                  onPress={() => handleEditDefinition(definition)}
                >
                  <Text style={styles.listText}>{definition}</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity 
              onPress={() => deleteDefinition(definition)}
              style={styles.deleteButton}
            >
              <FontAwesome name="trash" size={16} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ))}
        
        {/* Add New Definition Input */}
        <View style={styles.addDefinitionContainer}>
          <TextInput
            style={styles.definitionInput}
            value={newDefinition}
            onChangeText={setNewDefinition}
            placeholder="Enter a new definition"
            multiline
          />
          <TouchableOpacity 
            onPress={addNewDefinition}
            style={styles.addDefinitionButton}
          >
            <AntDesign name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Examples */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionLabel}>Examples:</Text>
        {storedData.examples.map((example, index) => (
          <View key={index} style={styles.exampleItem}>
            {editingExample === example ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={editedExampleText}
                  onChangeText={setEditedExampleText}
                  multiline
                  autoFocus
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity 
                    onPress={saveEditedExample}
                    style={styles.saveButton}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setEditingExample(null)}
                    style={styles.cancelEditButton}
                  >
                    <Text style={styles.cancelEditButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.exampleContent}>
                <Text style={styles.listBullet}>•</Text>
                <TouchableOpacity
                  style={styles.editableTextContainer}
                  onPress={() => handleEditExample(example)}
                >
                  <Text style={styles.listText}>{example}</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity 
              onPress={() => deleteExample(example)}
              style={styles.deleteButton}
            >
              <FontAwesome name="trash" size={16} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ))}
      
      {/* Add New Example Input */}
      <View style={styles.addDefinitionContainer}> 
        <TextInput
          style={styles.definitionInput} 
          value={newExample}
          onChangeText={setNewExample}
          placeholder="Enter a new example sentence"
          multiline
        />
        <TouchableOpacity 
          onPress={addNewExample}
          style={styles.addDefinitionButton}
        >
          <AntDesign name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
        
      {/* Main Concepts */}
      <View style={styles.sectionContainer}>
      <Text style={styles.sectionLabel}>Main Concepts:</Text>
      <View style={styles.conceptsContainer}>
        {storedData.mainConcepts.map((concept, index) => (
          <View key={index} style={styles.conceptPill}>
            <Text style={styles.conceptText}>{concept.slice(0, -4)}</Text>
            <TouchableOpacity
              onPress={() => deleteMainConcept(concept)}
              style={styles.conceptDeleteButton}
            >
              <FontAwesome name="times" size={12} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Add New Main Concept Input */}
      <View style={styles.addDefinitionContainer}>
        <TextInput
          style={styles.definitionInput}
          value={newMainConcept}
          onChangeText={handleMainConceptChange}
          placeholder="Enter a new main concept"
          autoCapitalize="characters"
        />
        <TouchableOpacity 
          onPress={addNewMainConcept}
          style={styles.addDefinitionButton}
        >
          <AntDesign name="plus" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Concept Suggestions */}
      {filteredConcepts.length > 0 && (
        <View style={styles.suggestionBox}>
          {filteredConcepts.map((concept, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => {
                setNewMainConcept(concept.slice(0, -4));
                setFilteredConcepts([]);
              }}
            >
              <Text style={styles.suggestionText}>{concept.slice(0, -4)}</Text>
            </TouchableOpacity>
          ))}
    </View>
      )}
    </View>

    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select {currentField}</Text>
            
            {FIELD_OPTIONS[currentField]?.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  currentValue === option && styles.selectedOption
                ]}
                onPress={() => updateFieldValue(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContentContainer: {
    padding: 20,
  },
  
  

  // Word Section
  wordContainer: {
    marginBottom: 20,
  },
  wordLabel: {
    fontSize: 16,
    color: '#666',
  },
  wordText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  infoItem: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 16,
    color: '#444',
  },

  // Section Styles
  sectionContainer: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
  },

  // Main Concepts
  conceptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conceptPill: {
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  conceptText: {
    fontSize: 14,
    color: '#444',
    marginRight: 6,
  },

  // No Data
 
  exampleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleContent: {
    flexDirection: 'row',
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },

  definitionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  definitionContent: {
    flexDirection: 'row',
    flex: 1,
  },
  conceptDeleteButton: {
    padding: 2,
  },

  deleteWordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffeeee',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  deleteWordText: {
    color: '#e74c3c',
    marginLeft: 8,
    fontWeight: 'bold',
  },

  addExampleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  listBullet: {
    marginRight: 8,
    color: '#666',
  },
  listText: {
    flex: 1,
    fontSize: 16,
    color: '#555',
    lineHeight: 22,
  },

  addDefinitionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  definitionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    fontSize: 16,
    marginRight: 10,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  addDefinitionButton: {
    backgroundColor: '#3498db',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  suggestionBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dfe6e9',
  },
  suggestionText: {
    fontSize: 16,
    color: '#3498db',
  },
   // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  optionButton: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#3498db',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 15,
    padding: 12,
    borderRadius: 5,
    backgroundColor: '#e74c3c',
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },

  editContainer: {
    flex: 1,
    marginRight: 10,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    fontSize: 16,
    marginBottom: 8,
    minHeight: 50,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  saveButtonText: {
    color: 'white',
  },
  cancelEditButton: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  cancelEditButtonText: {
    color: 'white',
  },
  editableTextContainer: {
    flex: 1,
  },

});