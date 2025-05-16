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
 * ExercisesScreen - Browse and filter all available exercises
 * Users can search, filter by body part and equipment type
 */
const ExercisesScreen = () => {
  // Constants for dropdown options
  const bodyParts = ["All Body Part", "Chest", "Back", "Legs", "Arms", "Shoulders", "Tricep", "Core", "Glutes", "Full Body"];
  const categories = ["All Category", "Barbell", "Dumbbell", "Machine", "Bodyweight", "Cable", "Cardio"];

  const navigation = useNavigation();
  
  // State variables for data and UI
  const [exercises, setExercises] = useState([]);     // List of exercises to display
  const [loading, setLoading] = useState(true);       // Loading state for API calls
  const [searchText, setSearchText] = useState('');   // Search query text
  const [selectedBodyPart, setSelectedBodyPart] = useState('All Body Part');
  const [selectedCategory, setSelectedCategory] = useState('All Category');
  const [openDropdown, setOpenDropdown] = useState(null); // Which dropdown is open ('bodyPart', 'category', or null)
  
  /**
   * Fetch exercises when component mounts or filters change
   */
  useEffect(() => {
    fetchExercises();
  }, [selectedBodyPart, selectedCategory, searchText]);

  /**
   * Fetch filtered exercises from the API
   */
  const fetchExercises = async () => {
    setLoading(true);
    try {
      // Only apply filter if not set to "All"
      const data = await exerciseService.getFilteredExercises(
        selectedBodyPart === 'All Body Part' ? null : selectedBodyPart,
        selectedCategory === 'All Category' ? null : selectedCategory,
        searchText
      );
      setExercises(data);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to exercise details when an exercise is tapped
   */
  const handleExercisePress = (exercise) => {
    navigation.navigate('ExerciseDetails', { exercise });
  };

  /**
   * Reset all filters to default values
   */
  const clearFilters = () => {
    setSelectedBodyPart('All Body Part');
    setSelectedCategory('All Category');
    setSearchText('');
  };
  
  /**
   * Toggle dropdown visibility
   */
  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };
  
  /**
   * Select a body part from the dropdown
   */
  const selectBodyPart = (bodyPart) => {
    setSelectedBodyPart(bodyPart);
    setOpenDropdown(null);
  };
  
  /**
   * Select a category from the dropdown
   */
  const selectCategory = (category) => {
    setSelectedCategory(category);
    setOpenDropdown(null);
  };

  /**
   * Render each exercise item in the list
   */
  const renderExerciseItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.exerciseItem}
        onPress={() => handleExercisePress(item)}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ 
              uri: item.thumbnail 
                ? exerciseService.getThumbnailUrl(item.thumbnail) 
                : 'https://icons.iconarchive.com/icons/icons8/ios7/512/Sports-Dumbbell-icon.png'
            }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
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
      <Text style={styles.title}>Exercises</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      
      {/* Filter Section */}
      <View style={styles.filterSection}>
        {/* Body Part Dropdown */}
        <View style={styles.dropdownContainer}>
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              selectedBodyPart !== 'All Body Part' && styles.activeFilter,
              openDropdown === 'bodyPart' && styles.activeDropdown
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
          
          {/* Body Part Dropdown Menu */}
          {openDropdown === 'bodyPart' && (
            <View style={styles.dropdownWrapper}>
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  {bodyParts.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.dropdownItem,
                        selectedBodyPart === item && styles.selectedDropdownItem
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
        
        {/* Category Dropdown */}
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
          
          {/* Category Dropdown Menu */}
          {openDropdown === 'category' && (
            <View style={styles.dropdownWrapper}>
              <View style={styles.dropdown}>
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled={true}>
                  {categories.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.dropdownItem,
                        selectedCategory === item && styles.selectedDropdownItem
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
        
        {/* Clear Filters Button - only shown when filters are active */}
        {(selectedBodyPart !== 'All Body Part' || selectedCategory !== 'All Category') && (
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Ionicons name="close" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Exercise List */}
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
      
      {/* Transparent backdrop to close dropdowns when clicking outside */}
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