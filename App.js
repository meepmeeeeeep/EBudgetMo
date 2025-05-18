import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BudgetProvider } from './screens/BudgetContext';
import { BillsProvider } from './screens/BillsContext';
import HomeScreen from './screens/HomeScreen';
import FinanceScreen from './screens/FinanceScreen';
import BillsScreen from './screens/BillsScreen';
// import SettingsScreen from './screens/SettingsScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create navigation ref
export const navigationRef = React.createRef();

export const navigate = (name, params) => {
  navigationRef.current?.navigate(name, params);
};

const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Bills"
        component={BillsScreen}
        options={{ title: 'Recurring Bills' }}
      />
    </Stack.Navigator>
  );
};

const FinanceStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Finance"
        component={FinanceScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};


const SettingsStack = () => {
 return (
   <Stack.Navigator>
     <Stack.Screen
       name="SettingsMain"
       component={SettingsScreen}
       options={{ title: 'Settings' }}
     />
   </Stack.Navigator>
 );
};


const App = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <BudgetProvider>
        <BillsProvider>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'HomeTab') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'FinanceTab') {
                  iconName = focused ? 'wallet' : 'wallet-outline';
                } else if (route.name === 'BillsTab') {
                  iconName = focused ? 'calendar' : 'calendar-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: '#5F9EA0',
              tabBarInactiveTintColor: 'gray',
              headerShown: false
            })}
          >
            <Tab.Screen 
              name="HomeTab" 
              component={HomeStack}
              options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen 
              name="FinanceTab" 
              component={FinanceStack}
              options={{ tabBarLabel: 'Finance' }}
            />
            <Tab.Screen 
              name="BillsTab" 
              component={BillsScreen}
              options={{ tabBarLabel: 'Bills' }}
            />
          </Tab.Navigator>
        </BillsProvider>
      </BudgetProvider>
    </NavigationContainer>
  );
};

export default App;