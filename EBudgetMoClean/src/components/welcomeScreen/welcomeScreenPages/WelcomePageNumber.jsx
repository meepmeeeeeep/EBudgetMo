// src/components/welcomeScreen/welcomeScreenPages/WelcomePageNumber.jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

const WelcomePageNumber = ({ isActive = false }) => {
    return <View style={[styles.dot, isActive && styles.activeDot]} />;
};

const styles = StyleSheet.create({
    dot: {
        borderRadius: 999,
        marginHorizontal: 3,
        backgroundColor: '#dbdbdb',
        width: 12,
        height: 12,
    },
    activeDot: {
        width: 40,
        backgroundColor: '#1e3a8a',
    },
});

export default WelcomePageNumber;
