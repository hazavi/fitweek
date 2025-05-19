import { databases, storage, Query } from '../config/appwrite';

// Replace these with your actual Appwrite IDs
const DATABASE_ID = '68245462000b0afba9b0';           
const EXERCISES_COLLECTION_ID = '6824554f00317609257b';      
const THUMBNAILS_BUCKET_ID = '682459e1003203ddefce'; 

export const exerciseService = {
  // Get all exercises
  getExercises: async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        EXERCISES_COLLECTION_ID
      );
      return response.documents;
    } catch (error) {
      console.error("Error fetching exercises:", error);
      throw error;
    }
  },

  // Get exercises with filters
getFilteredExercises: async (bodyPart = null, category = null, searchText = '', sortField = 'name', sortOrder = 'asc') => {
  try {
    let queries = [];
    
    if (bodyPart) {
      queries.push(Query.equal('bodyPart', bodyPart));
    }
    
    if (category) {
      queries.push(Query.equal('category', category));
    }
    
    if (searchText && searchText.trim() !== '') {
      queries.push(Query.search('name', searchText));
    }
    
    // Add sorting query
    if (sortOrder === 'asc') {
      queries.push(Query.orderAsc(sortField));
    } else {
      queries.push(Query.orderDesc(sortField));
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      EXERCISES_COLLECTION_ID,
      queries
    );
    
    return response.documents;
  } catch (error) {
    console.error("Error filtering exercises:", error);
    throw error;
  }
},

  // Get a single exercise by ID
  getExerciseById: async (id) => {
    try {
      const exercise = await databases.getDocument(
        DATABASE_ID,
        EXERCISES_COLLECTION_ID,
        id
      );
      return exercise;
    } catch (error) {
      console.error("Error fetching exercise details:", error);
      throw error;
    }
  },

getThumbnailUrl: (fileId) => {
    if (!fileId) return 'https://icons.iconarchive.com/icons/icons8/ios7/512/Sports-Dumbbell-icon.png';
    
    // Create a properly formatted Appwrite storage URL
    const url = storage.getFileView(
      THUMBNAILS_BUCKET_ID, 
      fileId
    ) + `&cacheBuster=${new Date().getTime()}`;;
    
    return url;
  }
};

export default exerciseService;