import { useEffect } from "react";
import { ActivityIndicator, Pressable, useColorScheme, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, endpoints } from "../src/infrastructure/api/client";
import { logout } from "../src/infrastructure/auth/auth";
import { theme } from "../src/theme/tokens";

type MeResponse = { ok: boolean; user: { name?: string; displayName?: string; email: string } };

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const scheme = useColorScheme() ?? "dark";
  const tokens = theme[scheme];
  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => api<MeResponse>(endpoints.me),
    retry: false,
  });

  useEffect(() => {
    if (session.isError) router.replace("/login");
  }, [session.isError, router]);

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      {session.isLoading ? (
        <ActivityIndicator color={tokens.accent} />
      ) : session.data ? (
        <>
          <Text style={[styles.kicker, { color: tokens.sky }]}>NEXO MOBILE · FASE 1</Text>
          <Text style={[styles.title, { color: tokens.text }]}>
            Hola, {session.data.user.displayName || session.data.user.name || session.data.user.email}
          </Text>
          <Text style={[styles.body, { color: tokens.muted }]}>
            Sesión verificada con Bearer. El módulo de tareas ya está disponible.
          </Text>
          <Pressable
            style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.panel }]}
            onPress={() => router.push("/tasks")}
          >
            <Text style={{ color: tokens.text }}>Abrir Tareas</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.panel }]}
            onPress={() => router.push("/projects")}
          >
            <Text style={{ color: tokens.text }}>Abrir Proyectos</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.panel }]}
            onPress={() => router.push("/settings")}
          >
            <Text style={{ color: tokens.text }}>Ajustes</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.panel }]}
            onPress={() => router.push("/notes")}
          >
            <Text style={{ color: tokens.text }}>Notas</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.panel }]}
            onPress={() => router.push("/contacts")}
          >
            <Text style={{ color: tokens.text }}>Contactos</Text>
          </Pressable>
          <Pressable
            style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.panel }]}
            onPress={async () => {
              await logout();
              await queryClient.invalidateQueries({ queryKey: ["session"] });
              router.replace("/login");
            }}
          >
            <Text style={{ color: tokens.text }}>Cerrar sesión</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 14 },
  kicker: { fontSize: 11, fontWeight: "700", letterSpacing: 1.4 },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.8 },
  body: { fontSize: 14, lineHeight: 21 },
  button: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 18 },
});
