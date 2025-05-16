import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

/**
 * ExecuteWorkoutScreen - Guides the user through their workout
 * Shows exercises and sets with tracking for completion
 */
const ExecuteWorkoutScreen = ({ route }) => {
  // Get data passed from previous screen
  const { weekday, exercises } = route.params;
  const navigation = useNavigation();
  
  // Track which exercises and sets have been completed
  const [completedExercises, setCompletedExercises] = useState([]);
  const [completedSets, setCompletedSets] = useState({});

  /**
   * Toggle a set's completion status
   * @param {string} exerciseId - The ID of the exercise
   * @param {string} setId - The ID of the set
   */
  const handleMarkSetComplete = (exerciseId, setId) => {
    setCompletedSets(prev => {
      const exerciseSets = prev[exerciseId] || [];
      
      if (exerciseSets.includes(setId)) {
        // Remove set if already completed
        return {
          ...prev,
          [exerciseId]: exerciseSets.filter(id => id !== setId)
        };
      } else {
        // Add set if not completed
        return {
          ...prev,
          [exerciseId]: [...exerciseSets, setId]
        };
      }
    });
  };

  /**
   * Toggle an exercise's completion status
   * Marks all sets as complete/incomplete
   * @param {string} exerciseId - The ID of the exercise
   */
  const handleMarkExerciseComplete = (exerciseId) => {
    if (completedExercises.includes(exerciseId)) {
      // If already complete, mark as incomplete
      setCompletedExercises(completedExercises.filter(id => id !== exerciseId));
      // Also clear all completed sets for this exercise
      setCompletedSets(prev => {
        const updated = { ...prev };
        delete updated[exerciseId];
        return updated;
      });
    } else {
      // Mark as complete
      setCompletedExercises([...completedExercises, exerciseId]);
      // Mark all sets as completed
      const exercise = exercises.find(e => e.$id === exerciseId);
      if (exercise && exercise.sets) {
        setCompletedSets(prev => ({
          ...prev,
          [exerciseId]: exercise.sets.map(set => set.$id)
        }));
      }
    }
  };

  /**
   * Check if all sets of an exercise are completed
   * @param {string} exerciseId - The ID of the exercise
   * @param {Array} sets - The sets belonging to the exercise
   * @return {boolean} - True if all sets are complete
   */
  const isExerciseComplete = (exerciseId, sets) => {
    if (!sets || sets.length === 0) return completedExercises.includes(exerciseId);
    
    const completedSetsForExercise = completedSets[exerciseId] || [];
    return sets.every(set => completedSetsForExercise.includes(set.$id));
  };

  /**
   * Calculate the completion progress as a ratio (0 to 1)
   * @param {string} exerciseId - The ID of the exercise
   * @param {Array} sets - The sets belonging to the exercise
   * @return {number} - Ratio of completed sets (0 to 1)
   */
  const getExerciseProgress = (exerciseId, sets) => {
    if (!sets || sets.length === 0) {
      return completedExercises.includes(exerciseId) ? 1 : 0;
    }
    
    const completedSetsForExercise = completedSets[exerciseId] || [];
    const completedCount = sets.filter(set => completedSetsForExercise.includes(set.$id)).length;
    return completedCount / sets.length;
  };

  /**
   * Finish the workout and return to home screen
   */
  const handleFinishWorkout = () => {
    Alert.alert(
      "Workout Completed",
      "Great job! You've completed your workout.",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("WorkoutHome")
        }
      ]
    );
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
        <Text style={styles.title}>{weekday?.dayName || 'Workout'}</Text>
        <Text style={styles.subtitle}>{weekday?.description || ''}</Text>
      </View>

      {/* Exercise List */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={styles.exercisesList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          // Calculate completion state for this exercise
          const isComplete = isExerciseComplete(item.$id, item.sets);
          const progress = getExerciseProgress(item.$id, item.sets);
          
          return (
            <View style={[
              styles.exerciseCard,
              isComplete && styles.completedExerciseCard
            ]}>
              {/* Exercise Header */}
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseName}>{item.exerciseName}</Text>
                <TouchableOpacity
                  style={[
                    styles.checkButton,
                    isComplete && styles.checkedButton
                  ]}
                  onPress={() => handleMarkExerciseComplete(item.$id)}
                >
                  {isComplete ? (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  ) : (
                    <Text style={styles.checkButtonText}>Complete All</Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Progress bar - shows visual completion progress */}
              {(item.sets && item.sets.length > 0) && (
                <View style={styles.progressBarContainer}>
                  <View style={[
                    styles.progressBar, 
                    { width: `${progress * 100}%` }
                  ]} />
                </View>
              )}
              
              {/* Sets list - shows each set with reps and weight */}
              {(item.sets && item.sets.length > 0) ? (
                <View style={styles.setsContainer}>
                  {/* Table header */}
                  <View style={styles.setsTableHeader}>
                    <Text style={[styles.setHeaderCell, { flex: 0.2 }]}>Set</Text>
                    <Text style={[styles.setHeaderCell, { flex: 0.4 }]}>Reps</Text>
                    <Text style={[styles.setHeaderCell, { flex: 0.4 }]}>Weight (kg)</Text>
                    <Text style={[styles.setHeaderCell, { width: 50 }]}></Text>
                  </View>
                  
                  {/* Individual sets */}
                  {item.sets.map(set => {
                    const setCompleted = (completedSets[item.$id] || []).includes(set.$id);
                    
                    return (
                      <View 
                        key={set.$id} 
                        style={[
                          styles.setRow,
                          setCompleted && styles.completedSetRow
                        ]}
                      >
                        <Text style={[styles.setCell, { flex: 0.2 }]}>{set.setNumber}</Text>
                        <Text style={[styles.setCell, { flex: 0.4 }]}>{set.reps}</Text>
                        <Text style={[styles.setCell, { flex: 0.4 }]}>{set.weight}</Text>
                        <TouchableOpacity 
                          style={[styles.setCheckBox, setCompleted && styles.setCheckBoxCompleted]}
                          onPress={() => handleMarkSetComplete(item.$id, set.$id)}
                        >
                          {setCompleted && (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.noSetsContainer}>
                  <Text style={styles.noSetsText}>No sets defined</Text>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No exercises added to this day</Text>
          </View>
        }
      />

      {/* Finish Workout Button */}
      <TouchableOpacity 
        style={styles.finishButton}
        onPress={handleFinishWorkout}
      >
        <Text style={styles.finishButtonText}>Finish Workout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ExecuteWorkoutScreen;

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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  exercisesList: {
    paddingBottom: 100,
  },
  exerciseCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  completedExerciseCard: {
    backgroundColor: '#e8f5e9', // Light green for completed exercises
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  checkButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  checkedButton: {
    backgroundColor: '#4CAF50',
  },
  checkButtonText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 12,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  setsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  setsTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    alignItems: 'center',
  },
  setHeaderCell: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  completedSetRow: {
    backgroundColor: '#f3f9f4', // Very light green for completed sets
  },
  setCell: {
    fontSize: 16,
    textAlign: 'center',
  },
  setCheckBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  setCheckBoxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  noSetsContainer: {
    padding: 15,
    alignItems: 'center',
  },
  noSetsText: {
    color: '#999',
    fontStyle: 'italic',
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
  finishButton: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: '#1E0371',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});