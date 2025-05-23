import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

const SearchPage = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Search Page</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        fontWeight: '500',
    },
});

export default SearchPage;