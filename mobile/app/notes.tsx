import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AppScreen,
  Badge,
  EmptyState,
  PageHeader,
  SectionHeader,
  UiButton,
  UiCard,
  UiInput,
  useAppTheme,
} from "../src/presentation/components/ui";
import { useCreateNote, useDeleteNote, useNote, useNotes } from "../src/presentation/hooks/use-notes";
import type { NoteKind } from "../src/domain/entities/note";
import { radii, spacing } from "../src/presentation/theme/tokens";

type Filter = "todas" | NoteKind;
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "nota", label: "Notas" },
  { id: "contacto", label: "Contactos" },
  { id: "foto", label: "Fotos" },
  { id: "nfc", label: "NFC" },
];

const KIND_LABEL: Record<NoteKind, string> = {
  nota: "Nota",
  contacto: "Contacto",
  foto: "Foto",
  nfc: "NFC",
};

export default function NotesScreen() {
  const { tokens } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<Filter>("todas");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const notes = useNotes();
  const add = useCreateNote();
  const remove = useDeleteNote();
  const detail = useNote(detailId);

  const all = notes.data ?? [];
  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    return all.filter((note) => {
      const matchesFilter =
        filter === "todas" ? true : filter === "nfc" ? note.source === "nfc" : note.kind === filter;
      const matchesSearch = !query
        ? true
        : [note.title, note.content, note.kind, note.source, note.contact?.name, note.contact?.org]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [all, filter, search]);

  const submit = () => {
    add.mutate(
      { title: title.trim(), content: content.trim(), kind: "nota", source: "manual" },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setShowForm(false);
        },
      },
    );
  };

  const confirmDelete = (id: string, noteTitle: string) => {
    Alert.alert("Eliminar nota", noteTitle, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => remove.mutate(id) },
    ]);
  };

  const header = (
    <View style={styles.header}>
      <PageHeader
        kicker="CONOCIMIENTO"
        title="Notas"
        subtitle="Captura ideas, referencias y contactos en un mismo lugar."
      />

      <UiButton
        label={showForm ? "Cerrar formulario" : "Nueva nota"}
        icon={showForm ? "close" : "plus"}
        variant={showForm ? "ghost" : "primary"}
        onPress={() => setShowForm((value) => !value)}
      />

      {showForm ? (
        <UiCard style={styles.form}>
          <UiInput label="Título" placeholder="Título de la nota" value={title} onChangeText={setTitle} />
          <UiInput
            label="Contenido"
            placeholder="Escribe una idea, una referencia..."
            value={content}
            onChangeText={setContent}
            multiline
          />
          <UiButton
            label="Guardar nota"
            onPress={submit}
            loading={add.isPending}
            disabled={!title.trim() && !content.trim()}
          />
          {add.error instanceof Error ? (
            <Text style={[styles.error, { color: tokens.danger }]}>{add.error.message}</Text>
          ) : null}
        </UiCard>
      ) : null}

      <UiInput
        placeholder="Buscar notas y capturas..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.chips}>
        {FILTERS.map((item) => (
          <Choice key={item.id} label={item.label} active={filter === item.id} onPress={() => setFilter(item.id)} />
        ))}
      </View>

      <SectionHeader title="Tus notas" hint={`${shown.length} visibles`} />
    </View>
  );

  return (
    <AppScreen title="Notas">
      <FlatList
        style={[styles.container, { backgroundColor: tokens.background }]}
        contentContainerStyle={styles.content}
        data={shown}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        refreshing={notes.isRefetching}
        onRefresh={() => notes.refetch()}
        ListEmptyComponent={
          notes.isLoading ? (
            <ActivityIndicator color={tokens.accent} style={styles.loading} />
          ) : notes.isError ? (
            <EmptyState glyph="warning" title="No se pudieron cargar las notas" description="Desliza para intentar de nuevo." />
          ) : (
            <EmptyState glyph="notes" title="Sin notas en este filtro" description="Crea una nota o cambia el filtro." />
          )
        }
        renderItem={({ item }) => (
          <UiCard style={styles.item}>
            <Pressable onPress={() => setDetailId(item.id)} style={styles.itemMain}>
              <View style={styles.itemTop}>
                <Badge label={KIND_LABEL[item.kind]} tone={item.kind === "contacto" ? "sky" : "accent"} />
                <Text style={[styles.date, { color: tokens.faint }]}>{formatDate(item.createdAt)}</Text>
              </View>
              <Text style={[styles.itemTitle, { color: tokens.text }]} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.preview, { color: tokens.muted }]} numberOfLines={2}>
                {item.content || item.contact?.name || "Sin contenido"}
              </Text>
              {item.contact ? (
                <Text style={[styles.contact, { color: tokens.faint }]} numberOfLines={1}>
                  {[item.contact.phone, item.contact.email, item.contact.org].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Eliminar ${item.title}`}
              onPress={() => confirmDelete(item.id, item.title)}
              style={styles.delete}
            >
              <Text style={[styles.deleteText, { color: tokens.danger }]}>×</Text>
            </Pressable>
          </UiCard>
        )}
      />

      <Modal
        visible={!!detailId}
        transparent
        animationType="slide"
        onRequestClose={() => setDetailId(null)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDetailId(null)} />
          <View
            style={[
              styles.detailSheet,
              {
                paddingBottom: Math.max(insets.bottom, spacing.lg),
                backgroundColor: tokens.panel,
                borderColor: tokens.borderStrong,
              },
            ]}
          >
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { color: tokens.text }]}>Detalle de la nota</Text>
              <Pressable onPress={() => setDetailId(null)} accessibilityLabel="Cerrar">
                <Text style={[styles.close, { color: tokens.muted }]}>×</Text>
              </Pressable>
            </View>
            {detail.isLoading ? (
              <ActivityIndicator color={tokens.accent} style={styles.detailLoading} />
            ) : detail.data ? (
              <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
                <Badge label={KIND_LABEL[detail.data.kind]} tone="accent" />
                <Text style={[styles.detailTitle, { color: tokens.text }]}>{detail.data.title}</Text>
                <Text style={[styles.detailDate, { color: tokens.faint }]}>{formatDate(detail.data.createdAt)}</Text>
                {detail.data.content ? (
                  <Text style={[styles.detailBody, { color: tokens.muted }]}>{detail.data.content}</Text>
                ) : null}
                {detail.data.contact ? (
                  <View style={[styles.contactBox, { borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }]}>
                    {detail.data.contact.name ? (
                      <Text style={[styles.contactLine, { color: tokens.text }]}>{detail.data.contact.name}</Text>
                    ) : null}
                    {detail.data.contact.phone ? (
                      <Text style={[styles.contactLine, { color: tokens.muted }]}>{detail.data.contact.phone}</Text>
                    ) : null}
                    {detail.data.contact.email ? (
                      <Text style={[styles.contactLine, { color: tokens.muted }]}>{detail.data.contact.email}</Text>
                    ) : null}
                    {detail.data.contact.org ? (
                      <Text style={[styles.contactLine, { color: tokens.muted }]}>{detail.data.contact.org}</Text>
                    ) : null}
                  </View>
                ) : null}
                {detail.data.image ? (
                  <Image source={{ uri: detail.data.image }} style={styles.detailImage} resizeMode="cover" />
                ) : null}
              </ScrollView>
            ) : (
              <EmptyState glyph="warning" title="No se pudo abrir la nota" />
            )}
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

function Choice({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { tokens } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderColor: active ? tokens.accentStrong : tokens.border,
          backgroundColor: active ? tokens.accentStrong : "transparent",
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? tokens.onAccent : tokens.muted }]}>{label}</Text>
    </Pressable>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  header: { gap: spacing.lg, paddingBottom: spacing.sm },
  form: { gap: spacing.md },
  error: { fontSize: 11 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { minHeight: 34, borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  chipText: { fontSize: 11, fontWeight: "700" },
  loading: { marginTop: spacing.xl },
  item: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md },
  itemMain: { flex: 1, gap: 4 },
  itemTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  date: { fontSize: 9.5 },
  itemTitle: { fontSize: 14, fontWeight: "700" },
  preview: { fontSize: 11.5, lineHeight: 16 },
  contact: { fontSize: 10.5 },
  delete: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  deleteText: { fontSize: 22, lineHeight: 24 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.58)" },
  detailSheet: {
    maxHeight: "86%",
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { fontSize: 15, fontWeight: "800" },
  close: { fontSize: 26, lineHeight: 28 },
  detailLoading: { marginVertical: spacing.xl },
  detailContent: { gap: spacing.sm, paddingBottom: spacing.md },
  detailTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.6 },
  detailDate: { fontSize: 10.5 },
  detailBody: { fontSize: 13.5, lineHeight: 20 },
  contactBox: { borderWidth: 1, borderRadius: radii.md, padding: spacing.md, gap: 4 },
  contactLine: { fontSize: 12 },
  detailImage: { width: "100%", height: 220, borderRadius: radii.md, marginTop: spacing.sm },
});
