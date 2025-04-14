// src/components/welcomeScreen/welcomeScreenPages/WelcomeTitle.jsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';

const WelcomeTitle = ({ children }) => {
    return <Text style={styles.text}>{children}</Text>;
};

const styles = StyleSheet.create({
    text: {
        fontSize: 42,
        color: '#000',
        textAlign: 'center',
        marginBottom: 5,
        fontFamily: 'MavenPro-Bold',
        paddingHorizontal: 40,
    },
});

export default WelcomeTitle;
