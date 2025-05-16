# FitWeek

FitWeek is a comprehensive workout planning and tracking application built with React Native and Appwrite backend.

## Features

- **Weekly Workout Planning**: Plan your workouts for each day of the week
- **Exercise Library**: Browse a collection of exercises with detailed instructions
- **Set Tracking**: Configure and track sets, reps, and weights for each exercise
- **Progress Tracking**: Check off exercises and sets as you complete them
- **User Authentication**: Secure login and account management

## Technologies Used

- **Frontend**: React Native + Expo
- **Backend**: Appwrite (Authentication, Database, Storage)
- **Navigation**: React Navigation with custom tab bar
- **UI Components**: Custom React Native components with Ionicons

## Project Structure

- **app/screens/**: All application screens
- **app/components/**: Reusable UI components
- **app/services/**: API service layers for data fetching
- **app/config/**: Configuration files (Appwrite setup)

## App Flow

1. **Authentication**: Users start at the welcome screen to login or signup
2. **Main Tabs**: After login, users can navigate between:
   - **Workout**: Weekly workout planning and execution
   - **Exercises**: Browse exercise library with filtering
   - **Settings**: Account management and preferences

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install` or `yarn install`
3. Create an Appwrite project and update `app/config/appwrite.js` with your project details
4. Start the application: `npm start` or `yarn start`

## Screenshots

- Login/Signup screens
- Weekly workout planner
- Exercise details
- Workout execution tracking

## Future Enhancements

- Theme customization (Dark/Light mode)
- Exercise history and statistics
- Social features for sharing workouts

