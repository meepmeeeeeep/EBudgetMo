// src/components/welcomeScreen/WelcomeText.jsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const WelcomeText = () => {
    return <Text style={styles.text}>Welcome to E-Budget Mo!</Text>;
};

const styles = StyleSheet.create({
    text: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 40,
        fontFamily: 'Arial',  // You can change this to your preferred font
    },
});

export default WelcomeText;
