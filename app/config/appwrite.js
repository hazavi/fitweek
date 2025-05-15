import { Client, Account, ID, Databases, Storage, Query } from 'appwrite';

// Initialize Appwrite
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('6822e5c2001f4d1a01db');

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

export { client, account, databases, storage, ID, Query };

// Add a default export for Expo Router
export default function AppwriteConfig() {
  return null;
}