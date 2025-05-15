import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { account, ID } from '../config/appwrite';
import { AuthContext } from '../index';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the eye icon

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const navigation = useNavigation();
  const { refreshAuth } = useContext(AuthContext);
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSignUp = async () => {
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Creating user account...");
      
      // Create user account
      const user = await account.create(
        ID.unique(),
        email,
        password,
        name
      );
      
      console.log('User created successfully', user);
      
      // Show success alert and navigate to login
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
      
      // Clear form fields
      setName('');
      setEmail('');
      setPassword('');
      
    } catch (error) {
      console.error('Sign up error', error);
      Alert.alert('Sign Up Failed', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Screen title */}
        <Text style={styles.title}>Sign Up</Text>
        
        {/* Name input field */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Lucifer"
            value={name}
            onChangeText={setName}
          />
        </View>

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

        {/* Password input field */}
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

        {/* Register button */}
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