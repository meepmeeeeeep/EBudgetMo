// src/screens/SplashLoader.jsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashLoader = ({ navigation }) => {
    useEffect(() => {
        const checkWelcomeSeen = async () => {
            const hasSeenWelcome = await AsyncStorage.getItem('hasSeenWelcome');

            if (hasSeenWelcome === 'true') {
                navigation.replace('Dashboard');
            } else {
                navigation.replace('Welcome');
            }
        };

        checkWelcomeSeen();
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#4c669f" />
        </View>
    );
};

export default SplashLoader;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
