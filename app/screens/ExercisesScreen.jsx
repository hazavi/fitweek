import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, Image, 
  TextInput, ActivityIndicator, Modal, ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { exerciseService } from '../services/exerciseService';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * ExercisesScreen - Browse and search exercise library
 * Users can find exercises by name, body part, or equipment type
 */
const ExercisesScreen = () => {
  // Lists of options for the filter dropdowns
  const bodyParts = ["Chest", "Back", "Legs", "Arms", "Shoulders", "Tricep", "Core", "Glutes", "Full Body"];
  const categories = ["Barbell", "Dumbbell", "Machine", "Bodyweight", "Cable", "Cardio"];

  const navigation = useNavigation();
  
  // Information the screen needs to remember
  const [exercises, setExercises] = useState([]);     // List of exercises to show
  const [loading, setLoading] = useState(true);       // Shows spinner while loading
  const [searchText, setSearchText] = useState('');   // What user types in search box
  const [selectedBodyPart, setSelectedBodyPart] = useState('All Body Part'); // Current body part filter
  const [selectedCategory, setSelectedCategory] = useState('All Category');   // Current equipment filter
  const [openDropdown, setOpenDropdown] = useState(null); // Which dropdown menu is open
  
  /**
   * Get exercises when screen loads or filters change
   * This runs automatically when searchText, body part or category changes
   */
  useEffect(() => {
    fetchExercises();
  }, [selectedBodyPart, selectedCategory, searchText]);

  /**
   * Get filtered exercises from the database
   * Shows only exercises that match all active filters
   */
  const fetchExercises = async () => {
    // Show loading spinner
    setLoading(true);
    
    try {
      // Only filter if user selected something other than "All"
      const data = await exerciseService.getFilteredExercises(
        selectedBodyPart === 'All Body Part' ? null : selectedBodyPart,
        selectedCategory === 'All Category' ? null : selectedCategory,
        searchText  // Search text is always applied if not empty
      );
      
      // Update the list with what we got
      setExercises(data);
    } catch (error) {
      console.error('Could not get exercises:', error);
      // Could show error message to user here
    } finally {
      // Hide loading spinner when done
      setLoading(false);
    }
  };

  /**
   * Open exercise details when user taps an exercise
   * Takes user to a new screen with full exercise information
   */
  const handleExercisePress = (exercise) => {
    navigation.navigate('ExerciseDetails', { exercise });
  };

  /**
   * Reset all filters to default settings
   * Useful when user wants to start fresh
   */
  const clearFilters = () => {
    setSelectedBodyPart('All Body Part');
    setSelectedCategory('All Category');
    setSearchText('');
    // Exercise list will refresh automatically due to useEffect
  };
  
  /**
   * Open or close a dropdown menu
   * Closes any other open dropdown first
   */
  const toggleDropdown = (dropdown) => {
    // If this dropdown is already open, close it
    // Otherwise, open this one and close any other
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };
  
  /**
   * Choose a body part from the dropdown menu
   * Updates the filter and closes the dropdown
   */
  const selectBodyPart = (bodyPart) => {
    setSelectedBodyPart(bodyPart);
    setOpenDropdown(null); // Close dropdown after selection
  };
  
  /**
   * Choose an equipment type from the dropdown menu
   * Updates the filter and closes the dropdown
   */
  const selectCategory = (category) => {
    setSelectedCategory(category);
    setOpenDropdown(null); // Close dropdown after selection
  };

  /**
   * Create each exercise card for the list
   * Shows image, name, and basic details for each exercise
   */
  const renderExerciseItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.exerciseItem}
        onPress={() => handleExercisePress(item)}
      >
        {/* Exercise thumbnail image */}
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ 
              uri: item.thumbnail 
                ? exerciseService.getThumbnailUrl(item.thumbnail) 
                : 'https://icons.iconarchive.com/icons/icons8/ios7/512/Sports-Dumbbell-icon.png' // Fallback image
            }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
        
        {/* Exercise name and details */}
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{item.name}</Text>
          <Text style={styles.exerciseCategory}>
            {item.bodyPart} {item.category ? `• ${item.category}` : ''}
          </Text>        
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Screen title */}
      <Text style={styles.title}>Exercises</Text>
      
      {/* Search box */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      
      {/* Filter options */}
      <View style={styles.filterSection}>
        {/* Body part dropdown menu */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              selectedBodyPart !== 'All Body Part' && styles.activeFilter, // Highlight if filter is active
              openDropdown === 'bodyPart' && styles.activeDropdown // Special style when menu is open
            ]}
            onPress={() => toggleDropdown('bodyPart')}
          >
            <Text style={styles.filterText}>{selectedBodyPart}</Text>
            <Ionicons 
              name={openDropdown === 'bodyPart' ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#666" 
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>
          
          {/* Body part dropdown items */}
          {openDropdown === 'bodyPart' && (
            <View style={styles.dropdownWrapper}>
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  {bodyParts.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.dropdownItem,
                        selectedBodyPart === item && styles.selectedDropdownItem // Highlight selected item
                      ]}
                      onPress={() => selectBodyPart(item)}
                    >
                      <Text 
                        style={[
                          styles.dropdownText,
                          selectedBodyPart === item && styles.selectedDropdownText
                        ]}
                      >
                        {item}
                      </Text>
                      {selectedBodyPart === item && (
                        <Ionicons name="checkmark" size={16} color="#007bff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </View>
        
        {/* Equipment type dropdown menu - works the same as body part dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              selectedCategory !== 'All Category' && styles.activeFilter,
              openDropdown === 'category' && styles.activeDropdown
            ]}
            onPress={() => toggleDropdown('category')}
          >
            <Text style={styles.filterText}>{selectedCategory}</Text>
            <Ionicons 
              name={openDropdown === 'category' ? "chevron-up" : "chevron-down"} 
              size={16} 
              color="#666" 
              style={styles.dropdownIcon}
            />
          </TouchableOpacity>
          
          {/* Category dropdown items */}
          {openDropdown === 'category' && (
            <View style={styles.dropdownWrapper}>
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  {categories.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.dropdownItem,
                        selectedCategory === item && styles.selectedDropdownItem // Highlight selected item
                      ]}
                      onPress={() => selectCategory(item)}
                    >
                      <Text 
                        style={[
                          styles.dropdownText,
                          selectedCategory === item && styles.selectedDropdownText
                        ]}
                      >
                        {item}
                      </Text>
                      {selectedCategory === item && (
                        <Ionicons name="checkmark" size={16} color="#007bff" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </View>
        
        {/* Clear filters button - only shown when filters are active */}
        {(selectedBodyPart !== 'All Body Part' || selectedCategory !== 'All Category') && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Exercise list or loading spinner */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#222" />
        </View>
      ) : (
        <FlatList
          data={exercises}
          renderItem={renderExerciseItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No exercises found</Text>
            </View>
          }
        />
      )}
      
      {/* Invisible layer that closes dropdowns when tapped */}
      {openDropdown && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={0}
          onPress={() => setOpenDropdown(null)}
        />
      )}
    </View>
  );
};

export default ExercisesScreen;

// Styles define how everything looks
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filterSection: {
    flexDirection: 'row',
    marginBottom: 20,
    zIndex: 1000, // Ensure dropdowns appear above other content
    position: 'relative', // Add this for better dropdown positioning
  },
  dropdownContainer: {
    marginRight: 10,
    position: 'relative',
    zIndex: 1000,
    minWidth: 150, // Ensure consistent width
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Better spacing between text and icon
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10, // Slightly taller for better touch target
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: '#e0e0e0',
  },
  activeDropdown: {
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  filterText: {
    fontSize: 14,
    flex: 1, // Take available space
  },
  dropdownIcon: {
    marginLeft: 5,
  },
  dropdownWrapper: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    paddingTop: 5, // Add space between button and dropdown
    zIndex: 1001,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    maxHeight: 250,
    width: 'auto', // Auto width based on content
    minWidth: '100%', // At least as wide as the button
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12, // Taller items for better touch targets
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedDropdownItem: {
    backgroundColor: '#f0f7ff',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDropdownText: {
    color: '#007bff',
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  // Keep the rest of your styles the same
  list: {
    paddingBottom: 100, // Extra space for the tab bar
  },
  exerciseItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  thumbnail: {
    width: 60,
    height: 60,
  },
  exerciseInfo: {
    flex: 1,
    padding: 15,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});