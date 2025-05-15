import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { workoutService } from '../services/workoutService';

const WeekdayDetailsScreen = ({ route }) => {
  const { weekday } = route.params;
  const navigation = useNavigation();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        // Get exercises for this weekday
        if (weekday && weekday.$id) {
          const exercisesData = await workoutService.getWeekdayExercises(weekday.$id);
          setExercises(exercisesData);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [weekday]);

  const handleAddExercise = () => {
    navigation.navigate('AddExercise', { weekdayId: weekday.$id });
  };

  const handleStartWorkout = () => {
    // Navigate to workout execution screen
    navigation.navigate('ExecuteWorkout', { weekday, exercises });
  };

  const handleDeleteExercise = async (exerciseId) => {
    try {
      await workoutService.deleteExerciseFromWeekday(exerciseId);
      // Refresh exercises list
      setExercises(exercises.filter(ex => ex.$id !== exerciseId));
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#000" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.dayTitle}>{weekday?.dayName || 'Day'}</Text>
        <Text style={styles.dayDescription}>{weekday?.description || ''}</Text>
      </View>

      {/* Exercise List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#222" />
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.exerciseList}
          renderItem={({ item }) => (
            <View style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseThumbnail}>
                  <Ionicons name="barbell-outline" size={24} color="#666" />
                </View>
                <View style={styles.exerciseTitleContainer}>
                  <Text style={styles.exerciseName}>{item.exerciseName}</Text>
                  <Text style={styles.exerciseCategory}>
                    {item.bodyPart} • {item.category}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteExercise(item.$id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                </TouchableOpacity>
              </View>
              
              {/* Display Sets */}
              {item.sets && item.sets.length > 0 ? (
                <View style={styles.setsContainer}>
                  <View style={styles.setsHeader}>
                    <Text style={styles.setsHeaderText}>Set</Text>
                    <Text style={styles.setsHeaderText}>Reps</Text>
                    <Text style={styles.setsHeaderText}>Weight (kg)</Text>
                  </View>
                  
                  {item.sets.map((set) => (
                    <View key={set.$id} style={styles.setRow}>
                      <Text style={styles.setCell}>{set.setNumber}</Text>
                      <Text style={styles.setCell}>{set.reps}</Text>
                      <Text style={styles.setCell}>{set.weight}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noSetsText}>No sets configured</Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No exercises added yet</Text>
            </View>
          }
        />
      )}
      
      {/* Add Exercise Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddExercise}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Start Workout Button */}
      {exercises.length > 0 && (
        <TouchableOpacity 
          style={styles.startWorkoutButton}
          onPress={handleStartWorkout}
        >
          <Text style={styles.startWorkoutText}>Start Workout</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default WeekdayDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  dayTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dayDescription: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseList: {
    paddingBottom: 100,
  },
  exerciseCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseTitleContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseCategory: {
    fontSize: 13,
    color: '#666',
  },
  deleteButton: {
    padding: 5,
  },
  setsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  setsHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  setsHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#555',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  setCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
  },
  noSetsText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    bottom: 170,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startWorkoutButton: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#1E0371',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  startWorkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});