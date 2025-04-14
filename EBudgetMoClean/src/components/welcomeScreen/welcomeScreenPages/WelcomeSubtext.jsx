// src/components/welcomeScreen/welcomeScreenPages/WelcomeSubtext.jsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const WelcomeSubtext = ({ children, style }) => {
    return <Text style={[styles.text, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
    text: {
        fontSize: 20,
        color: '#000',
        textAlign: 'center',
        fontFamily: 'MavenPro-Regular',
    },
});

export default WelcomeSubtext;
