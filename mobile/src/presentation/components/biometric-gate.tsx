import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { Glyph, UiButton, UiCard, useAppTheme } from "./ui";
import { authenticateWithBiometrics, getBiometricCapability } from "../../infrastructure/security/biometric";
import {
  clearBiometricEnabled,
  clearSessionToken,
  getBiometricEnabled,
  getSessionToken,
} from "../../infrastructure/storage/session-store";
import { radii, spacing } from "../theme/tokens";

type GateState = "checking" | "locked" | "open";

export function BiometricGate({ children }: { children: ReactNode }) {
  const { tokens } = useAppTheme();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [state, setState] = useState<GateState>("checking");
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("biometría");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [token, enabled] = await Promise.all([getSessionToken(), getBiometricEnabled()]);
      if (!token || !enabled) {
        if (!cancelled) setState("open");
        return;
      }
      const capability = await getBiometricCapability();
      if (!cancelled) {
        setLabel(capability.label);
        setState("locked");
      }
      const success = await authenticateWithBiometrics();
      if (!cancelled) {
        if (success) {
          setState("open");
        } else {
          setError("No se pudo verificar tu identidad. Reintenta o usa tu contraseña.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const retry = async () => {
    setBusy(true);
    setError(null);
    const success = await authenticateWithBiometrics();
    setBusy(false);
    if (success) setState("open");
    else setError("No se pudo verificar tu identidad. Reintenta o usa tu contraseña.");
  };

  const usePassword = async () => {
    setBusy(true);
    await clearSessionToken();
    await clearBiometricEnabled();
    queryClient.clear();
    setBusy(false);
    setState("open");
  };

  if (state === "open") return <>{children}</>;

  return (
    <View style={[styles.container, { backgroundColor: tokens.background, paddingTop: insets.top }]}>
      <View style={styles.orb}>
        <View style={[styles.ring, { borderColor: tokens.borderStrong }]} />
        <View style={[styles.ringOuter, { borderColor: tokens.border }]} />
        <View style={[styles.core, { backgroundColor: tokens.accentSoft, borderColor: tokens.borderStrong }]}>
          <Glyph name="brain" size={38} color={tokens.cyan} />
        </View>
      </View>

      {state === "checking" ? (
        <View style={styles.center}>
          <ActivityIndicator color={tokens.accent} />
          <Text style={[styles.checking, { color: tokens.muted }]}>Comprobando seguridad del dispositivo...</Text>
        </View>
      ) : (
        <UiCard style={styles.card}>
          <Text style={[styles.kicker, { color: tokens.cyan }]}>SESIÓN PROTEGIDA</Text>
          <Text style={[styles.title, { color: tokens.text }]}>Desbloquea Nexo</Text>
          <Text style={[styles.subtitle, { color: tokens.muted }]}>
            Usa {label} para abrir tu sesión guardada en este dispositivo. Tu contraseña no se almacena.
          </Text>
          {error ? <Text style={[styles.error, { color: tokens.danger }]}>{error}</Text> : null}
          <UiButton label="Desbloquear" onPress={retry} loading={busy} disabled={busy} />
          <Pressable onPress={usePassword} disabled={busy} style={styles.passwordButton}>
            <Text style={[styles.passwordText, { color: tokens.sky }]}>Usar contraseña</Text>
          </Pressable>
        </UiCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    justifyContent: "center",
    gap: spacing.xl,
  },
  orb: { height: 150, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", width: 132, height: 132, borderRadius: 66, borderWidth: 1 },
  ringOuter: {
    position: "absolute",
    width: 176,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    transform: [{ rotate: "-26deg" }],
  },
  core: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { alignItems: "center", gap: spacing.md },
  checking: { fontSize: 12 },
  card: { gap: spacing.md },
  kicker: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -1 },
  subtitle: { fontSize: 12.5, lineHeight: 19 },
  error: { fontSize: 11.5, lineHeight: 16 },
  passwordButton: { alignItems: "center", paddingVertical: spacing.sm },
  passwordText: { fontSize: 12, fontWeight: "700" },
});
