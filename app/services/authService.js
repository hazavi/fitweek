import { account, ID } from '../config/appwrite';

/**
 * Authentication service for handling user login, registration, and session management
 */
export const authService = {
  /**
   * Register a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} name - User's name
   * @returns {Promise} - User object
   */
  register: async (email, password, name) => {
    return await account.create(ID.unique(), email, password, name);
  },

  /**
   * Check if a session already exists
   * @returns {Promise<boolean>} - True if session exists, false otherwise
   */
  hasActiveSession: async () => {
    try {
      const user = await account.get();
      return user !== null;
    } catch (error) {
      return false;
    }
  },

  /**
   * Login user with email and password
   * First checks if session exists to avoid the error
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise} - Session object
   */
  login: async (email, password) => {
    // Check if there's already an active session
    const hasSession = await authService.hasActiveSession();
    
    if (hasSession) {
      console.log('User already has an active session, skipping login');
      // Return the current user instead of creating a new session
      return await account.get();
    }
    
    // No active session, safe to create a new one
    return await account.createEmailSession(email, password);
  },

  /**
   * Log out the current user
   * @returns {Promise} - Void on success
   */
  logout: async () => {
    try {
      // Try to delete the current session
      return await account.deleteSession('current');
    } catch (error) {
      // Check if this is just a "not logged in" error
      if (error.code === 401) {
        console.log('User already logged out or session expired');
        // Return success anyway since the user is indeed logged out
        return true;
      }
      // Re-throw any other errors
      throw error;
    }
  },

  /**
   * Get the current logged-in user
   * @returns {Promise} - User object or null if not logged in
   */
  getCurrentUser: async () => {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  }
};

// For module import compatibility
export default authService;