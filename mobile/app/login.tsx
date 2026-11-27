import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login, register } from "../src/infrastructure/auth/auth";
import { theme } from "../src/theme/tokens";

export default function LoginScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const scheme = useColorScheme() ?? "dark";
  const tokens = theme[scheme];
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: async () =>
      mode === "login"
        ? login(email.trim(), password)
        : register(name.trim(), email.trim(), password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.replace("/");
    },
  });

  const error = mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: tokens.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <Text style={[styles.kicker, { color: tokens.sky }]}>NEXO</Text>
        <Text style={[styles.title, { color: tokens.text }]}>
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </Text>
        <Text style={[styles.subtitle, { color: tokens.muted }]}>
          Sesión opaca guardada en SecureStore. El token viaja en Authorization: Bearer.
        </Text>

        {mode === "register" && (
          <TextInput
            style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]}
            placeholder="Nombre"
            placeholderTextColor={tokens.muted}
            value={name}
            onChangeText={setName}
            autoComplete="name"
          />
        )}
        <TextInput
          style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]}
          placeholder="Correo"
          placeholderTextColor={tokens.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]}
          placeholder="Contraseña"
          placeholderTextColor={tokens.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.button, { backgroundColor: tokens.accent }]}
          onPress={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {mode === "login" ? "Entrar" : "Crear cuenta"}
            </Text>
          )}
        </Pressable>

        <Pressable onPress={() => { setMode(mode === "login" ? "register" : "login"); mutation.reset(); }}>
          <Text style={[styles.switch, { color: tokens.sky }]}>
            {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  kicker: { fontSize: 11, fontWeight: "700", letterSpacing: 2 },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.8 },
  subtitle: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  button: { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 6 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  switch: { fontSize: 13, textAlign: "center", marginTop: 12 },
  error: { color: "#f87171", fontSize: 12.5 },
});
