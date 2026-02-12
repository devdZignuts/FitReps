import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store, useAppDispatch, useAppSelector } from './src/store';
import { initializeAuth } from './src/store/slices/authSlice';
import { fetchProfile } from './src/store/slices/profileSlice';
import AuthNavigator from './src/app/navigation/AuthNavigator';
import AppNavigator from './src/app/navigation/AppNavigator';

function RootNavigation() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);
  const { status: profileStatus, profile } = useAppSelector((state) => state.profile);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Fetch profile once authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      dispatch(fetchProfile());
    }
  }, [status, dispatch]);

  const isAuthLoading = status === 'idle' || status === 'loading';
  const isProfileLoading = status === 'authenticated' && (profileStatus === 'idle' || profileStatus === 'loading');

  if (isAuthLoading || isProfileLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {status === 'authenticated' ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <RootNavigation />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
