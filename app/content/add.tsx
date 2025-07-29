import React, { useState, useEffect } from 'react';
import { 
    ScrollView, 
    TextInput, 
    TouchableOpacity, 
    Text, 
    StyleSheet, 
    KeyboardAvoidingView, 
    Platform,
    Button,
    View,
    FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

export default function Add() {
    const router = useRouter();
    const [input1, setInput1] = useState('');
    const [Tone, setTone] = useState('informal');
    const [Mode, setMode] = useState('neutral');
    const [Register, setRegister] = useState('neutral');
    const [Nuance, setNuance] = useState('neutral');
    const [Dialect, setDialect] = useState('neutral');

    const [Examples, setExamples] = useState([]);
    const [ExamText, setExamText] = useState('');

    const [Definitions, setDefinitions] = useState([]);
    const [DefText, setDefText] = useState('');

    const [MainConcepts, setMainConcepts] = useState([]);
    const [MainConText, setMainConText] = useState('');

    const [conceptSuggestions, setConceptSuggestions] = useState([]);
    const [filteredConcepts, setFilteredConcepts] = useState([]);
    
    // Load suggestions from AsyncStorage key "oCrEwZ"
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

    // Filter suggestions as user types
    const handleMainConceptChange = (text) => {
        setMainConText(text);
        if (text) {
            const filtered = conceptSuggestions.filter(concept =>
                concept.toLowerCase().startsWith(text.toLowerCase())
            );
            setFilteredConcepts(filtered);
        } else {
            setFilteredConcepts([]);
        }
    };

    const saveData = async () => {
        try {
            let Ex = Examples;
            let def = Definitions;
            let Mcon = MainConcepts;
            if(ExamText.trim()) {
                Ex = [...Examples, ExamText];
            };
            if(DefText.trim()) {
                def = [...Definitions, DefText]
            };
            if(MainConText.trim()) {
                Mcon = [...MainConcepts , MainConText + "_con"]
            };
            const formData = {
                word: input1 ,
                tone: Tone,
                mode: Mode,
                register: Register,
                nuance: Nuance,
                dialect: Dialect,
                examples: Ex,
                definitions: def,
                mainConcepts: Mcon,
            };

            // Save word data
            await AsyncStorage.setItem(input1 , JSON.stringify(formData));
            //change for each mainconcept
            for (const concept of Mcon) {
                const existingConceptData = JSON.parse(await AsyncStorage.getItem(concept)) || [];
                if (!existingConceptData.includes(input1)) {
                    existingConceptData.push(input1);
                    await AsyncStorage.setItem(concept, JSON.stringify(existingConceptData));
                }
                
                const concepts = JSON.parse(await AsyncStorage.getItem('oCrEwZ')) || [];
                if (!concepts.includes(concept)) {
                    concepts.push(concept);
                    await AsyncStorage.setItem('oCrEwZ', JSON.stringify(concepts));
                }
            }
    
            // Update words array
            const words = JSON.parse(await AsyncStorage.getItem('aOlApM')) || [];
            if (!words.includes(input1)) {
                words.push(input1);
                await AsyncStorage.setItem('aOlApM', JSON.stringify(words));
            }
            
            alert('Data saved successfully');
            router.push('/(drawer)/(tabs)/concepts');
        } catch (error) {
            console.error('Failed to save data', error);
        }
    };

    const clearStorage = async () => {
        try {
          await AsyncStorage.clear();
        } catch (error) {
          console.error('Error clearing AsyncStorage:', error);
        }
    };

    const addExamples = () => {
        if (ExamText.trim()) {
          setExamples([...Examples, ExamText]);
          setExamText(""); // Clear input field
        }
      };
    
    const removeExamples = (index) => {
        setExamples(Examples.filter((_, i) => i !== index));
    };

    const addDefinitions = () => {
        if (DefText.trim()) {
          setDefinitions([...Definitions, DefText]);
          setDefText(""); // Clear input field
        }
      };
    
    const removeDefinitions = (index) => {
        setDefinitions(MainConcepts.filter((_, i) => i !== index));
    };

    const addMainConcept = () => {
        if (MainConText.trim() && !MainConcepts.includes(MainConText.trim())) {
            setMainConcepts([...MainConcepts, MainConText.trim() + "_con"]);
            setMainConText('');
        }
    };

    const removeMainConcepts = (index) => {
        setMainConcepts(MainConcepts.filter((_, i) => i !== index));
    };

    const addTestingData = async () => {
        try {
            // First word
            const word1 = {
                word: "example",
                tone: "neutral",
                mode: "neutral",
                register: "neutral",
                nuance: "neutral",
                dialect: "neutral",
                examples: [
                    "This is an example sentence.",
                    "Here's another example usage.",
                    "For example, you could use it like this."
                ],
                definitions: [
                    "A representative form or pattern",
                    "Something to be imitated",
                    "An illustration of a rule"
                ],
                mainConcepts: ["SAMPLE_con", "MODEL_con", "PATTERN_con"]
            };

            // Second word
            const word2 = {
                word: "sample",
                tone: "neutral",
                mode: "neutral",
                register: "neutral",
                nuance: "neutral",
                dialect: "neutral",
                examples: [
                    "Please provide a sample of your work.",
                    "This is just a small sample of what we offer.",
                    "The doctor took a blood sample."
                ],
                definitions: [
                    "A small part representing the whole",
                    "A specimen for testing",
                    "An example of a particular group"
                ],
                mainConcepts: ["SAMPLE_con", "MODEL_con", "PATTERN_con"]
            };

            // Third word
            const word3 = {
                word: "model",
                tone: "neutral",
                mode: "neutral",
                register: "neutral",
                nuance: "neutral",
                dialect: "neutral",
                examples: [
                    "She works as a fashion model.",
                    "This is a scale model of the building.",
                    "We need to model good behavior."
                ],
                definitions: [
                    "A three-dimensional representation",
                    "A person employed to display clothes",
                    "A system or thing used as an example"
                ],
                mainConcepts: ["MODEL_con"] // Only one main concept
            };

            // Save all words
            await Promise.all([
                AsyncStorage.setItem(word1.word, JSON.stringify(word1)),
                AsyncStorage.setItem(word2.word, JSON.stringify(word2)),
                AsyncStorage.setItem(word3.word, JSON.stringify(word3))
            ]);

            // Update words list
            const words = JSON.parse(await AsyncStorage.getItem('aOlApM')) || [];
            const newWords = [word1.word, word2.word, word3.word].filter(word => !words.includes(word));
            if (newWords.length > 0) {
                await AsyncStorage.setItem('aOlApM', JSON.stringify([...words, ...newWords]));
            }

            // Update concepts list
            const allConcepts = [...word1.mainConcepts, ...word2.mainConcepts, ...word3.mainConcepts];
            const uniqueConcepts = [...new Set(allConcepts)];
            
            const existingConcepts = JSON.parse(await AsyncStorage.getItem('oCrEwZ')) || [];
            const newConcepts = uniqueConcepts.filter(concept => !existingConcepts.includes(concept));
            
            if (newConcepts.length > 0) {
                await AsyncStorage.setItem('oCrEwZ', JSON.stringify([...existingConcepts, ...newConcepts]));
            }

            // Update concept-word relationships
            await Promise.all(uniqueConcepts.map(async concept => {
                const conceptWords = JSON.parse(await AsyncStorage.getItem(concept)) || [];
                const wordsForConcept = [];
                
                if (word1.mainConcepts.includes(concept)) wordsForConcept.push(word1.word);
                if (word2.mainConcepts.includes(concept)) wordsForConcept.push(word2.word);
                if (word3.mainConcepts.includes(concept)) wordsForConcept.push(word3.word);
                
                const newWordsForConcept = wordsForConcept.filter(word => !conceptWords.includes(word));
                if (newWordsForConcept.length > 0) {
                    await AsyncStorage.setItem(concept, JSON.stringify([...conceptWords, ...newWordsForConcept]));
                }
            }));

            alert('Testing data added successfully!');
        } catch (error) {
            console.error('Error adding testing data:', error);
            alert('Failed to add testing data');
        }
    };
    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
            keyboardVerticalOffset={80}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/*<View style={styles.testingButtonsContainer}>
                <View style={styles.testingButton}>
                    <Button 
                        title="Clear All Data" 
                        onPress={clearStorage} 
                        color="#e74c3c"
                    />
                </View>
                <View style={styles.testingButton}>
                    <Button 
                        title="Add Testing Data" 
                        onPress={addTestingData} 
                        color="#3498db"
                    />
                </View>
            </View> 
            */}

                <Text style={styles.sectionTitle}>Word Information</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter word..."
                    placeholderTextColor="#95a5a6"
                    value={input1}
                    onChangeText={setInput1}
                />

                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Tone</Text>
                    <Picker
                        selectedValue={Tone}
                        onValueChange={setTone}
                        style={styles.picker}
                        dropdownIconColor="#3498db"
                    >
                        <Picker.Item label="Informal" value="Informal" />
                        <Picker.Item label="Slightly informal" value="Slightly informal" />
                        <Picker.Item label="Neutral" value="Neutral" />
                        <Picker.Item label="Slightly formal" value="Slightly formal" />
                        <Picker.Item label="Formal" value="Formal" />
                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Mode</Text>
                    <Picker
                        selectedValue={Mode}
                        onValueChange={setMode}
                        style={styles.picker}
                        dropdownIconColor="#3498db"
                    >
                        <Picker.Item label="Neutral" value="Neutral" />
                        <Picker.Item label="Spoken" value="Spoken" />
                        <Picker.Item label="Written" value="Written" />
                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Register</Text>
                    <Picker
                        selectedValue={Register}
                        onValueChange={setRegister}
                        style={styles.picker}
                        dropdownIconColor="#3498db"
                    >
                        <Picker.Item label="Neutral" value="Neutral" />
                        <Picker.Item label="Academic" value="Academic" />
                        <Picker.Item label="Literature" value="Literature" />
                        <Picker.Item label="Business" value="Business" />
                        <Picker.Item label="Law" value="Law" />
                        <Picker.Item label="Journalism" value="Journalism" />
                        <Picker.Item label="Medicine" value="Medicine" />
                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Nuance</Text>
                    <Picker
                        selectedValue={Nuance}
                        onValueChange={setNuance}
                        style={styles.picker}
                        dropdownIconColor="#3498db"
                    >
                        <Picker.Item label="Neutral" value="Neutral" />
                        <Picker.Item label="Humorous" value="Humorous" />
                        <Picker.Item label="Old-fashioned" value="Old-fashioned" />
                        <Picker.Item label="Oft positive" value="oft positive" />
                        <Picker.Item label="Oft negative" value="oft negative" />
                        <Picker.Item label="Politically correct" value="Politically correct" />
                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Dialect</Text>
                    <Picker
                        selectedValue={Dialect}
                        onValueChange={setDialect}
                        style={styles.picker}
                        dropdownIconColor="#3498db"
                    >
                        <Picker.Item label="Neutral" value="neutral" />
                        <Picker.Item label="British" value="british" />
                        <Picker.Item label="American" value="american" />
                    </Picker>
                </View>

                <Text style={styles.sectionTitle}>Examples</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, styles.flexInput]}
                        placeholder="Enter example..."
                        placeholderTextColor="#95a5a6"
                        value={ExamText}
                        onChangeText={setExamText}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addExamples}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={Examples}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.listItem}>
                            <Text style={styles.listItemText}>{item}</Text>
                            <TouchableOpacity 
                                style={styles.removeButton} 
                                onPress={() => removeExamples(index)}
                            >
                                <Text style={styles.removeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    scrollEnabled={false}
                />

                <Text style={styles.sectionTitle}>Definitions</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, styles.flexInput]}
                        placeholder="Enter definition..."
                        placeholderTextColor="#95a5a6"
                        value={DefText}
                        onChangeText={setDefText}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addDefinitions}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={Definitions}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.listItem}>
                            <Text style={styles.listItemText}>{item}</Text>
                            <TouchableOpacity 
                                style={styles.removeButton} 
                                onPress={() => removeDefinitions(index)}
                            >
                                <Text style={styles.removeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    scrollEnabled={false}
                />

                <Text style={styles.sectionTitle}>Main Concepts</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={[styles.input, styles.flexInput]}
                        placeholder="Enter main concept..."
                        placeholderTextColor="#95a5a6"
                        autoCapitalize="characters"
                        onChangeText={handleMainConceptChange}
                        value={MainConText}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addMainConcept}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {filteredConcepts.length > 0 && (
                    <View style={styles.suggestionBox}>
                        {filteredConcepts.map((concept, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.suggestionItem}
                                onPress={() => {
                                    setMainConText(concept.slice(0,-4));
                                    setFilteredConcepts([]);
                                }}
                            >
                                <Text style={styles.suggestionText}>{concept.slice(0,-4)}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <FlatList
                    data={MainConcepts}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.listItem}>
                            <Text style={styles.listItemText}>{item.slice(0, -4)}</Text>
                            <TouchableOpacity 
                                style={styles.removeButton} 
                                onPress={() => removeMainConcepts(index)}
                            >
                                <Text style={styles.removeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    scrollEnabled={false}
                />

                <TouchableOpacity onPress={saveData} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save Word</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        padding: 20,
        paddingBottom: 100,
    },
    testingButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    testingButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginTop: 20,
        marginBottom: 10,
    },
    input: {
        width: '100%',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#dfe6e9',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        color: '#2d3436',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    flexInput: {
        flex: 1,
        marginRight: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    pickerContainer: {
        width: '100%',
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    pickerLabel: {
        fontSize: 14,
        color: '#7f8c8d',
        paddingLeft: 10,
        paddingTop: 5,
    },
    picker: {
        width: '100%',
        color: '#2d3436',
    },
    addButton: {
        backgroundColor: '#3498db',
        width: 50,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24,
        lineHeight: 28,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    listItemText: {
        flex: 1,
        fontSize: 16,
        color: '#2d3436',
    },
    removeButton: {
        backgroundColor: '#e74c3c',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 18,
        lineHeight: 20,
    },
    suggestionBox: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 10,
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
    saveButton: {
        backgroundColor: '#2ecc71',
        borderRadius: 8,
        padding: 18,
        alignItems: 'center',
        marginTop: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});