import React, { useEffect, useState, createContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, ActivityIndicator, View, Alert } from 'react-native';
import authService from './services/authService'; // Authentication service for login/logout
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

// Create navigators for app routing
const Tab = createBottomTabNavigator();  // Bottom tabs for main app sections
const Stack = createStackNavigator();    // Stack for screen-to-screen navigation

// Auth context provides login state across the app without prop drilling
export const AuthContext = createContext();

/**
 * MainNavigator - Tab navigation for authenticated users
 * Contains all main app features organized in tabs with custom styling
 */
const MainNavigator = ({ logout }) => {
  return (
    <Tab.Navigator
      tabBar={props => <FloatingTabBar {...props} />} // Custom floating tab bar component
      screenOptions={{
        headerShown: false,  // Hide default headers
        tabBarStyle: { 
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 0, // Custom tab bar handles sizing
        },
      }}
    >
      {/* Workout Tab with nested stack for related screens */}
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
 * AuthNavigator - Handles pre-login screens
 * Manages welcome, login and registration flow
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
 * RootNavigator - Main component controlling app navigation
 * Determines whether to show auth screens or main app based on login state
 * Provides authentication functions to all child components
 */
const RootNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Tracks authentication state
  const [isLoading, setIsLoading] = useState(true);     // Controls initial loading screen
  
  /**
   * Checks if user has an active session on app startup
   * Automatically logs in users with valid sessions
   * @returns {Promise<boolean>} True if user is logged in
   */
  const checkAuthStatus = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        console.log('User is logged in', user);
        setIsLoggedIn(true);
        return true;
      } else {
        console.log('User is not logged in');
        setIsLoggedIn(false);
        return false;
      }
    } catch (error) {
      console.log('Auth check failed', error);
      setIsLoggedIn(false);
      return false;
    } finally {
      setIsLoading(false); // Stop loading indicator regardless of outcome
    }
  };
  
  /**
   * Updates app state after successful login via AuthContext
   * Called from LoginScreen after authentication succeeds
   * @returns {Promise<boolean>} True if login successful
   */
  const handleLogin = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login state error:', error);
      return false;
    }
  };
  
  /**
   * Handles user logout process
   * Attempts service logout first, then updates app state
   * @returns {Promise<boolean>} True if logout successful
   */
  const handleLogout = async () => {
    try {
      try {
        await authService.logout(); // Try service logout first
      } catch (error) {
        // If service logout fails, continue with local state update
        console.log('Logout API error:', error.message);
      }
      
      // Always update local state regardless of service success
      setIsLoggedIn(false);
      return true;
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
      return false;
    }
  };
  
  // Check auth status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);
  
  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }
  
  // Auth context shared across the app
  const authContext = {
    isLoggedIn,
    login: handleLogin,
    logout: handleLogout,
    refreshAuth: checkAuthStatus
  };
  
  return (
    <AuthContext.Provider value={authContext}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Conditional navigation based on auth state */}
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