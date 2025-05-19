import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { account } from '../config/appwrite';
import { workoutService } from '../services/workoutService';

/**
 * WorkoutScreen - Main screen showing the weekly workout schedule
 * Displays a calendar-style view of all workout days with exercise counts
 * Highlights the current day and allows navigation to detailed day views
 */
const WorkoutScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);         // Current authenticated user
  const [weekdays, setWeekdays] = useState([]);   // Weekly workout schedule data
  const [loading, setLoading] = useState(true);   // Controls loading indicator 
  const [currentDay, setCurrentDay] = useState(''); // Today's day name for highlighting

  /**
   * Default workout templates for each day of the week
   * Used for new users or as fallback when database fetch fails
   */
  const defaultWeekdays = [
    { dayName: 'Monday', description: 'Back + Bicep', exerciseCount: 0, $id: 'monday' },
    { dayName: 'Tuesday', description: 'Shoulder + Arms', exerciseCount: 0, $id: 'tuesday' },
    { dayName: 'Wednesday', description: 'Lower body', exerciseCount: 0, $id: 'wednesday' },
    { dayName: 'Thursday', description: 'Push day', exerciseCount: 0, $id: 'thursday' },
    { dayName: 'Friday', description: 'Pull day', exerciseCount: 0, $id: 'friday' },
    { dayName: 'Saturday', description: 'Lower body', exerciseCount: 0, $id: 'saturday' },
    { dayName: 'Sunday', description: 'Rest Day', exerciseCount: 0, $id: 'sunday' },
  ];

  /**
   * Determines the current day of week when component mounts
   * Used to highlight today's workout in the UI for better UX
   */
  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();  // 0=Sunday through 6=Saturday
    setCurrentDay(days[today]);
  }, []);

  /**
   * Creates default weekdays for new users if they don't exist yet
   * Ensures every user has a complete 7-day workout template
   * 
   * @param {string} userId - Current user's ID for database operations
   * @returns {Promise<Array>} - Array of weekday objects
   */
  const ensureWeekdaysExist = async (userId) => {
    try {
      // First try to fetch user's existing weekdays
      let userWeekdays;
      try {
        userWeekdays = await workoutService.getUserWeekdays(userId);
      } catch (error) {
        console.log('Error checking weekdays:', error);
        userWeekdays = [];
      }

      // Create default weekdays if needed (new user or incomplete data)
      if (!userWeekdays || userWeekdays.length < 7) {
        console.log('Creating initial weekdays for user:', userId);
        await workoutService.createInitialWeekdays(userId);
        userWeekdays = await workoutService.getUserWeekdays(userId);
      }
      
      return userWeekdays;
    } catch (error) {
      console.error('Error in weekday setup:', error);
      return [];
    }
  };

  /**
   * Fetches weekdays with exercise counts for the current user
   * This data shows how many exercises are planned for each day
   * 
   * @param {string} userId - Current user's ID
   * @returns {Promise<Array>} - Weekdays with their exercise counts
   */
  const fetchWeekdaysWithExerciseCounts = async (userId) => {
    try {
      const userWeekdays = await ensureWeekdaysExist(userId);
      return userWeekdays?.length > 0 ? userWeekdays : defaultWeekdays;
    } catch (error) {
      console.error('Error fetching workout data:', error);
      return defaultWeekdays; // Fallback to default template on error
    }
  };

  /**
   * Fetches current user data on component mount
   * Required for personalization and workout data association
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await account.get();
        setUser(userData);
      } catch (error) {
        console.error('User fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  /**
   * Refreshes workout data when screen is focused or user changes
   * Ensures workout data stays current after additions/modifications
   */
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (user?.$id) {
          setLoading(true);
          try {
            const fetchedWeekdays = await fetchWeekdaysWithExerciseCounts(user.$id);
            setWeekdays(fetchedWeekdays);
          } catch (error) {
            console.error('Weekday load error:', error);
            setWeekdays(defaultWeekdays);
          } finally {
            setLoading(false);
          }
        }
      };
      
      loadData();
    }, [user])
  );

  /**
   * Navigates to detailed view when a day is selected
   * @param {Object} weekday - The selected day's data
   */
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