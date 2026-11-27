import { useEffect } from "react";
import { ActivityIndicator, Pressable, useColorScheme, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useLogout, useSession } from "../src/presentation/hooks/use-auth";
import { usePendingChanges, useSync } from "../src/presentation/hooks/use-sync";
import { theme } from "../src/presentation/theme/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? "dark";
  const tokens = theme[scheme];
  const session = useSession();
  const logout = useLogout();
  const pending = usePendingChanges();
  const sync = useSync();

  useEffect(() => {
    if (session.isError) router.replace("/login");
  }, [session.isError, router]);

  const links = [
    { label: "Abrir Tareas", path: "/tasks" },
    { label: "Abrir Proyectos", path: "/projects" },
    { label: "Ajustes", path: "/settings" },
    { label: "Notas", path: "/notes" },
    { label: "Contactos", path: "/contacts" },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      {session.isLoading ? (
        <ActivityIndicator color={tokens.accent} />
      ) : session.data ? (
        <>
          <Text style={[styles.kicker, { color: tokens.sky }]}>NEXO MOBILE · CLEAN ARCHITECTURE</Text>
          <Text style={[styles.title, { color: tokens.text }]}>
            Hola, {session.data.displayName || session.data.name || session.data.email}
          </Text>
          <Text style={[styles.body, { color: tokens.muted }]}>
            Sesión verificada con Bearer. Arquitectura: dominio, aplicación, infraestructura y presentación.
          </Text>
          <Pressable
            style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.panel }]}
            onPress={() => sync.mutate()}
            disabled={sync.isPending}
          >
            <Text style={{ color: tokens.text }}>
              Sincronizar cambios{pending.data ? ` (${pending.data})` : ""}
            </Text>
          </Pressable>
          {links.map((link) => (
            <Pressable
              key={link.path}
              style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.panel }]}
              onPress={() => router.push(link.path)}
            >
              <Text style={{ color: tokens.text }}>{link.label}</Text>
            </Pressable>
          ))}
          <Pressable
            style={[styles.button, { borderColor: tokens.border, backgroundColor: tokens.panel }]}
            onPress={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <Text style={{ color: tokens.text }}>Cerrar sesión</Text>
          </Pressable>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  kicker: { fontSize: 11, fontWeight: "700", letterSpacing: 1.4 },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.8 },
  body: { fontSize: 14, lineHeight: 21 },
  button: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 18 },
});
