import { StatusBar, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './app/index';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Use Platform.OS to apply correct StatusBar settings for each platform */}
      <StatusBar 
        translucent={true} 
        backgroundColor="transparent" 
        barStyle="dark-content"
      />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}