import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, Image, 
  TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { exerciseService } from '../services/exerciseService';

/**
 * ExerciseDetailsScreen - Shows detailed information about a specific exercise
 * Displays name, image, category, instructions, and tips
 */
const ExerciseDetailsScreen = ({ route, navigation }) => {
  // Get exercise details from navigation params
  const { exercise: initialExercise, exerciseId } = route.params;
  
  // State variables
  const [exercise, setExercise] = useState(initialExercise || null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  /**
   * Fetch complete exercise details when component mounts
   */
  useEffect(() => {
    const fetchExerciseDetails = async () => {
      try {
        // Determine which ID to use
        let id = initialExercise?.$id || exerciseId;
        if (!id) {
          console.error('No exercise ID provided');
          setLoading(false);
          return;
        }

        // Fetch the complete exercise details from the API
        const fullExercise = await exerciseService.getExerciseById(id);
        setExercise(fullExercise);
      } catch (error) {
        console.error('Failed to fetch exercise details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [initialExercise?.$id, exerciseId]);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#222" />
      </View>
    );
  }

  // Show error message if exercise not found
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
      {/* Back button */}
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
        {/* Exercise title */}
        <Text style={styles.title}>{exercise.name}</Text>
        
        {/* Exercise image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: !imageError && exercise.thumbnail 
                ? exerciseService.getThumbnailUrl(exercise.thumbnail)
                : 'https://icons.iconarchive.com/icons/icons8/ios7/512/Sports-Dumbbell-icon.png'
            }}
            style={styles.image}
            resizeMode="contain"
            onError={() => {
              console.error('Image failed to load:', exercise.thumbnail);
              setImageError(true);
            }}
          />
        </View>
        
        {/* Category and body part tags */}
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
        
        {/* Instructions section */}
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
        
        {/* Tips section */}
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 20,
  },
  scrollViewContent: {
    paddingBottom: 80, // Add padding at the bottom for the tab bar
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
    borderRadius: 12,
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
    flexDirection: 'row',
    marginBottom: 25,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  tagText: {
    fontSize: 14,
    color: '#444',
  },
  section: {
    marginBottom: 25,
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
    flexDirection: 'row',
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#444',
  },
  instructionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  tipSection: {
    marginBottom: 30,
  },
  tipBox: {
    backgroundColor: '#FFF9E6',
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