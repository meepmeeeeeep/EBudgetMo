// src/screens/WelcomeScreen.jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Components
import BackgroundImage from '../components/welcomeScreen/BackgroundImage';
import WelcomeText from '../components/welcomeScreen/WelcomeText';
import GetStartedButton from '../components/welcomeScreen/GetStartedButton';

const WelcomeScreen = ({ navigation }) => {
    const handleGetStarted = async () => {
        await AsyncStorage.setItem('hasSeenWelcome', 'true');
        navigation.replace('WelcomePage1');
    };

    return (
        <BackgroundImage>
            <View style={styles.container}>
                <WelcomeText />
                <GetStartedButton onPress={handleGetStarted} />
            </View>
        </BackgroundImage>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 50,  // Adjust as needed
    },
});

export default WelcomeScreen;
