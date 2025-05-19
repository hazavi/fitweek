import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, Image, 
  TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { exerciseService } from '../services/exerciseService';

/**
 * ExerciseDetailsScreen - Shows all information about an exercise
 * Like a detailed card with pictures, instructions, and tips
 */
const ExerciseDetailsScreen = ({ route, navigation }) => {
  // Get the exercise from the previous screen
  const { exercise: initialExercise, exerciseId } = route.params;
  
  // Things the screen needs to keep track of
  const [exercise, setExercise] = useState(initialExercise || null); // The exercise data to display
  const [loading, setLoading] = useState(true);  // Whether we're still loading data
  const [imageError, setImageError] = useState(false); // If the image fails to load

  /**
   * Get the full exercise details when screen opens
   * This runs once when you first see the screen
   */
  useEffect(() => {
    const fetchExerciseDetails = async () => {
      try {
        // Figure out which exercise ID to use
        let id = initialExercise?.$id || exerciseId;
        if (!id) {
          console.error('No exercise ID provided');
          setLoading(false);
          return;
        }

        // Get all the details from the database
        const fullExercise = await exerciseService.getExerciseById(id);
        setExercise(fullExercise);
      } catch (error) {
        console.error('Failed to fetch exercise details:', error);
      } finally {
        // Hide the loading spinner either way
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [initialExercise?.$id, exerciseId]);

  // Show a spinner while loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#222" />
      </View>
    );
  }

  // Show an error message if we can't find the exercise
  if (!exercise) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.loadingContainer}>
          <Text>Exercise not found</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Back button to return to the previous screen */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color="#000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Exercise name at the top */}
        <Text style={styles.title}>{exercise.name}</Text>
        
        {/* Exercise picture */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: !imageError && exercise.thumbnail 
                ? exerciseService.getThumbnailUrl(exercise.thumbnail)
                : 'https://icons.iconarchive.com/icons/icons8/ios7/512/Sports-Dumbbell-icon.png' // Default image if real one fails
            }}
            style={styles.image}
            resizeMode="contain"
            onError={() => {
              console.error('Image failed to load:', exercise.thumbnail);
              setImageError(true);
            }}
          />
        </View>
        
        {/* Tags showing the body part and equipment type */}
        <View style={styles.tagsContainer}>
          {exercise.bodyPart && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{exercise.bodyPart}</Text>
            </View>
          )}
          {exercise.category && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{exercise.category}</Text>
            </View>
          )}
        </View>
        
        {/* Step-by-step instructions with bullet points */}
        {exercise.instructions ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionsContainer}>
              {exercise.instructions.split('\n').map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.instructionText}>{instruction.trim()}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.noContentText}>No instructions available</Text>
          </View>
        )}
        
        {/* Helpful tips in a highlighted box */}
        {exercise.tips && (
          <View style={styles.tipSection}>
            <View style={styles.tipBox}>
              <Ionicons name="bulb" size={20} color="#FF9500" />
              <Text style={styles.tipText}>{exercise.tips}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ExerciseDetailsScreen;


/**
 * Styles control how everything looks on screen
 * Colors, spacing, sizes, and layout
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // White background
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center', // Center the spinner
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 20, // Space around all content
  },
  scrollViewContent: {
    paddingBottom: 80, // Extra space at bottom so content isn't hidden by tab bar
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 5,
  },
  backText: {
    fontSize: 16,
    marginLeft: 5,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 12, // Rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagsContainer: {
    flexDirection: 'row', // Arrange tags side by side
    marginBottom: 25,
  },
  tag: {
    backgroundColor: '#f0f0f0', // Light gray background
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20, // Pill shape
    marginRight: 10,
  },
  tagText: {
    fontSize: 14,
    color: '#444',
  },
  section: {
    marginBottom: 25, // Space between sections
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  instructionsContainer: {
    marginLeft: 5,
  },
  instructionItem: {
    flexDirection: 'row', // Bullet point and text side by side
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#444',
  },
  instructionText: {
    flex: 1, // Take up remaining space
    fontSize: 15,
    lineHeight: 22, // Space between lines for readability
    color: '#333',
  },
  tipSection: {
    marginBottom: 30,
  },
  tipBox: {
    backgroundColor: '#FFF9E6', // Light yellow background
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  noContentText: {
    fontSize: 15,
    color: '#888',
    fontStyle: 'italic'
  },
});