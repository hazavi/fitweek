import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { account } from '../config/appwrite';
import { workoutService } from '../services/workoutService';

const WorkoutScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [weekdays, setWeekdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState('');

  // Default weekdays structure
  const defaultWeekdays = [
    { dayName: 'Monday', description: 'Back + Bicep', exerciseCount: 0, $id: 'monday' },
    { dayName: 'Tuesday', description: 'Shoulder + Arms', exerciseCount: 0, $id: 'tuesday' },
    { dayName: 'Wednesday', description: 'Lower body', exerciseCount: 0, $id: 'wednesday' },
    { dayName: 'Thursday', description: 'Push day', exerciseCount: 0, $id: 'thursday' },
    { dayName: 'Friday', description: 'Pull day', exerciseCount: 0, $id: 'friday' },
    { dayName: 'Saturday', description: 'Lower body', exerciseCount: 0, $id: 'saturday' },
    { dayName: 'Sunday', description: 'Rest Day', exerciseCount: 0, $id: 'sunday' },
  ];

  // Get current day name
  useEffect(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date().getDay();
    setCurrentDay(days[today]);
  }, []);

  // Function to fetch exercise counts for all weekdays
  const fetchExerciseCounts = async () => {
    try {
      const updatedWeekdays = [...defaultWeekdays];
      
      // For each weekday, fetch its exercises to get the count
      for (let weekday of updatedWeekdays) {
        try {
          const exercises = await workoutService.getWeekdayExercises(weekday.$id);
          weekday.exerciseCount = exercises.length;
        } catch (error) {
          console.error(`Error fetching exercises for ${weekday.dayName}:`, error);
          weekday.exerciseCount = 0; // Default to 0 if there's an error
        }
      }
      
      setWeekdays(updatedWeekdays);
    } catch (error) {
      console.error('Error fetching exercise counts:', error);
      setWeekdays(defaultWeekdays); // Use default weekdays if there's an error
    }
  };

  // Fetch user data once on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
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

  // Fetch exercise counts when screen is focused (using useFocusEffect)
  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchExerciseCounts().finally(() => setLoading(false));
      
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  // Handle press on a weekday
  const handleWeekdayPress = (weekday) => {
    // Pass the weekday data to the details screen
    navigation.navigate('WeekdayDetails', { weekday });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#222" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User profile */}
      <View style={styles.profileContainer}>
        <View style={styles.profileImageContainer}>
          <Ionicons name="person" size={32} color="#8A8DFF" />
        </View>
        <Text style={styles.username}>{user?.name || 'User'}</Text>
      </View>

      <Text style={styles.sectionTitle}>Weekly Plan</Text>
      
      <ScrollView style={styles.weekPlanContainer} showsVerticalScrollIndicator={false}>
        {weekdays.map((weekday) => (
          <TouchableOpacity 
            key={weekday.$id}
            style={[
              styles.dayCard, 
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
    padding: 20,
    marginBottom: 5,

    elevation: 2,
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