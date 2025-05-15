import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FloatingTabBar({ state, descriptors, navigation }) {
  // Get insets but only use them conditionally
  const insets = useSafeAreaInsets();
  
  // Define a fixed bottom margin instead of using insets
  const bottomMargin = 10; // Fixed value instead of insets.bottom

  return (
    <View style={[styles.container, { marginBottom: bottomMargin }]}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          
          // Render the appropriate icon based on the route name
          const renderIcon = () => {
            const activeColor = '#007BFF';
            const inactiveColor = '#888';
            const color = isFocused ? activeColor : inactiveColor;
            const size = 24;
            
            if (route.name === 'Workout') {
              return <FontAwesome6 name="dumbbell" size={size} color={color} />;
            } else if (route.name === 'Exercises') {
              return <FontAwesome name="folder" size={size} color={color} />;
            } else if (route.name === 'Settings') {
              return <Ionicons name="settings" size={size} color={color} />;
            }
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {renderIcon()}
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
    bottom: 0, // Direct bottom positioning
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
    elevation: 5,
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