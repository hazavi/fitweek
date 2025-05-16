import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { account } from '../config/appwrite';
import { workoutService } from '../services/workoutService';

/**
 * WorkoutScreen - The main screen showing the weekly workout schedule
 * Users can see all days of the week and select a day to view/edit exercises
 */
const WorkoutScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);         // Current logged in user
  const [weekdays, setWeekdays] = useState([]);   // List of all weekdays with their workouts
  const [loading, setLoading] = useState(true);   // Loading state for API calls
  const [currentDay, setCurrentDay] = useState(''); // Today's day name (e.g., "Monday")

  // Default weekdays structure - used as fallback and for new users
  const defaultWeekdays = [
    { dayName: 'Monday', description: 'Back + Bicep', exerciseCount: 0, $id: 'monday' },
    { dayName: 'Tuesday', description: 'Shoulder + Arms', exerciseCount: 0, $id: 'tuesday' },
    { dayName: 'Wednesday', description: 'Lower body', exerciseCount: 0, $id: 'wednesday' },
    { dayName: 'Thursday', description: 'Push day', exerciseCount: 0, $id: 'thursday' },
    { dayName: 'Friday', description: 'Pull day', exerciseCount: 0, $id: 'friday' },
    { dayName: 'Saturday', description: 'Lower body', exerciseCount: 0, $id: 'saturday' },
    { dayName: 'Sunday', description: 'Rest Day', exerciseCount: 0, $id: 'sunday' },
  ];

  // Get current day name when component mounts
  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();  // 0 = Sunday, 1 = Monday, etc.
    setCurrentDay(days[today]);
  }, []);

  /**
   * Ensures the user has weekdays setup in the database
   * Creates default weekdays if none exist
   */
  const ensureWeekdaysExist = async (userId) => {
    try {
      // Check if user already has weekdays
      let userWeekdays;
      try {
        userWeekdays = await workoutService.getUserWeekdays(userId);
      } catch (error) {
        console.log('Error checking for existing weekdays:', error);
        userWeekdays = [];
      }

      // Create defaults if none exist or fewer than expected
      if (!userWeekdays || userWeekdays.length < 7) {
        console.log('Creating initial weekdays for user:', userId);
        await workoutService.createInitialWeekdays(userId);
        
        // Fetch the newly created weekdays
        userWeekdays = await workoutService.getUserWeekdays(userId);
      }
      
      return userWeekdays;
    } catch (error) {
      console.error('Error ensuring weekdays exist:', error);
      return [];
    }
  };

  /**
   * Fetches weekdays with their exercise counts
   * This gives us the data needed to show how many exercises are in each day
   */
  const fetchWeekdaysWithExerciseCounts = async (userId) => {
    try {
      // First ensure the user has weekdays set up
      const userWeekdays = await ensureWeekdaysExist(userId);
      
      if (userWeekdays && userWeekdays.length > 0) {
        // Return user's weekdays (they include exercise counts)
        return userWeekdays;
      } else {
        console.warn('No weekdays found for user, using defaults');
        return defaultWeekdays;
      }
    } catch (error) {
      console.error('Error fetching weekdays with exercise counts:', error);
      return defaultWeekdays; // Fallback to defaults if there's an error
    }
  };

  // Fetch user data once when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user from Appwrite
        const userData = await account.get();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch weekdays whenever screen gains focus or user changes
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (user && user.$id) {
          setLoading(true);
          try {
            const fetchedWeekdays = await fetchWeekdaysWithExerciseCounts(user.$id);
            setWeekdays(fetchedWeekdays);
          } catch (error) {
            console.error('Error loading weekdays:', error);
            setWeekdays(defaultWeekdays);
          } finally {
            setLoading(false);
          }
        }
      };
      
      loadData();
    }, [user])
  );

  // Navigate to weekday details screen when a day is tapped
  const handleWeekdayPress = (weekday) => {
    navigation.navigate('WeekdayDetails', { weekday });
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#222" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User profile section at top */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Ionicons name="person" size={32} color="#8A8DFF" />
        </View>
        <Text style={styles.username}>{user?.name || 'User'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Weekly Plan</Text>
      
      {/* Scrollable list of weekdays */}
      <ScrollView style={styles.weekPlanContainer} showsVerticalScrollIndicator={false}>
        {weekdays.map((weekday) => (
          <TouchableOpacity 
            key={weekday.$id}
            style={[
              styles.dayCard, 
              // Highlight current day of the week
              currentDay === weekday.dayName && styles.currentDayCard
            ]}
            onPress={() => handleWeekdayPress(weekday)}
          >
            <View style={styles.dayIconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#000" />
            </View>
            <View style={styles.dayInfo}>
              <Text style={styles.dayName}>{weekday.dayName}</Text>
              <Text style={styles.dayDescription}>{weekday.description || 'Rest Day'}</Text>
            </View>
            <View style={styles.exerciseCount}>
              <Ionicons name="barbell-outline" size={18} color="#666" />
              <Text style={styles.exerciseCountText}>{weekday.exerciseCount || 0} Exercises</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default WorkoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 10,

  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: '#F0F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  username: {
    fontSize: 20,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  weekPlanContainer: {
    flex: 1,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 5,
    elevation: 0,
  },
  currentDayCard: {
    backgroundColor: '#E8FFF0',
    borderLeftWidth: 0,
    borderLeftColor: '#4CAF50',
  },
  dayIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayDescription: {
    fontSize: 14,
    color: '#666',
  },
  exerciseCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  exerciseCountText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});