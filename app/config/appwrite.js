import { Client, Account, ID, Databases, Storage, Query } from 'appwrite';

// Initialize the Appwrite client with your project details
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')  // Appwrite server endpoint
    .setProject('6822e5c2001f4d1a01db');              // project ID

// Create service instances for different Appwrite features
const account = new Account(client);    // For user authentication and account management
const databases = new Databases(client); // For database operations (CRUD)
const storage = new Storage(client);    // For file uploads and management

// Export everything so other files can use these services
export { client, account, databases, storage, ID, Query };

// Add a default export for Expo Router compatibility
// This function doesn't do anything but helps with imports
export default function AppwriteConfig() {
  return null;
}