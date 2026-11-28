import { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppThemeProvider } from "../src/presentation/components/ui";
import { BiometricGate } from "../src/presentation/components/biometric-gate";
import { theme } from "../src/presentation/theme/tokens";

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <StatusBar style="auto" />
          <BiometricGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.dark.background },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="tasks" />
              <Stack.Screen name="projects" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="notes" />
              <Stack.Screen name="chat" />
              <Stack.Screen name="contacts" />
              <Stack.Screen name="project/[id]" />
              <Stack.Screen name="documents" />
              <Stack.Screen name="document/[id]" />
            </Stack>
          </BiometricGate>
        </AppThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
