import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * WelcomeScreen - The initial landing page for the app
 * Shows app branding and login/signup options
 */
const WelcomeScreen = () => {
  const navigation = useNavigation();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* App logo/illustration */}
        <Image 
          source={require('../assets/workout-illustration.png')} 
          style={styles.image}
          resizeMode="contain"
        />
        
        {/* App name */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.titleBold}>FitWeek</Text>
        </View>

        {/* Authentication buttons */}
        <View style={styles.buttonContainer}>
          {/* Login button */}
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
          
          {/* Sign up button */}
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: '80%',
    height: '40%',
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
  },
  titleBold: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#26169A',
    width: '80%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  signupButton: {
    borderColor: '#26169A',
    borderWidth: 2,
    width: '80%',
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  signupText: {
    color: '#26169A',
    fontSize: 18,
    fontWeight: '600',
  },
});