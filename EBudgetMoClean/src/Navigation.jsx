// src/Navigation.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import WelcomeScreen from './screens/WelcomeScreen';
import WelcomeScreenPage1 from './screens/WelcomeScreenPage1';
import WelcomeScreenPage2 from './screens/WelcomeScreenPage2';
import WelcomeScreenPage3 from './screens/WelcomeScreenPage3';
import WelcomeScreenPage4 from './screens/WelcomeScreenPage4';
import Dashboard from './screens/Dashboard';
import SplashLoader from './screens/SplashLoader';

const Stack = createStackNavigator();
// Stack navigator for welcome screens and splash
const AppStack = () => {
    return (
        <Stack.Navigator initialRouteName="SplashLoader">
            <Stack.Screen name="SplashLoader" component={SplashLoader} options={{ headerShown: false }} />

            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="WelcomePage1" component={WelcomeScreenPage1} options={{ headerShown: false }} />
            <Stack.Screen name="WelcomePage2" component={WelcomeScreenPage2} options={{ headerShown: false }} />
            <Stack.Screen name="WelcomePage3" component={WelcomeScreenPage3} options={{ headerShown: false }} />
            <Stack.Screen name="WelcomePage4" component={WelcomeScreenPage4} options={{ headerShown: false }} />

            <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <NavigationContainer>
            <AppStack />
        </NavigationContainer>
    );
};

export default AppNavigator;