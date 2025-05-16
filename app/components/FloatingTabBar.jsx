import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * A custom tab bar that floats at the bottom of the screen
 */
function FloatingTabBar({ state, descriptors, navigation }) {
  // Get safe area insets for devices with notches or home indicators
  const insets = useSafeAreaInsets();
  
  // Use a fixed margin instead of dynamic insets for consistent appearance
  const bottomMargin = 3;

  return (
    <View style={[styles.container, { marginBottom: bottomMargin }]}>
      <View style={styles.tabBar}>
        {/* Loop through each tab and create a button for it */}
        {state.routes.map((route, index) => {
          // Get the configuration options for this tab
          const { options } = descriptors[route.key];
          
          // Determine what text to show (use label, title, or route name in that order)
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          // Check if this is the currently active tab
          const isFocused = state.index === index;
          
          // Choose the right icon based on which tab this is
          const renderIcon = () => {
            // Use blue for active tab, gray for inactive
            const activeColor = '#007BFF';
            const inactiveColor = '#888';
            const color = isFocused ? activeColor : inactiveColor;
            const size = 24;
            
            // Return the appropriate icon based on tab name
            if (route.name === 'Workout') {
              return <FontAwesome6 name="dumbbell" size={size} color={color} />;
            } else if (route.name === 'Exercises') {
              return <FontAwesome name="folder" size={size} color={color} />;
            } else if (route.name === 'Settings') {
              return <Ionicons name="settings" size={size} color={color} />;
            }
          };

          // Handle tab press
          const onPress = () => {
            // Create a navigation event (allows intercepting navigation if needed)
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            // If not already on this tab and nothing prevented navigation, go to this tab
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Return the tab button
          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7} // Slight feedback when pressed
            >
              {/* Show the tab icon */}
              {renderIcon()}
              
              {/* Show the tab name */}
              <Text style={{ 
                color: isFocused ? '#007BFF' : '#888',
                fontSize: 12,
                marginTop: 4
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    height: 70,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 1,
    elevation: 1,
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
});

export default FloatingTabBar;