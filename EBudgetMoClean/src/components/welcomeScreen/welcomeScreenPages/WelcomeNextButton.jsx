// src/components/welcomeScreen/welcomeScreenPages/WelcomeNextButton.jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const NextButton = ({ onPress, title = '', style, textStyle }) => {
    return (
        <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
            <Text style={[styles.buttonText, textStyle]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#1e3a8a',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginLeft: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'MavenPro-SemiBold',
    },
});

export default NextButton;
