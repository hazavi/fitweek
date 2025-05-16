import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  ActivityIndicator,
  ScrollView,
  Image,
  Keyboard,
  Dimensions
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { exerciseService } from '../services/exerciseService';
import { workoutService } from '../services/workoutService';

const { height, width } = Dimensions.get('window');

/**
 * AddExerciseScreen - Allows users to add exercises to a workout day
 * Includes search, exercise selection and set configuration
 */
const AddExerciseScreen = ({ route }) => {
  // Get the weekday ID from navigation params
  const { weekdayId } = route.params;
  const navigation = useNavigation();
  
  // State variables for UI and data
  const [searchText, setSearchText] = useState('');           // Search input text
  const [exercises, setExercises] = useState([]);             // All available exercises
  const [loading, setLoading] = useState(true);               // Loading state
  const [selectedExercise, setSelectedExercise] = useState(null); // Selected exercise
  const [showExerciseList, setShowExerciseList] = useState(false); // Show/hide dropdown
  const [sets, setSets] = useState([                         // List of sets with reps/weight
    { id: 1, reps: '', weight: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);        // Form submission state
  
  // References for UI elements
  const scrollViewRef = useRef();
  const searchInputRef = useRef();

  /**
   * Load all exercises from the database when component mounts
   */
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await exerciseService.getExercises();
        setExercises(data);
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();

    // Hide dropdown when keyboard is dismissed
    const hideDropdown = () => setShowExerciseList(false);
    Keyboard.addListener('keyboardDidHide', hideDropdown);

    return () => {
      Keyboard.removeAllListeners('keyboardDidHide');
    };
  }, []);

  /**
   * Show exercise list dropdown when search field is focused
   */
  const handleSearchFocus = () => {
    setShowExerciseList(true);
  };

  /**
   * Handle selection of an exercise from the dropdown
   * @param {Object} exercise - The selected exercise
   */
  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
    setShowExerciseList(false);
    setSearchText(exercise.name);
    Keyboard.dismiss();
    
    // Scroll to sets section after selection
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 300, animated: true });
      }
    }, 300);
  };

  /**
   * Update search text and show filtered results
   * @param {string} text - The search text entered
   */
  const handleSearchChange = (text) => {
    setSearchText(text);
    setShowExerciseList(true);
  };

  /**
   * Add a new empty set to the workout
   */
  const addSet = () => {
    if (sets.length >= 10) return; // Limit to 10 sets
    
    const newSetId = sets.length > 0 ? Math.max(...sets.map(s => s.id)) + 1 : 1;
    setSets([...sets, { id: newSetId, reps: '', weight: '' }]);
    
    // Scroll to bottom after adding a set
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  /**
   * Remove a set from the workout
   * @param {number} setId - The ID of the set to remove
   */
  const removeSet = (setId) => {
    if (sets.length <= 1) return; // Always keep at least one set
    setSets(sets.filter(set => set.id !== setId));
  };

  /**
   * Update a specific field of a set
   * @param {number} id - The set ID
   * @param {string} field - The field to update ('reps' or 'weight')
   * @param {string} value - The new value
   */
  const updateSetValue = (id, field, value) => {
    setSets(sets.map(set => {
      if (set.id === id) {
        return { ...set, [field]: value };
      }
      return set;
    }));
  };

  /**
   * Save the exercise with all sets to the database
   */
  const handleAddExercise = async () => {
    if (!selectedExercise) {
      alert('Please select an exercise');
      return;
    }

    if (sets.some(set => !set.reps || !set.weight)) {
      alert('Please fill in reps and weight for all sets');
      return;
    }

    try {
      setSubmitting(true);
      
      // First create the workout exercise
      const workoutExercise = await workoutService.addExerciseToWeekday(
        weekdayId,
        selectedExercise.$id
      );
      
      // Then add all sets
      for (const set of sets) {
        await workoutService.addSetToExercise(
          workoutExercise.$id,
          parseInt(set.reps),
          parseFloat(set.weight),
          set.id // Use the set ID as the set number
        );
      }
      
      // Navigate back to WeekdayDetails
      navigation.goBack();
    } catch (error) {
      console.error('Failed to add exercise:', error);
      alert('Failed to add exercise. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter exercises based on search text
  const filteredExercises = searchText.length > 0
    ? exercises.filter(ex => 
        ex.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        ex.bodyPart?.toLowerCase().includes(searchText.toLowerCase()) ||
        ex.category?.toLowerCase().includes(searchText.toLowerCase())
      )
    : exercises;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add Exercise</Text>

        {/* Exercise Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Exercise</Text>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search exercise, bodypart or category"
              value={searchText}
              onChangeText={handleSearchChange}
              onFocus={handleSearchFocus}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchText('');
                setSelectedExercise(null);
              }}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Selected Exercise Display */}
          {selectedExercise && (
            <View style={styles.selectedExerciseContainer}>
              <View style={styles.selectedExerciseContent}>
                {selectedExercise.thumbnail ? (
                  <Image 
                    source={{ uri: selectedExercise.thumbnail }} 
                    style={styles.selectedExerciseThumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.selectedExerciseThumbnail}>
                    <Ionicons name="barbell-outline" size={30} color="#666" />
                  </View>
                )}
                <View style={styles.selectedExerciseDetails}>
                  <Text style={styles.selectedExerciseName}>{selectedExercise.name}</Text>
                  <Text style={styles.selectedExerciseCategory}>
                    {selectedExercise.bodyPart} • {selectedExercise.category}
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Exercise dropdown list */}
          {showExerciseList && (
            <View style={styles.dropdownContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#0066CC" />
                </View>
              ) : filteredExercises.length > 0 ? (
                <FlatList
                  nestedScrollEnabled={true}
                  data={filteredExercises}
                  keyExtractor={(item) => item.$id || Math.random().toString()}
                  style={styles.exerciseList}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.exerciseItem}
                      onPress={() => handleSelectExercise(item)}
                    >
                      <View style={styles.exerciseItemContent}>
                        {item.thumbnail ? (
                          <Image 
                            source={{ uri: item.thumbnail }} 
                            style={styles.exerciseThumbnail}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.exerciseThumbnail}>
                            <Ionicons name="barbell-outline" size={24} color="#999" />
                          </View>
                        )}
                        
                        <View style={styles.exerciseTextContainer}>
                          <Text style={styles.exerciseName}>{item.name}</Text>
                          <Text style={styles.exerciseCategory}>
                            {item.bodyPart} • {item.category}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.noResultsText}>No exercises found</Text>
                  }
                />
              ) : (
                <Text style={styles.noResultsText}>No exercises found</Text>
              )}
            </View>
          )}
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sets Configuration Section */}
        {selectedExercise && (
          <View style={styles.setsSection}>
            <Text style={styles.sectionTitle}>Sets</Text>
            
            {/* Table Header */}
            <View style={styles.setTableHeader}>
              <Text style={[styles.headerText, styles.setColumn]}>Set</Text>
              <Text style={[styles.headerText, styles.repsColumn]}>Reps</Text>
              <Text style={[styles.headerText, styles.weightColumn]}>Weight(kg)</Text>
              <View style={styles.actionColumn} />
            </View>
            
            {/* Sets List */}
            {sets.map((set) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={[styles.setColumn, styles.setText]}>{set.id}</Text>
                
                <View style={styles.repsColumn}>
                  <TextInput
                    style={styles.valueInput}
                    keyboardType="number-pad"
                    value={set.reps}
                    onChangeText={(value) => updateSetValue(set.id, 'reps', value)}
                    placeholder="0"
                  />
                </View>
                
                <View style={styles.weightColumn}>
                  <TextInput
                    style={styles.valueInput}
                    keyboardType="decimal-pad"
                    value={set.weight}
                    onChangeText={(value) => updateSetValue(set.id, 'weight', value)}
                    placeholder="0"
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.actionColumn} 
                  onPress={() => removeSet(set.id)}
                  disabled={sets.length <= 1}
                >
                  <Ionicons 
                    name="trash-outline" 
                    size={18} 
                    color={sets.length <= 1 ? '#ccc' : '#ff3b30'} 
                  />
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Add Set Button */}
            {sets.length < 10 && (
              <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
                <Ionicons name="add-circle-outline" size={20} color="#0066CC" />
                <Text style={styles.addSetText}>Add Set</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Add space at bottom for scrolling */}
        <View style={{height: 120}} />
      </ScrollView>

      {/* Submit Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.addButton,
            (!selectedExercise || submitting) && styles.disabledButton
          ]}
          onPress={handleAddExercise}
          disabled={!selectedExercise || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.addButtonText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddExerciseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    zIndex: 1000, 
  },
  setsSection: {
    marginTop: 20,
    zIndex: 1, // Lower than dropdown
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    zIndex: 1001,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 16,
  },
  // Selected Exercise Display
  selectedExerciseContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedExerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedExerciseThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  selectedExerciseDetails: {
    flex: 1,
  },
  selectedExerciseName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 3,
  },
  selectedExerciseCategory: {
    fontSize: 14,
    color: '#666',
  },
  // Dropdown styles for exercise list
  dropdownContainer: {
    position: 'absolute',
    top: 100, // Position below search box
    left: '0', // 10% from left edge
    width: '100%', // 80% of screen width
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eaeaea',
    maxHeight: height * 0.3, // 30% of screen height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  exerciseList: {
    maxHeight: height * 0.3,
  },
  exerciseItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseThumbnail: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  exerciseTextContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseCategory: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  noResultsText: {
    padding: 15,
    textAlign: 'center',
    color: '#999',
  },
  setTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerText: {
    fontWeight: '600',
    color: '#555',
    fontSize: 15,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  setColumn: {
    width: '15%',
    paddingLeft: 10,
  },
  repsColumn: {
    width: '35%',
    paddingHorizontal: 5,
  },
  weightColumn: {
    width: '35%',
    paddingHorizontal: 5,
  },
  actionColumn: {
    width: '15%',
    alignItems: 'center',
  },
  setText: {
    fontSize: 16,
    fontWeight: '500',
  },
  valueInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 5,
  },
  addSetText: {
    marginLeft: 5,
    color: '#0066CC',
    fontWeight: '500',
  },
  buttonContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 90,
  },
  addButton: {
    backgroundColor: '#1E0371',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9E9E9E',
    opacity: 0.7,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});