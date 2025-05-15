import { account, ID } from '../config/appwrite';
import { workoutService } from './workoutService';

export const authService = {
  // Register new user
  register: async (email, password, name) => {
    try {
      // Create user account
      const newUser = await account.create(
        ID.unique(), 
        email, 
        password, 
        name
      );
      
      // Login the user
      await account.createEmailSession(email, password);
      
      // Create initial weekdays for the user
      await workoutService.createInitialWeekdays(newUser.$id);
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Login user
  login: async (email, password) => {
    try {
      await account.createEmailSession(email, password);
      const user = await account.get();
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Logout user
  logout: async () => {
    try {
      await account.deleteSession('current');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  // Get current logged in user
  getCurrentUser: async () => {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }
};

export default authService;