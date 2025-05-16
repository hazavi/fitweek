import React, { useEffect, useState, createContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, ActivityIndicator, View, Alert } from 'react-native';
import { account } from './config/appwrite';
import FloatingTabBar from './components/FloatingTabBar';

// Import all screens needed for the app
import WorkoutScreen from './screens/WorkoutScreen';
import ExercisesScreen from './screens/ExercisesScreen';
import SettingsScreen from './screens/SettingsScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ExerciseDetailsScreen from './screens/ExerciseDetailsScreen';
import WeekdayDetailsScreen from './screens/WeekdayDetailsScreen';
import AddExerciseScreen from './screens/AddExerciseScreen';
import ExecuteWorkoutScreen from './screens/ExecuteWorkoutScreen';

// Create navigators - these help manage screen transitions and tab navigation
const Tab = createBottomTabNavigator();  // For bottom tabs like Workout, Exercises, Settings
const Stack = createStackNavigator();    // For screen-to-screen navigation (like pushing new screens)

// Create a context to share auth data - this lets any component access login state
// without passing props through every component in between
export const AuthContext = createContext();

/**
 * MainNavigator - Sets up the tab navigation structure for the logged-in experience
 * This appears after successful login and contains all the main app screens
 */
const MainNavigator = ({ logout }) => {
  return (
    // Setup the tab navigator with our custom floating tab bar
    <Tab.Navigator
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,  // Hide the default header
        tabBarShowLabel: false,  // Don't show text labels (we add these in our custom tab bar)
        tabBarStyle: { 
          position: 'absolute',  // Position absolute for floating effect
          elevation: 0,  // Remove default Android elevation
          backgroundColor: 'transparent',  // Transparent background
          borderTopWidth: 0,  // Remove default border
          height: 0,  // No height (our custom component handles this)
        },
        safeAreaInsets: { bottom: 0 }  // Handle safe area manually
      }}
    >
      {/* Workout Tab - This is the first tab for workout planning */}
      <Tab.Screen name="Workout">
        {() => (
          // Nested stack navigator for workout-related screens
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WorkoutHome" component={WorkoutScreen} />
            <Stack.Screen name="WeekdayDetails" component={WeekdayDetailsScreen} />
            <Stack.Screen name="AddExercise" component={AddExerciseScreen} />
            <Stack.Screen name="ExecuteWorkout" component={ExecuteWorkoutScreen} />
          </Stack.Navigator>
        )}
      </Tab.Screen>
      
      {/* Exercises Tab - Browse and view exercise details */}
      <Tab.Screen name="Exercises">
        {() => (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ExercisesList" component={ExercisesScreen} />
            <Stack.Screen name="ExerciseDetails" component={ExerciseDetailsScreen} />
          </Stack.Navigator>
        )}
      </Tab.Screen>
      
      {/* Settings Tab - User preferences and account options */}
      <Tab.Screen 
        name="Settings" 
        options={{ unmountOnBlur: true }}  // Rebuild this screen every time to ensure fresh data
      >
        {props => <SettingsScreen {...props} logout={logout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

/**
 * AuthNavigator - Handles the authentication flow (welcome, login, signup)
 * This appears when the user is not logged in
 */
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

/**
 * RootNavigator - The main component that manages authentication state
 * and decides whether to show login screens or the main app
 */
const RootNavigator = () => {
  // State variables to track authentication and loading status
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Is user logged in?
  const [isLoading, setIsLoading] = useState(true);     // Are we checking auth status?
  
  /**
   * Check if the user is already logged in by fetching their account
   * This runs when the app starts to restore the session if possible
   */
  const checkAuthStatus = async () => {
    try {
      // Try to get the current user - if successful, they're logged in
      const user = await account.get();
      console.log('User is logged in', user);
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      // If this fails, the user isn't logged in (or session expired)
      console.log('User is not logged in', error);
      setIsLoggedIn(false);
      return false;
    } finally {
      // Either way, we're done checking - stop showing the loading spinner
      setIsLoading(false);
    }
  };
  
  /**
   * Handle user login with email and password
   * Returns true on success, false on failure
   */
  const handleLogin = async (email, password) => {
    try {
      // First, try to delete any existing session (clean slate approach)
      try {
        await account.deleteSession('current');
      } catch (e) {
        // It's okay if this fails - just means there was no session to delete
      }
      
      // Create a new session with the provided credentials
      await account.createEmailSession(email, password);
      
      // Verify the login worked by checking auth status again
      await checkAuthStatus();
      return true;  // Login successful
    } catch (error) {
      // Something went wrong during login
      console.error('Login error:', error);
      return false;  // Login failed
    }
  };
  
  /**
   * Handle user logout by deleting their current session
   */
  const handleLogout = async () => {
    try {
      // Delete the current session from Appwrite
      await account.deleteSession('current');
      // Update our local state to reflect logged out status
      setIsLoggedIn(false);
      console.log('Logout successful');
      return true;
    } catch (error) {
      // Something went wrong during logout
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
      return false;
    }
  };
  
  // Check auth status when app starts - this is like an "auto-login" feature
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Show a loading spinner while checking if the user is logged in
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }
  
  // Package up all auth-related functions and state to share with components
  const authContext = {
    isLoggedIn,                  // Current login status
    login: handleLogin,          // Function to log in
    logout: handleLogout,        // Function to log out
    refreshAuth: checkAuthStatus // Function to refresh auth state
  };
  
  return (
    // Provide auth context to all child components
    <AuthContext.Provider value={authContext}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 
          Conditional rendering based on login status:
          - If logged in, show main app tabs
          - If not logged in, show auth screens
        */}
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