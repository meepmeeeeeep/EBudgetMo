// src/screens/WelcomeScreenPage2.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Components
import WelcomeTitle from '../components/welcomeScreen/welcomeScreenPages/WelcomeTitle';
import WelcomeSubtext from '../components/welcomeScreen/welcomeScreenPages/WelcomeSubtext';
import WelcomePageNumber from '../components/welcomeScreen/welcomeScreenPages/WelcomePageNumber';
import WelcomeNextButton from '../components/welcomeScreen/welcomeScreenPages/WelcomeNextButton';
import WelcomeImage from "../components/welcomeScreen/welcomeScreenPages/WelcomeImage";

const Dashboard = ({ navigation }) => {
    const resetWelcome = async () => {
        await AsyncStorage.removeItem('hasSeenWelcome');
        navigation.replace('SplashLoader');
    };

    const nextPage = async () => {
        navigation.replace('WelcomePage3');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <WelcomeImage imageSource={require('../../assets/images/Graphs.png')}/>

                <WelcomeTitle>Track Your Finances Easily</WelcomeTitle>
                <WelcomeSubtext style={styles.subtext}>Monitor your income and expenses with a simple, intuitive dashboard. Categorize your transactions for better insights.</WelcomeSubtext>
            </View>

            <View style={styles.footer}>
                <View style={styles.pageIndicatorContainer}>
                    <View style={styles.pageNumbers}>
                        <WelcomePageNumber />
                        <WelcomePageNumber isActive />
                        <WelcomePageNumber />
                        <WelcomePageNumber />
                    </View>

                    <View style={styles.buttonContainer}>
                        <WelcomeNextButton title="Next" onPress={nextPage} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
        paddingVertical: 70,
    },
    content: {
        alignItems: 'center',
    },
    subtext: {
        marginTop: 50,
        marginBottom: 50,
        paddingLeft: 40,
        paddingRight: 40,
        lineHeight: 30,
    },
    footer: {
        alignItems: 'center',
    },
    pageIndicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 50,
    },
    pageNumbers: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        marginLeft: 'auto',
    },
});

export default Dashboard;
