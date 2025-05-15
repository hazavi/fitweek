import { account, databases, ID, Query } from '../config/appwrite';

// Replace these with your actual Appwrite IDs
const DATABASE_ID = '68245462000b0afba9b0';
const WEEKDAYS_COLLECTION_ID = '6824b1f60009fd4d72ea';
const WORKOUT_EXERCISES_COLLECTION_ID = '6824b5d4003753b3f6cd';
const EXERCISES_COLLECTION_ID = '6824554f00317609257b';
const EXERCISE_SETS_COLLECTION_ID = '6824e31e0017425a1e00';

export const workoutService = {
  // Get all weekdays for a user
  getUserWeekdays: async (userId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        WEEKDAYS_COLLECTION_ID,
        [
          Query.equal('userId', userId),
          Query.orderAsc('order')
        ]
      );
      
      // Get exercise counts for each weekday
      const weekdays = response.documents;
      
      // For each weekday, get the exercise count
      for (let weekday of weekdays) {
        const exercises = await databases.listDocuments(
          DATABASE_ID,
          WORKOUT_EXERCISES_COLLECTION_ID,
          [
            Query.equal('weekdayId', weekday.$id)
          ]
        );
        
        weekday.exerciseCount = exercises.total;
      }
      
      return weekdays;
    } catch (error) {
      console.error("Error fetching weekdays:", error);
      throw error;
    }
  },
  
  // Create initial weekdays for a new user
  createInitialWeekdays: async (userId) => {
    try {
      const weekdays = [
        { dayName: 'Monday', description: 'Back + Bicep', order: 1 },
        { dayName: 'Tuesday', description: 'Shoulder + Arms', order: 2 },
        { dayName: 'Wednesday', description: 'Lower body', order: 3 },
        { dayName: 'Thursday', description: 'Push day', order: 4 },
        { dayName: 'Friday', description: 'Pull day', order: 5 },
        { dayName: 'Saturday', description: 'Lower body', order: 6 },
        { dayName: 'Sunday', description: 'Rest Day', order: 7 },
      ];
      
      for (let weekday of weekdays) {
        await databases.createDocument(
          DATABASE_ID,
          WEEKDAYS_COLLECTION_ID,
          ID.unique(),
          {
            ...weekday,
            userId: userId
          }
        );
      }
      
      return true;
    } catch (error) {
      console.error("Error creating initial weekdays:", error);
      throw error;
    }
  },
  
  // Update weekday description
  updateWeekdayDescription: async (weekdayId, description) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        WEEKDAYS_COLLECTION_ID,
        weekdayId,
        {
          description: description
        }
      );
      
      return true;
    } catch (error) {
      console.error("Error updating weekday description:", error);
      throw error;
    }
  },
  
  // Get exercises for a specific weekday
  getWeekdayExercises: async (weekdayId) => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        WORKOUT_EXERCISES_COLLECTION_ID,
        [
          Query.equal('weekdayId', weekdayId)
        ]
      );
      
      // Get exercise details for each
      const workoutExercises = response.documents;
      const exercises = [];
      
      for (let workoutExercise of workoutExercises) {
        try {
          // Get the exercise details
          const exercise = await databases.getDocument(
            DATABASE_ID,
            EXERCISES_COLLECTION_ID,
            workoutExercise.exerciseId
          );
          
          // Get all sets for this workout exercise
          const setsResponse = await databases.listDocuments(
            DATABASE_ID,
            EXERCISE_SETS_COLLECTION_ID,
            [
              Query.equal('workoutExerciseId', workoutExercise.$id),
              Query.orderAsc('setNumber')
            ]
          );
          
          const sets = setsResponse.documents;
          
          exercises.push({
            ...workoutExercise,
            exerciseName: exercise.name,
            bodyPart: exercise.bodyPart,
            category: exercise.category,
            thumbnail: exercise.thumbnail,
            sets: sets
          });
        } catch (error) {
          exercises.push({
            ...workoutExercise,
            exerciseName: 'Unknown Exercise',
            bodyPart: '',
            category: '',
            thumbnail: null,
            sets: []
          });
        }
      }
      
      return exercises;
    } catch (error) {
      console.error("Error fetching weekday exercises:", error);
      throw error;
    }
  },
  
  // Add exercise to weekday (without sets, reps, weight)
  addExerciseToWeekday: async (weekdayId, exerciseId) => {
    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        WORKOUT_EXERCISES_COLLECTION_ID,
        ID.unique(),
        {
          weekdayId: weekdayId,
          exerciseId: exerciseId,
        }
      );
      
      return response;
    } catch (error) {
      console.error("Error adding exercise to weekday:", error);
      throw error;
    }
  },
  
  // Add a set to an exercise
  addSetToExercise: async (workoutExerciseId, reps, weight, setNumber = null) => {
    try {
      // If setNumber is not provided, get the highest set number and increment
      if (!setNumber) {
        try {
          const existingSets = await databases.listDocuments(
            DATABASE_ID,
            EXERCISE_SETS_COLLECTION_ID,
            [
              Query.equal('workoutExerciseId', workoutExerciseId),
              Query.orderDesc('setNumber'),
              Query.limit(1)
            ]
          );
          
          if (existingSets.documents.length > 0) {
            setNumber = existingSets.documents[0].setNumber + 1;
          } else {
            setNumber = 1;
          }
        } catch (error) {
          setNumber = 1;
        }
      }
      
      const response = await databases.createDocument(
        DATABASE_ID,
        EXERCISE_SETS_COLLECTION_ID,
        ID.unique(),
        {
          workoutExerciseId: workoutExerciseId,
          reps: reps,
          weight: weight,
          setNumber: setNumber
        }
      );
      
      return response;
    } catch (error) {
      console.error("Error adding set to exercise:", error);
      throw error;
    }
  },
  
  // Delete a set
  deleteSet: async (setId) => {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        EXERCISE_SETS_COLLECTION_ID,
        setId
      );
      
      return true;
    } catch (error) {
      console.error("Error deleting set:", error);
      throw error;
    }
  },
  
  // Delete exercise from weekday (also deletes all associated sets)
  deleteExerciseFromWeekday: async (workoutExerciseId) => {
    try {
      // First delete all sets associated with this workout exercise
      try {
        const sets = await databases.listDocuments(
          DATABASE_ID,
          EXERCISE_SETS_COLLECTION_ID,
          [
            Query.equal('workoutExerciseId', workoutExerciseId)
          ]
        );
        
        for (let set of sets.documents) {
          await databases.deleteDocument(
            DATABASE_ID,
            EXERCISE_SETS_COLLECTION_ID,
            set.$id
          );
        }
      } catch (error) {
        console.error("Error deleting sets:", error);
      }
      
      // Then delete the workout exercise
      await databases.deleteDocument(
        DATABASE_ID,
        WORKOUT_EXERCISES_COLLECTION_ID,
        workoutExerciseId
      );
      
      return true;
    } catch (error) {
      console.error("Error deleting exercise from weekday:", error);
      throw error;
    }
  },
  
  // Update set values
  updateSet: async (setId, reps, weight) => {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        EXERCISE_SETS_COLLECTION_ID,
        setId,
        {
          reps: reps,
          weight: weight
        }
      );
      
      return true;
    } catch (error) {
      console.error("Error updating set:", error);
      throw error;
    }
  }
};

export default workoutService;