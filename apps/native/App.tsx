import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import styled from 'styled-components/native';

import { AppNavigator } from 'src/navigation/AppNavigator';
import { useAuthStore } from 'src/features/auth/store/useAuthStore';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Theme configuration for React Native Paper
const theme = {
  colors: {
    primary: '#6200ee',
    accent: '#03dac6',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#212121',
    placeholder: '#666',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: '#212121',
    disabled: '#9e9e9e',
    error: '#d32f2f',
  },
};

const AppContainer = styled(GestureHandlerRootView)`
  flex: 1;
`;

function AppContent() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize authentication state
    initialize();
  }, [initialize]);

  return (
    <AppContainer>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AppNavigator />
          <StatusBar style='auto' />
        </PaperProvider>
      </SafeAreaProvider>
    </AppContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
