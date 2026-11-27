import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { theme } from "../src/theme/tokens";
import { createNote, deleteNote, getNote, listNotes } from "../src/features/notes/api";
import type { NoteKind } from "../src/features/notes/types";

const FILTERS: Array<{ id: "todas" | NoteKind; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "nota", label: "Notas" },
  { id: "contacto", label: "Contactos" },
  { id: "foto", label: "Fotos" },
  { id: "nfc", label: "NFC" },
];

export default function NotesScreen() {
  const scheme = useColorScheme() ?? "dark";
  const tokens = theme[scheme];
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<"todas" | NoteKind>("todas");

  const notes = useQuery({ queryKey: ["notes"], queryFn: listNotes });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["notes"] });

  const add = useMutation({
    mutationFn: () => createNote({ title: title.trim(), content: content.trim(), kind: "nota", source: "manual" }),
    onSuccess: async () => {
      setTitle("");
      setContent("");
      await invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: deleteNote,
    onSuccess: invalidate,
  });

  const shown = (notes.data ?? []).filter((note) =>
    filter === "todas" ? true : filter === "nfc" ? note.source === "nfc" : note.kind === filter,
  );

  const open = async (id: string) => {
    try {
      const note = await getNote(id);
      Alert.alert(note.title, [note.content || "Sin contenido", note.contact?.phone || "", note.contact?.email || ""].filter(Boolean).join("\n"));
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "No se pudo abrir la nota.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      <View style={styles.form}>
        <TextInput style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]} placeholder="Título de la nota" placeholderTextColor={tokens.muted} value={title} onChangeText={setTitle} />
        <TextInput style={[styles.input, styles.multiline, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]} placeholder="Contenido" placeholderTextColor={tokens.muted} value={content} onChangeText={setContent} multiline />
        <Pressable style={[styles.button, { backgroundColor: tokens.accent }]} onPress={() => add.mutate()} disabled={add.isPending || !title.trim()}>
          {add.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar nota</Text>}
        </Pressable>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFilter(f.id)}
            style={[styles.chip, { borderColor: tokens.border }, filter === f.id && { backgroundColor: tokens.accent, borderColor: tokens.accent }]}
          >
            <Text style={filter === f.id ? styles.chipActive : { color: tokens.muted }}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {notes.isLoading ? (
        <ActivityIndicator color={tokens.accent} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: tokens.border, backgroundColor: tokens.panel }]}>
              <Pressable onPress={() => open(item.id)} style={styles.cardMain}>
                <Text style={[styles.kind, { color: tokens.sky }]}>{item.kind}</Text>
                <Text style={[styles.cardTitle, { color: tokens.text }]}>{item.title}</Text>
                <Text style={[styles.preview, { color: tokens.muted }]} numberOfLines={2}>{item.content || "Sin contenido"}</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert("Eliminar", item.title, [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Eliminar", style: "destructive", onPress: () => remove.mutate(item.id) },
                  ])
                }
              >
                <Text style={{ color: "#f87171" }}>✕</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text style={[styles.empty, { color: tokens.muted }]}>Sin notas en este filtro.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  form: { gap: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  multiline: { minHeight: 70, textAlignVertical: "top" },
  button: { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  filters: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  chip: { borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
  chipActive: { color: "#fff", fontWeight: "700" },
  list: { gap: 8, paddingBottom: 24 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardMain: { flex: 1, gap: 2 },
  kind: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  cardTitle: { fontSize: 14, fontWeight: "600" },
  preview: { fontSize: 12 },
  empty: { textAlign: "center", marginTop: 24 },
});
