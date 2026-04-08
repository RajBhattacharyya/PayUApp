import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { TransactionProvider } from './src/context/TransactionContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { isAuthenticated, setAuthenticated } from './src/utils/storage';

const AppContent = () => {
  const { theme, isDark } = useTheme();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    isAuthenticated().then(setAuthed);
  }, []);

  if (authed === null) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {authed ? (
        <AppNavigator onLogout={() => setAuthed(false)} />
      ) : (
        <AuthScreen onAuth={() => setAuthed(true)} />
      )}
    </>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <TransactionProvider>
          <AppContent />
        </TransactionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
