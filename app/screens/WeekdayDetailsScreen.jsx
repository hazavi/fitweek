import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator,
  TextInput,
  Alert,
  Modal
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { workoutService } from '../services/workoutService';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * WeekdayDetailsScreen - Shows and manages exercises for a specific day
 * Allows adding/removing exercises and configuring sets
 */
const WeekdayDetailsScreen = ({ route }) => {
  // Get the weekday data passed from the previous screen
  const { weekday } = route.params;
  const navigation = useNavigation();
  
  // State variables to manage screen data and UI
  const [exercises, setExercises] = useState([]);  // List of exercises for this day
  const [loading, setLoading] = useState(true);    // Loading indicator state
  const [editingDescription, setEditingDescription] = useState(false); // Whether description is being edited
  const [weekdayDescription, setWeekdayDescription] = useState(weekday?.description || '');
  const [addSetModalVisible, setAddSetModalVisible] = useState(false); // Controls set add modal
  const [currentExercise, setCurrentExercise] = useState(null);  // Exercise being modified
  const [newSetReps, setNewSetReps] = useState('');  // Reps count for new set
  const [newSetWeight, setNewSetWeight] = useState(''); // Weight for new set
  
  // Ref to track open swipeable rows (for delete functionality)
  const swipeableRefs = useRef({});

  // Fetch exercises when component mounts or weekday changes
  useEffect(() => {
    const fetchExercises = async () => {
      try {
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

  // Function to refresh exercise list data
  const refreshExercises = async () => {
    try {
      setLoading(true);
      if (weekday && weekday.$id) {
        const exercisesData = await workoutService.getWeekdayExercises(weekday.$id);
        setExercises(exercisesData);
      }
    } catch (error) {
      console.error('Error refreshing exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to add exercise screen
  const handleAddExercise = () => {
    navigation.navigate('AddExercise', { weekdayId: weekday.$id });
  };

  // Navigate to workout execution screen
  const handleStartWorkout = () => {
    navigation.navigate('ExecuteWorkout', { weekday, exercises });
  };

  // Delete an exercise from this day
  const handleDeleteExercise = async (exerciseId) => {
    try {
      // Vibrate to give feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      await workoutService.deleteExerciseFromWeekday(exerciseId);
      // Update the local list by removing the deleted exercise
      setExercises(exercises.filter(ex => ex.$id !== exerciseId));
    } catch (error) {
      console.error('Error deleting exercise:', error);
      Alert.alert('Error', 'Failed to delete exercise');
    }
  };
  
  // Navigate to exercise details
  const handleViewExerciseDetails = (exercise) => {
    // Navigate to the Exercises tab first, then to the ExerciseDetails screen
    navigation.navigate('Exercises', {
      screen: 'ExerciseDetails',
      params: {
        exerciseId: exercise.exerciseId,
        exercise: {
          $id: exercise.exerciseId,
          name: exercise.exerciseName || "Exercise",
          bodyPart: exercise.bodyPart || "",
          category: exercise.category || ""
        }
      }
    });
  };
  
  // Update the description text for this day
  const handleUpdateDescription = async () => {
    try {
      // Update the description in the database
      await workoutService.updateWeekdayDescription(weekday.$id, weekdayDescription);
      
      // Update the local state for the weekday
      const updatedWeekday = {...weekday, description: weekdayDescription};
      route.params.weekday = updatedWeekday;
      
      setEditingDescription(false);
    } catch (error) {
      console.error('Error updating description:', error);
      Alert.alert('Error', 'Failed to update description');
    }
  };
  
  // Add a new set to an exercise
  const handleAddSet = () => {
    if (!currentExercise) return;
    
    if (!newSetReps || !newSetWeight) {
      Alert.alert('Error', 'Please enter both reps and weight');
      return;
    }
    
    const addSet = async () => {
      try {
        // Add set to the exercise in the database
        await workoutService.addSetToExercise(
          currentExercise.$id,
          parseInt(newSetReps),
          parseFloat(newSetWeight)
        );
        
        // Clear form and close modal
        setNewSetReps('');
        setNewSetWeight('');
        setAddSetModalVisible(false);
        
        // Refresh exercises to show the new set
        refreshExercises();
      } catch (error) {
        console.error('Error adding set:', error);
        Alert.alert('Error', 'Failed to add set');
      }
    };
    
    addSet();
  };
  
  // Open the modal to add a set to an exercise
  const openAddSetModal = (exercise) => {
    setCurrentExercise(exercise);
    setAddSetModalVisible(true);
  };
  
  // Close all other swipeables when opening a new one
  // This prevents multiple swipeable rows being open at once
  const closeOtherSwipeables = (id) => {
    Object.keys(swipeableRefs.current).forEach(key => {
      if (key !== id && swipeableRefs.current[key]) {
        swipeableRefs.current[key].close();
      }
    });
  };

  // Render the delete action for swipe gestures
  const renderRightActions = (exerciseId) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDeleteExercise(exerciseId)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteActionText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  // Refresh exercises when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshExercises();
      return () => {};
    }, [weekday])
  );

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

      {/* Header with day name and description */}
      <View style={styles.header}>
        <Text style={styles.dayTitle}>{weekday?.dayName || 'Day'}</Text>
        
        {/* Description area - shows edit form or text based on state */}
        {editingDescription ? (
          <View style={styles.descriptionEditContainer}>
            <TextInput
              style={styles.descriptionInput}
              value={weekdayDescription}
              onChangeText={setWeekdayDescription}
              placeholder="Add description/note"
              autoFocus
            />
            <TouchableOpacity onPress={handleUpdateDescription} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => setEditingDescription(true)}
            style={styles.descriptionContainer}
          >
            <Text style={styles.dayDescription}>
              {weekdayDescription || 'Tap to add description'}
            </Text>
            <Ionicons name="create-outline" size={16} color="#777" style={styles.editIcon} />
          </TouchableOpacity>
        )}
      </View>

      {/* Exercise List - shows loading spinner or list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E0371" />
        </View>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.exerciseList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Swipeable
              ref={(ref) => {
                if (ref && item.$id) {
                  swipeableRefs.current[item.$id] = ref;
                }
              }}
              onSwipeableOpen={() => closeOtherSwipeables(item.$id)}
              renderRightActions={() => renderRightActions(item.$id)}
              rightThreshold={40}
              containerStyle={styles.swipeableContainer}
            >
              <TouchableOpacity
                style={styles.exerciseCard}
                onPress={() => handleViewExerciseDetails(item)}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#f8f9fa', '#edf1f7']}
                  style={styles.exerciseCardGradient}
                >
                  {/* Exercise header with name and category */}
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseThumbnail}>
                      <Ionicons name="barbell-outline" size={24} color="#555" />
                    </View>
                    <View style={styles.exerciseTitleContainer}>
                      <Text style={styles.exerciseName}>{item.exerciseName}</Text>
                      <Text style={styles.exerciseCategory}>
                        {item.bodyPart} • {item.category}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Display Sets - either existing sets or "no sets" message */}
                  {item.sets && item.sets.length > 0 ? (
                    <View style={styles.setsContainer}>
                      <View style={styles.setsHeader}>
                        <Text style={styles.setsHeaderText}>Set</Text>
                        <Text style={styles.setsHeaderText}>Reps</Text>
                        <Text style={styles.setsHeaderText}>Weight (kg)</Text>
                      </View>
                      
                      {/* Map through each set and show its details */}
                      {item.sets.map((set) => (
                        <View key={set.$id} style={styles.setRow}>
                          <Text style={styles.setCell}>{set.setNumber}</Text>
                          <Text style={styles.setCell}>{set.reps}</Text>
                          <Text style={styles.setCell}>{set.weight}</Text>
                        </View>
                      ))}
                      
                      {/* Button to add another set */}
                      <TouchableOpacity
                        style={styles.addSetRow}
                        onPress={() => openAddSetModal(item)}
                      >
                        <Ionicons name="add-circle-outline" size={18} color="#1E0371" />
                        <Text style={styles.addSetText}>Add Set</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.noSetsContainer}>
                      <Text style={styles.noSetsText}>No sets configured</Text>
                      <TouchableOpacity 
                        style={styles.addFirstSetButton}
                        onPress={() => openAddSetModal(item)}
                      >
                        <Ionicons name="add-circle-outline" size={18} color="#1E0371" />
                        <Text style={styles.addSetText}>Add Set</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Swipeable>
          )}
          ListEmptyComponent={
            // Show when no exercises are added
            <View style={styles.emptyContainer}>
              <Ionicons name="barbell-outline" size={60} color="#ddd" />
              <Text style={styles.emptyText}>No exercises added yet</Text>
              <Text style={styles.emptySubtext}>
                Start building your workout by adding exercises
              </Text>
            </View>
          }
        />
      )}
      
      {/* Floating button to add new exercise */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddExercise}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Start Workout Button - only visible when exercises exist */}
      {exercises.length > 0 && (
        <TouchableOpacity 
          style={styles.startWorkoutButton}
          onPress={handleStartWorkout}
        >
          <Ionicons name="play" size={20} color="#fff" style={styles.playIcon} />
          <Text style={styles.startWorkoutText}>Start Workout</Text>
        </TouchableOpacity>
      )}
      
      {/* Modal for adding sets to exercises */}
      <Modal
        visible={addSetModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddSetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Set</Text>
              <TouchableOpacity onPress={() => setAddSetModalVisible(false)}>
                <Ionicons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalExerciseName}>
              {currentExercise?.exerciseName || "Exercise"}
            </Text>
            
            <View style={styles.formContainer}>
              {/* Reps input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Reps</Text>
                <TextInput
                  style={styles.formInput}
                  keyboardType="numeric"
                  value={newSetReps}
                  onChangeText={setNewSetReps}
                  placeholder="Enter reps"
                />
              </View>
              
              {/* Weight input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.formInput}
                  keyboardType="decimal-pad"
                  value={newSetWeight}
                  onChangeText={setNewSetWeight}
                  placeholder="Enter weight"
                />
              </View>
            </View>
            
            {/* Button to add the new set */}
            <TouchableOpacity style={styles.addSetButton} onPress={handleAddSet}>
              <Text style={styles.addSetButtonText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 10,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  dayDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  editIcon: {
    marginLeft: 6,
  },
  descriptionEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
  },
  descriptionInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#1E0371',
    paddingVertical: 8,
    fontSize: 16,
  },
  saveButton: {
    marginLeft: 10,
    padding: 8,
  },
  saveButtonText: {
    color: '#1E0371',
    fontWeight: '600',
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
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  exerciseCardGradient: {
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseThumbnail: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseTitleContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 3,
    color: '#222',
  },
  exerciseCategory: {
    fontSize: 13,
    color: '#666',
  },
  deleteAction: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: '94%',
    flexDirection: 'column',
    borderRadius: 8,
  },
  deleteActionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
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
    backgroundColor: '#f5f7fa',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  setsHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    color: '#444',
  },
  setRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  setCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    color: '#333',
  },
  addSetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#f9fafc',
  },
  addSetText: {
    color: '#1E0371',
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 14,
  },
  noSetsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginTop: 8,
  },
  noSetsText: {
    color: '#999',
    marginBottom: 8,
  },
  addFirstSetButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
    marginTop: 12,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
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
    bottom: 90,
    left: 100,
    right: 0,
    backgroundColor: '#1E0371',
    borderRadius: 10,
    padding: 16,
    width: '50%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playIcon: {
    marginRight: 8,
  },
  startWorkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalExerciseName: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  addSetButton: {
    backgroundColor: '#1E0371',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  addSetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  swipeableContainer: {
    // Add any specific styles for the swipeable container here if needed
  },
});