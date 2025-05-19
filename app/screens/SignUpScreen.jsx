import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../index';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';

/**
 * SignUpScreen - User registration component
 * Collects user information and creates new accounts
 */
const SignUpScreen = () => {
  // Form state management
  const [name, setName] = useState('');          // User's full name
  const [email, setEmail] = useState('');        // User's email address
  const [password, setPassword] = useState('');  // User's password
  const [loading, setLoading] = useState(false); // Controls loading indicator
  const [showPassword, setShowPassword] = useState(false); // Toggles password visibility
  
  const navigation = useNavigation();
  const { refreshAuth } = useContext(AuthContext);
  
  /**
   * Toggles password field between visible and hidden
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  /**
   * Handles user registration with form validation
   * Connects to Appwrite backend via authService
   */
  const handleSignUp = async () => {
    // Input validation for required fields
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    // Password strength validation
    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Creating user account...");
      
      // Create account in Appwrite through authService
      const user = await authService.register(email, password, name);
      
      console.log('User created successfully', user);
      
      // Success notification and navigation to login
      Alert.alert(
        "Account Created",
        "Your account has been created successfully. Please login with your credentials.",
        [
          { 
            text: "OK", 
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      
      // Reset form fields after successful registration
      setName('');
      setEmail('');
      setPassword('');
      
    } catch (error) {
      // Error handling with user feedback
      console.error('Sign up error', error);
      Alert.alert('Sign Up Failed', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Sign Up</Text>
        
        {/* User input fields with appropriate keyboard types */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Lucifer"
            value={name}
            onChangeText={setName}
          />
        </View>

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

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="********"
              secureTextEntry={!showPassword}
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

        {/* Submit button with loading state */}
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.registerText}>Register</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;

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
  registerButton: {
    backgroundColor: '#222222',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});