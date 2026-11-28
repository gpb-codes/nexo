import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Badge, Glyph, UiButton, UiCard, UiInput, useAppTheme } from "../src/presentation/components/ui";
import { useLogin, useRegister } from "../src/presentation/hooks/use-auth";
import {
  authenticateWithBiometrics,
  getBiometricCapability,
} from "../src/infrastructure/security/biometric";
import { getBiometricEnabled, setBiometricEnabled } from "../src/infrastructure/storage/session-store";
import { radii, spacing } from "../src/presentation/theme/tokens";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tokens } = useAppTheme();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const active = mode === "login" ? loginMutation : registerMutation;
  const error = active.error instanceof Error ? active.error.message : null;

  const afterLogin = async () => {
    const [capability, enabled] = await Promise.all([getBiometricCapability(), getBiometricEnabled()]);
    if (capability.available && !enabled) {
      Alert.alert(
        "Desbloqueo biométrico",
        `¿Quieres usar ${capability.label} para abrir Nexo la próxima vez?`,
        [
          { text: "Ahora no", style: "cancel" },
          {
            text: "Activar",
            onPress: async () => {
              const success = await authenticateWithBiometrics("Activa el desbloqueo biométrico de Nexo");
              if (success) await setBiometricEnabled(true);
            },
          },
        ],
      );
    }
    router.replace("/");
  };

  const submit = () => {
    if (mode === "login") {
      loginMutation.mutate(
        { email: email.trim(), password },
        { onSuccess: () => void afterLogin() },
      );
    } else {
      registerMutation.mutate(
        { name: name.trim(), email: email.trim(), password },
        { onSuccess: () => void afterLogin() },
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: tokens.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <View style={[styles.brandMark, { backgroundColor: tokens.accentSoft, borderColor: tokens.borderStrong }]}>
            <Glyph name="brain" size={22} color={tokens.cyan} />
          </View>
          <View>
            <Text style={[styles.brand, { color: tokens.text }]}>Nexo</Text>
            <Text style={[styles.brandTagline, { color: tokens.faint }]}>Tu segundo cerebro unificado</Text>
          </View>
        </View>

        <View style={styles.orb} pointerEvents="none">
          <View style={[styles.orbRing, { borderColor: tokens.borderStrong }]} />
          <View style={[styles.orbRingOuter, { borderColor: tokens.border }]} />
          <View style={[styles.orbCore, { backgroundColor: tokens.accentSoft, borderColor: tokens.borderStrong }]}>
            <Glyph name="brain" size={38} color={tokens.cyan} />
          </View>
        </View>

        <View style={styles.heading}>
          <Badge label={mode === "login" ? "Acceso" : "Nueva cuenta"} tone="accent" />
          <Text style={[styles.title, { color: tokens.text }]}>
            {mode === "login" ? "Bienvenido de vuelta." : "Crea tu espacio."}
          </Text>
          <Text style={[styles.subtitle, { color: tokens.muted }]}>
            {mode === "login"
              ? "Entra en tu espacio personal de conocimiento, tareas y proyectos."
              : "Empieza a conectar tus tareas, notas y proyectos en Nexo."}
          </Text>
        </View>

        <UiCard style={styles.card}>
          {mode === "register" ? (
            <UiInput
              label="Nombre"
              placeholder="Tu nombre"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              textContentType="name"
            />
          ) : null}
          <UiInput
            label="Correo"
            placeholder="tu@correo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <UiInput
            label="Contraseña"
            placeholder="Tu contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            textContentType={mode === "login" ? "password" : "newPassword"}
            error={error || undefined}
          />
          <UiButton
            label={mode === "login" ? "Entrar" : "Crear cuenta"}
            onPress={submit}
            loading={active.isPending}
            disabled={!email.trim() || !password || (mode === "register" && !name.trim())}
          />
          <Pressable
            onPress={() => {
              setMode(mode === "login" ? "register" : "login");
              loginMutation.reset();
              registerMutation.reset();
            }}
            style={styles.switch}
          >
            <Text style={[styles.switchText, { color: tokens.sky }]}>
              {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </Text>
          </Pressable>
        </UiCard>

        <Text style={[styles.footer, { color: tokens.faint }]}>
          Sesión protegida en el dispositivo. La clave de IA nunca se muestra en la app.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: spacing.xl, gap: spacing.lg },
  brandRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: { fontSize: 22, fontWeight: "800", letterSpacing: -0.6 },
  brandTagline: { fontSize: 10.5, fontWeight: "600" },
  orb: { height: 150, alignItems: "center", justifyContent: "center", marginVertical: spacing.sm },
  orbRing: { position: "absolute", width: 132, height: 132, borderRadius: 66, borderWidth: 1 },
  orbRingOuter: {
    position: "absolute",
    width: 176,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    transform: [{ rotate: "-26deg" }],
  },
  orbCore: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: { gap: 7 },
  title: { fontSize: 30, lineHeight: 34, fontWeight: "800", letterSpacing: -1.2 },
  subtitle: { fontSize: 13, lineHeight: 19 },
  card: { gap: spacing.md },
  switch: { alignItems: "center", paddingVertical: spacing.sm },
  switchText: { fontSize: 12, fontWeight: "700" },
  footer: { fontSize: 10.5, textAlign: "center", lineHeight: 15, paddingHorizontal: spacing.md },
});
