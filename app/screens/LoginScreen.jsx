import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../index'; // Import the auth context
import { Ionicons } from '@expo/vector-icons';

/**
 * LoginScreen - Handles user authentication
 * Allows users to log in to their account with email and password
 */
const LoginScreen = () => {
  // State variables for form fields and UI
  const [email, setEmail] = useState('');          // User's email
  const [password, setPassword] = useState('');    // User's password
  const [loading, setLoading] = useState(false);   // Loading state for API calls
  const [showPassword, setShowPassword] = useState(false); // Controls password visibility
  
  const navigation = useNavigation();
  
  // Get login function from the authentication context
  const { login } = useContext(AuthContext);
  
  /**
   * Toggle password visibility between hidden and visible
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  /**
   * Handle login form submission
   */
  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call login function from AuthContext
      const success = await login(email, password);
      
      // Show error if login failed
      if (!success) {
        alert('Login failed. Please check your credentials and try again.');
      }
      // No need to navigate - the root navigator will handle it based on isLoggedIn state
    } catch (error) {
      // Handle any errors during login
      console.error('Login error:', error);
      alert('Login failed: ' + (error.message || 'Unknown error occurred'));
    } finally {
      setLoading(false); // Always stop loading indicator
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button to return to welcome screen */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Screen title */}
        <Text style={styles.title}>Login</Text>
        
        {/* Email input field */}
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

        {/* Password input field with visibility toggle */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="********"
              secureTextEntry={!showPassword} // Toggle based on state
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

        {/* Login button - shows loading spinner when processing */}
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

        {/* Forgot password link */}
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