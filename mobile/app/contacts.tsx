import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { theme } from "../src/presentation/theme/tokens";
import { useCreateNote, useDeleteNote, useNotes } from "../src/presentation/hooks/use-notes";
import type { Note } from "../src/domain/entities/note";

export default function ContactsScreen() {
  const scheme = useColorScheme() ?? "dark";
  const tokens = theme[scheme];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [note, setNote] = useState("");

  const all = useNotes();
  const contacts = (all.data ?? []).filter((item) => item.kind === "contacto");
  const add = useCreateNote();
  const remove = useDeleteNote();

  const openWhatsApp = async (value?: string) => {
    const digits = (value || "").replace(/\D/g, "");
    if (!digits) {
      Alert.alert("Sin teléfono", "Este contacto no tiene número para WhatsApp.");
      return;
    }
    try {
      await Linking.openURL(`https://wa.me/${digits}`);
    } catch {
      Alert.alert("Error", "No se pudo abrir WhatsApp.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      <Text style={[styles.intro, { color: tokens.muted }]}>
        Registra posibles socios o colaboradores. No es la agenda del teléfono: estos contactos viven en Nexo y puedes abrirlos en WhatsApp cuando quieras.
      </Text>
      <View style={styles.form}>
        <TextInput style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]} placeholder="Nombre" placeholderTextColor={tokens.muted} value={name} onChangeText={setName} />
        <TextInput style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]} placeholder="Teléfono" placeholderTextColor={tokens.muted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]} placeholder="Correo" placeholderTextColor={tokens.muted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]} placeholder="Organización" placeholderTextColor={tokens.muted} value={org} onChangeText={setOrg} />
        <TextInput style={[styles.input, styles.multiline, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]} placeholder="Nota de trabajo" placeholderTextColor={tokens.muted} value={note} onChangeText={setNote} multiline />
        <Pressable style={[styles.button, { backgroundColor: tokens.accent }]} onPress={() =>
          add.mutate(
            {
              kind: "contacto",
              title: name.trim() || phone.trim() || "Contacto",
              content: note.trim(),
              source: "manual",
              contact: { name: name.trim(), phone: phone.trim(), email: email.trim(), org: org.trim() },
            },
            {
              onSuccess: () => {
                setName("");
                setPhone("");
                setEmail("");
                setOrg("");
                setNote("");
              },
            },
          )
        } disabled={add.isPending || (!name && !phone && !email)}>
          {add.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar contacto</Text>}
        </Pressable>
        {add.error instanceof Error && <Text style={styles.error}>{add.error.message}</Text>}
      </View>

      {all.isLoading ? (
        <ActivityIndicator color={tokens.accent} />
      ) : (
        <FlatList<Note>
          data={contacts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: tokens.border, backgroundColor: tokens.panel }]}>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: tokens.text }]}>{item.title}</Text>
                <Text style={[styles.meta, { color: tokens.muted }]}>
                  {[item.contact?.phone, item.contact?.email, item.contact?.org].filter(Boolean).join(" · ") || "Sin datos"}
                </Text>
                {!!item.content && <Text style={[styles.noteText, { color: tokens.muted }]}>{item.content}</Text>}
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => openWhatsApp(item.contact?.phone)}>
                  <Text style={{ color: tokens.accent, fontWeight: "700" }}>WhatsApp</Text>
                </Pressable>
                <Pressable onPress={() => remove.mutate(item.id)}>
                  <Text style={{ color: "#f87171" }}>✕</Text>
                </Pressable>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={[styles.empty, { color: tokens.muted }]}>Sin contactos guardados.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  intro: { fontSize: 12.5, lineHeight: 18 },
  form: { gap: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  multiline: { minHeight: 70, textAlignVertical: "top" },
  button: { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  error: { color: "#f87171", fontSize: 12 },
  list: { gap: 8, paddingBottom: 24 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: "row", gap: 10 },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 14, fontWeight: "600" },
  meta: { fontSize: 11 },
  noteText: { fontSize: 12 },
  actions: { gap: 8, alignItems: "flex-end" },
  empty: { textAlign: "center", marginTop: 20 },
});
