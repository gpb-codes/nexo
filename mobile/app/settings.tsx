import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  AppScreen,
  Avatar,
  Badge,
  Glyph,
  PageHeader,
  SectionHeader,
  UiButton,
  UiCard,
  UiInput,
  useAppTheme,
} from "../src/presentation/components/ui";
import { useLogout, useSession } from "../src/presentation/hooks/use-auth";
import { useUpdatePreferences } from "../src/presentation/hooks/use-preferences";
import { usePendingChanges, useSync } from "../src/presentation/hooks/use-sync";
import {
  authenticateWithBiometrics,
  getBiometricCapability,
  type BiometricCapability,
} from "../src/infrastructure/security/biometric";
import { getBiometricEnabled, setBiometricEnabled } from "../src/infrastructure/storage/session-store";
import { AVATAR_STYLES, avatarUrl, DEFAULT_AVATAR } from "../src/presentation/theme/avatars";
import { TERMS_URL, WEB_APP_URL } from "../src/presentation/theme/links";
import { palette, radii, spacing } from "../src/presentation/theme/tokens";

const ACCENTS = [palette.purple, palette.purpleSoft, palette.sky, palette.cyan, "#10b981", "#f59e0b", "#ef4444"];

export default function SettingsScreen() {
  const router = useRouter();
  const { tokens } = useAppTheme();
  const session = useSession();
  const save = useUpdatePreferences();
  const logout = useLogout();
  const pending = usePendingChanges();
  const sync = useSync();

  const [siteName, setSiteName] = useState("Nexo");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accent, setAccent] = useState<string>(palette.purple);
  const [mode, setMode] = useState<"claro" | "oscuro">("oscuro");
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);
  const [biometric, setBiometric] = useState<BiometricCapability>({
    available: false,
    enrolled: false,
    label: "biometría",
  });
  const [biometricEnabled, setBiometricEnabledState] = useState(false);
  const [biometricBusy, setBiometricBusy] = useState(false);

  useEffect(() => {
    Promise.all([getBiometricCapability(), getBiometricEnabled()]).then(([capability, enabled]) => {
      setBiometric(capability);
      setBiometricEnabledState(enabled);
    });
  }, []);

  useEffect(() => {
    const user = session.data;
    if (!user) return;
    setSiteName(user.site?.name ?? "Nexo");
    setTagline(user.site?.tagline ?? "");
    setDescription(user.site?.description ?? "");
    setDisplayName(user.displayName ?? "");
    setAccent(user.accent ?? palette.purple);
    setMode(user.theme === "claro" ? "claro" : "oscuro");
    setAvatar(user.avatar || DEFAULT_AVATAR);
  }, [session.data]);

  const user = session.data;
  const seed = user?.email || "nexo";

  const submit = () => {
    save.mutate(
      {
        siteName: siteName.trim(),
        siteTagline: tagline.trim(),
        siteDescription: description.trim(),
        displayName: displayName.trim() || null,
        accent,
        theme: mode,
        avatar,
      },
      {
        onSuccess: () => Alert.alert("Ajustes guardados", "La identidad visual se actualizó en tu cuenta."),
      },
    );
  };

  const openTerms = async () => {
    try {
      await Linking.openURL(TERMS_URL);
    } catch {
      Alert.alert("No disponible", "No se pudieron abrir los términos y condiciones.");
    }
  };

  const openWeb = async () => {
    try {
      await Linking.openURL(WEB_APP_URL);
    } catch {
      Alert.alert("No disponible", "No se pudo abrir la versión web de Nexo.");
    }
  };

  const confirmLogout = () => {
    Alert.alert("Cerrar sesión", "¿Quieres salir de Nexo en este dispositivo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => logout.mutate(undefined, { onSuccess: () => router.replace("/login") }),
      },
    ]);
  };

  const toggleBiometric = async () => {
    if (biometricEnabled) {
      await setBiometricEnabled(false);
      setBiometricEnabledState(false);
      return;
    }
    if (!biometric.available) {
      Alert.alert(
        "Biometría no disponible",
        "Configura una huella o un rostro en los ajustes de seguridad del dispositivo y vuelve a intentarlo.",
      );
      return;
    }
    setBiometricBusy(true);
    const success = await authenticateWithBiometrics("Activa el desbloqueo biométrico de Nexo");
    if (success) {
      await setBiometricEnabled(true);
      setBiometricEnabledState(true);
    } else {
      Alert.alert("No se activó", "La verificación biométrica no se completó.");
    }
    setBiometricBusy(false);
  };

  if (session.isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: tokens.background }]}>
        <ActivityIndicator color={tokens.accent} />
      </View>
    );
  }

  return (
    <AppScreen title="Ajustes">
      <ScrollView
        style={[styles.container, { backgroundColor: tokens.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      <PageHeader
        kicker="CONFIGURACIÓN"
        title="Ajustes"
        subtitle="Perfil, identidad visual, sincronización y seguridad de tu espacio."
      />

      <UiCard style={styles.profileCard}>
        <Avatar uri={avatarUrl(avatar, seed)} name={displayName || user?.name || "Nexo"} size={72} />
        <View style={styles.profileCopy}>
          <Text style={[styles.profileName, { color: tokens.text }]}>{displayName || user?.name || "Nexo"}</Text>
          <Text style={[styles.profileEmail, { color: tokens.faint }]}>{user?.email}</Text>
          <Badge label="Sesión activa" tone="success" />
        </View>
      </UiCard>

      <UiCard style={styles.panel}>
        <SectionHeader title="Perfil" hint="Identidad personal" />
        <UiInput label="Nombre visible" placeholder="Tu nombre" value={displayName} onChangeText={setDisplayName} />
        <UiInput label="Correo" value={user?.email ?? ""} editable={false} />
        <Text style={[styles.hint, { color: tokens.faint }]}>
          El correo identifica tu cuenta y no se puede cambiar desde la app.
        </Text>
      </UiCard>

      <UiCard style={styles.panel}>
        <SectionHeader title="Identidad de la web" hint="Se comparte con Nexo" />
        <UiInput label="Nombre de la web" value={siteName} onChangeText={setSiteName} maxLength={40} />
        <UiInput label="Subtítulo" value={tagline} onChangeText={setTagline} maxLength={80} />
        <UiInput label="Descripción" value={description} onChangeText={setDescription} maxLength={160} />
      </UiCard>

      <UiCard style={styles.panel}>
        <SectionHeader title="Apariencia" hint="Tema y color" />
        <Text style={[styles.label, { color: tokens.muted }]}>Tema</Text>
        <View style={styles.row}>
          {(["oscuro", "claro"] as const).map((item) => (
            <Pressable
              key={item}
              onPress={() => setMode(item)}
              style={[
                styles.choice,
                {
                  borderColor: mode === item ? tokens.accentStrong : tokens.border,
                  backgroundColor: mode === item ? tokens.accentStrong : "transparent",
                },
              ]}
            >
              <Text style={[styles.choiceText, { color: mode === item ? tokens.onAccent : tokens.muted }]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={[styles.label, { color: tokens.muted }]}>Color de acento</Text>
        <View style={styles.row}>
          {ACCENTS.map((color) => (
            <Pressable
              key={color}
              onPress={() => setAccent(color)}
              accessibilityLabel={`Color ${color}`}
              style={[
                styles.swatch,
                { backgroundColor: color, borderColor: accent === color ? tokens.text : "transparent" },
              ]}
            />
          ))}
        </View>
        <Text style={[styles.label, { color: tokens.muted }]}>Avatar</Text>
        <View style={styles.avatarGrid}>
          {AVATAR_STYLES.map((style) => {
            const selected = avatar === style.id;
            return (
              <Pressable
                key={style.id}
                onPress={() => setAvatar(style.id)}
                style={[
                  styles.avatarOption,
                  {
                    borderColor: selected ? tokens.accentStrong : tokens.border,
                    backgroundColor: selected ? tokens.accentSoft : "transparent",
                  },
                ]}
              >
                <Avatar uri={avatarUrl(style.id, seed)} name={style.name} size={38} />
                <Text style={[styles.avatarName, { color: selected ? tokens.accent : tokens.muted }]} numberOfLines={1}>
                  {style.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </UiCard>

      <UiCard style={styles.panel}>
        <SectionHeader title="Asistente IA" hint="Clave protegida" />
        <Text style={[styles.hint, { color: tokens.muted }]}>
          La API key se configura en la web y permanece en el servidor. La app móvil nunca la muestra ni la guarda en el dispositivo.
        </Text>
        <UiButton label="Abrir Nexo web" variant="secondary" compact icon="external" onPress={openWeb} />
      </UiCard>

      <UiCard style={styles.panel}>
        <SectionHeader
          title="Sincronización"
          hint={pending.data ? `${pending.data} cambios pendientes` : "Todo al día"}
          right={<Badge label={pending.data ? "Pendiente" : "Al día"} tone={pending.data ? "warning" : "success"} />}
        />
        <UiButton
          label={sync.isPending ? "Sincronizando..." : "Sincronizar ahora"}
          icon="sync"
          variant="secondary"
          onPress={() => sync.mutate()}
          loading={sync.isPending}
        />
      </UiCard>

      <UiCard style={styles.panel}>
        <SectionHeader title="Seguridad" hint="Sesión del dispositivo" />
        <View style={styles.securityRow}>
          <Glyph name="check" size={16} color={tokens.success} />
          <Text style={[styles.hint, { color: tokens.muted, flex: 1 }]}>
            Sesión protegida con almacenamiento seguro y token Bearer.
          </Text>
        </View>
        <View style={styles.biometricRow}>
          <View style={styles.biometricCopy}>
            <Text style={[styles.label, { color: tokens.text }]}>Desbloqueo biométrico</Text>
            <Text style={[styles.hint, { color: tokens.faint }]}>
              {biometric.available
                ? `Usa ${biometric.label} para abrir tu sesión guardada.`
                : "Configura huella o rostro en el dispositivo para activarlo."}
            </Text>
          </View>
          <Badge label={biometricEnabled ? "Activo" : "Inactivo"} tone={biometricEnabled ? "success" : "neutral"} />
        </View>
        <UiButton
          label={biometricEnabled ? "Desactivar biometría" : "Activar biometría"}
          variant="secondary"
          onPress={toggleBiometric}
          loading={biometricBusy}
          disabled={!biometric.available && !biometricEnabled}
        />
        <UiButton label="Cerrar sesión" variant="danger" onPress={confirmLogout} loading={logout.isPending} />
      </UiCard>

      <UiCard style={styles.panel}>
        <SectionHeader title="Legal" hint="Nexo" />
        <UiButton label="Términos y condiciones" variant="ghost" icon="external" onPress={openTerms} />
      </UiCard>

      <UiButton
        label="Guardar cambios"
        onPress={submit}
        loading={save.isPending}
        disabled={!siteName.trim()}
      />
      {save.error instanceof Error ? (
        <Text style={[styles.error, { color: tokens.danger }]}>{save.error.message}</Text>
      ) : null}
      <Text style={[styles.footer, { color: tokens.faint }]}>Nexo · Tu segundo cerebro unificado</Text>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  profileCard: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  profileCopy: { flex: 1, gap: 4 },
  profileName: { fontSize: 19, fontWeight: "800", letterSpacing: -0.4 },
  profileEmail: { fontSize: 11 },
  panel: { gap: spacing.md },
  label: { fontSize: 11, fontWeight: "700" },
  hint: { fontSize: 11.5, lineHeight: 17 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, alignItems: "center" },
  choice: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2 },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  avatarOption: {
    width: "23%",
    minWidth: 72,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    gap: 4,
  },
  avatarName: { fontSize: 8.5, fontWeight: "700" },
  securityRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  biometricRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  biometricCopy: { flex: 1, gap: 2 },
  error: { fontSize: 11.5, textAlign: "center" },
  footer: { fontSize: 10, textAlign: "center", letterSpacing: 0.4 },
});
