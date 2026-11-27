import { useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.dark.panel },
            headerTintColor: theme.dark.text,
            contentStyle: { backgroundColor: theme.dark.background },
          }}
        >
          <Stack.Screen name="index" options={{ title: "Nexo" }} />
          <Stack.Screen name="login" options={{ title: "Acceso", headerBackVisible: false }} />
          <Stack.Screen name="tasks" options={{ title: "Tareas" }} />
          <Stack.Screen name="projects" options={{ title: "Proyectos" }} />
          <Stack.Screen name="settings" options={{ title: "Ajustes" }} />
          <Stack.Screen name="notes" options={{ title: "Notas" }} />
          <Stack.Screen name="contacts" options={{ title: "Contactos" }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
