import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * SettingsScreen - Displays user settings and logout options
 * Contains different configuration options and account management
 */
const SettingsScreen = ({ logout }) => {
  /**
   * Handle user logout
   * Calls the logout function passed from RootNavigator
   */
  const handleLogout = async () => {
    try {
      // Call the logout function passed from RootNavigator
      await logout();
      // No need for navigation here, the RootNavigator will handle it
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Settings Menu Items */}
      <View style={styles.menuContainer}>
        {/* Profile Option */}
        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Profile', 'Profile settings coming soon!')}>
          <Ionicons name="person-outline" size={24} color="black" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        {/* Themes Option - Toggle between light and dark mode */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => Alert.alert('Themes', 'Theme settings coming soon!')}
        >
          <Ionicons name="contrast-outline" size={24} color="black" />
          <Text style={styles.menuText}>Themes</Text>
          <View style={styles.themeSelectionContainer}>
            <Text style={styles.themeValueText}>Light</Text>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  menuContainer: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 18,
    marginLeft: 15,
    flex: 1,
  },
  // New styles for theme selection UI
  themeSelectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeValueText: {
    fontSize: 16,
    color: '#888',
    marginRight: 5,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#D32F2F',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});