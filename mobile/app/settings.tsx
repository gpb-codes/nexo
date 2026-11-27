import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { theme, palette } from "../src/presentation/theme/tokens";
import { useSession } from "../src/presentation/hooks/use-auth";
import { useUpdatePreferences } from "../src/presentation/hooks/use-preferences";

const ACCENTS = [palette.purple, palette.sky, "#10b981", "#f59e0b", "#ef4444"];

export default function SettingsScreen() {
  const scheme = useColorScheme() ?? "dark";
  const tokens = theme[scheme];
  const session = useSession();

  const [siteName, setSiteName] = useState("Nexo");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [accent, setAccent] = useState(palette.purple);
  const [mode, setMode] = useState<"claro" | "oscuro">(scheme === "light" ? "claro" : "oscuro");

  useEffect(() => {
    const user = session.data;
    if (!user) return;
    setSiteName(user.site?.name ?? "Nexo");
    setTagline(user.site?.tagline ?? "");
    setDescription(user.site?.description ?? "");
    setDisplayName(user.displayName ?? "");
    setAccent(user.accent ?? palette.purple);
    setMode(user.theme === "claro" ? "claro" : "oscuro");
  }, [session.data]);

  const save = useUpdatePreferences();

  if (session.isLoading) return <ActivityIndicator color={tokens.accent} style={{ flex: 1 }} />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: tokens.background }]}>
      <Text style={[styles.kicker, { color: tokens.sky }]}>IDENTIDAD</Text>
      <TextInput style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]} placeholder="Nombre de la web" placeholderTextColor={tokens.muted} value={siteName} onChangeText={setSiteName} />
      <TextInput style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]} placeholder="Subtítulo" placeholderTextColor={tokens.muted} value={tagline} onChangeText={setTagline} />
      <TextInput style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]} placeholder="Descripción" placeholderTextColor={tokens.muted} value={description} onChangeText={setDescription} />
      <TextInput style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]} placeholder="Nombre visible" placeholderTextColor={tokens.muted} value={displayName} onChangeText={setDisplayName} />

      <Text style={[styles.kicker, { color: tokens.sky, marginTop: 18 }]}>TEMA</Text>
      <View style={styles.row}>
        {(["oscuro", "claro"] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            style={[styles.chip, { borderColor: tokens.border }, mode === m && { backgroundColor: tokens.accent, borderColor: tokens.accent }]}
          >
            <Text style={mode === m ? styles.chipActive : { color: tokens.muted }}>{m}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.kicker, { color: tokens.sky, marginTop: 18 }]}>ACENTO</Text>
      <View style={styles.row}>
        {ACCENTS.map((color) => (
          <Pressable
            key={color}
            onPress={() => setAccent(color)}
            style={[styles.swatch, { backgroundColor: color }, accent === color && styles.swatchActive]}
          />
        ))}
      </View>

      <Pressable style={[styles.button, { backgroundColor: tokens.accent }]} onPress={() =>
        save.mutate({
          siteName: siteName.trim(),
          siteTagline: tagline.trim(),
          siteDescription: description.trim(),
          displayName: displayName.trim() || null,
          accent,
          theme: mode,
        })
      } disabled={save.isPending}>
        {save.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar cambios</Text>}
      </Pressable>
      {save.error instanceof Error && <Text style={styles.error}>{save.error.message}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  kicker: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10 },
  row: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  chip: { borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14 },
  chipActive: { color: "#fff", fontWeight: "700" },
  swatch: { width: 34, height: 34, borderRadius: 17 },
  swatchActive: { borderWidth: 3, borderColor: "#fff" },
  button: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 24 },
  buttonText: { color: "#fff", fontWeight: "700" },
  error: { color: "#f87171", fontSize: 12, marginTop: 10 },
});
