// src/components/welcomeScreen/BackgroundImage.jsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';  // Import the LinearGradient component

const BackgroundImage = ({ children }) => {
    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f5d']}  // Set the gradient colors
            style={styles.background}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
});

export default BackgroundImage;
