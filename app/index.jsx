import React, { useEffect, useState, createContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, ActivityIndicator, View, Alert } from 'react-native';
import { account } from './config/appwrite';
import FloatingTabBar from './components/FloatingTabBar';

// Import screens
import WorkoutScreen from './screens/WorkoutScreen';
import ExercisesScreen from './screens/ExercisesScreen';
import SettingsScreen from './screens/SettingsScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ExerciseDetailsScreen from './screens/ExerciseDetailsScreen';

// Import new workout-related screens
import WeekdayDetailsScreen from './screens/WeekdayDetailsScreen';
import AddExerciseScreen from './screens/AddExerciseScreen';
import ExecuteWorkoutScreen from './screens/ExecuteWorkoutScreen';

// Create navigators
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Create context for auth functions
export const AuthContext = createContext();

// This component contains the main app tabs after logging in
const MainNavigator = ({ logout }) => {
  return (
    <Tab.Navigator
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: { 
          position: 'absolute', 
          elevation: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 0,
        },
        safeAreaInsets: { bottom: 0 }
      }}
    >
      <Tab.Screen name="Workout">
        {() => (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WorkoutHome" component={WorkoutScreen} />
            <Stack.Screen name="WeekdayDetails" component={WeekdayDetailsScreen} />
            <Stack.Screen name="AddExercise" component={AddExerciseScreen} />
            <Stack.Screen name="ExecuteWorkout" component={ExecuteWorkoutScreen} />
          </Stack.Navigator>
        )}
      </Tab.Screen>
      <Tab.Screen name="Exercises">
        {() => (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ExercisesList" component={ExercisesScreen} />
            <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} />
          </Stack.Navigator>
        )}
      </Tab.Screen>
      <Tab.Screen 
        name="Settings" 
        options={{ unmountOnBlur: true }}
      >
        {props => <SettingsScreen {...props} logout={logout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// This component contains the authentication screens (welcome, login, signup)
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

// This is the root component that contains both navigators
const RootNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const checkAuthStatus = async () => {
    try {
      const user = await account.get();
      console.log('User is logged in', user);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.log('User is not logged in', error);
      setIsLoggedIn(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a login function that can be passed down to children
  const handleLogin = async (email, password) => {
    try {
      // Delete any existing session
      try {
        await account.deleteSession('current');
      } catch (e) {
        // Ignore error if no session exists
      }
      
      // Create new session
      await account.createEmailSession(email, password);
      
      // Update auth state
      await checkAuthStatus();
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  // Create a logout function that can be passed down to children
  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      setIsLoggedIn(false);
      console.log('Logout successful');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
      return false;
    }
  };
  
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }
  
  // Provide auth context to all child components
  const authContext = {
    isLoggedIn,
    login: handleLogin,
    logout: handleLogout,
    refreshAuth: checkAuthStatus
  };
  
  return (
    <AuthContext.Provider value={authContext}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="AppTabs">
            {props => <MainNavigator {...props} logout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator;