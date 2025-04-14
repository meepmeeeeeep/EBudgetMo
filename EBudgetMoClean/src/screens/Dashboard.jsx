// Dashboard.jsx

import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../components/dashboard/TopBar';
import BalanceSummary from '../components/dashboard/BalanceSummary';
import ProgressText from '../components/dashboard/ProgressText';

const Dashboard = ({ navigation }) => {
    const resetWelcome = async () => {
        await AsyncStorage.removeItem('hasSeenWelcome');
        navigation.replace('SplashLoader');
    };

    // Placeholder Values
    const username = "John Doe";
    const profilePictureUri = "https://www.example.com/profile.jpg";
    const currentBalance = 1200;
    const lastMonthBalance = 1000.00;
    const income = 500;
    const expense = 300;

    const handleNotificationPress = () => {
        alert("Notification clicked");
    };

    return (
        <View style={styles.container}>
            <TopBar
                username={username}
                profilePictureUri={profilePictureUri}
                onNotificationPress={handleNotificationPress}
            />
            <BalanceSummary
                currentBalance={currentBalance}
                lastMonthBalance={lastMonthBalance}
            />
            <ProgressText
                income={income}
                expense={expense}
            />

            <Button title="Reset Welcome Screen" onPress={resetWelcome} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
});

export default Dashboard;
