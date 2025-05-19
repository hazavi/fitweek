import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../index';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService'; // Import authService

/**
 * LoginScreen - Where users log into their accounts
 * Handles email/password login and error messages
 */
const LoginScreen = () => {
  // Store what the user types and UI states
  const [email, setEmail] = useState('');          // Where user types email
  const [password, setPassword] = useState('');    // Where user types password
  const [loading, setLoading] = useState(false);   // Shows spinner while logging in
  const [showPassword, setShowPassword] = useState(false); // Controls if password is visible
  
  const navigation = useNavigation();
  
  // Get login functions from main app
  const { login, refreshAuth } = useContext(AuthContext);
  
  /**
   * Switches between showing and hiding password text
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  /**
   * Handles the login button press
   * Checks inputs, calls the auth service, and shows errors if needed
   */
  const handleLogin = async () => {
    // Make sure email and password are filled in
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    // Show loading spinner
    setLoading(true);
    
    try {
      // First check if user is already logged in
      const hasSession = await authService.hasActiveSession();
      
      if (hasSession) {
        console.log('Already logged in, refreshing app state');
        // Just update the app state
        await refreshAuth();
      } else {
        // Try to log in with the entered email and password
        await authService.login(email, password);
        
        // Update the app to show logged-in screens
        await login();
      }
      
      console.log('Login successful');
    } catch (error) {
      // Show different error messages based on what went wrong
      if (error.code === 429) {
        Alert.alert('Too Many Attempts', 'Please try again later');
      } else if (error.code === 401) {
        Alert.alert('Login Failed', 'Wrong email or password');
      } else {
        console.error('Login error:', error);
        Alert.alert('Login Failed', error.message || 'Something went wrong');
      }
    } finally {
      // Hide the loading spinner
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button to go to welcome screen */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Page title */}
        <Text style={styles.title}>Login</Text>
        
        {/* Email input box */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@tec.dk"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password input box with eye button */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="********"
              secureTextEntry={!showPassword} // Hide text if showPassword is false
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={togglePasswordVisibility}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={24} 
                color="#777" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login button - shows spinner when working */}
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.loginText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Password reset option */}
        <TouchableOpacity
          onPress={() => alert('Password reset feature would go here')}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  // New styles for password input with eye icon
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: '#222222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotText: {
    textAlign: 'center',
    color: '#333',
    textDecorationLine: 'underline',
  }
});