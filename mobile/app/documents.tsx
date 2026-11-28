import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import {
  AppScreen,
  Badge,
  EmptyState,
  Glyph,
  PageHeader,
  SectionHeader,
  UiButton,
  UiCard,
  UiInput,
  useAppTheme,
} from "../src/presentation/components/ui";
import { useCreateDocument, useDocuments } from "../src/presentation/hooks/use-documents";
import { radii, spacing } from "../src/presentation/theme/tokens";

export default function DocumentsScreen() {
  const { tokens } = useAppTheme();
  const router = useRouter();
  const documents = useDocuments();
  const add = useCreateDocument();

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const all = documents.data ?? [];
  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return all;
    return all.filter((document) =>
      [document.title, document.content, document.project_name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [all, search]);

  const submit = () => {
    if (!title.trim()) return;
    add.mutate(
      { title: title.trim(), content: content.trim() },
      {
        onSuccess: () => {
          setTitle("");
          setContent("");
          setShowForm(false);
        },
      },
    );
  };

  const header = (
    <View style={styles.header}>
      <PageHeader
        kicker="BIBLIOTECA"
        title="Documentos"
        subtitle="Tus documentos personales y los compartidos en proyectos, con versiones y actividad."
      />

      <View style={styles.metrics}>
        <SummaryMetric value={all.length} label="Total" />
        <SummaryMetric value={all.filter((document) => document.project_id).length} label="En proyectos" />
        <SummaryMetric value={all.filter((document) => document.status === "archivado").length} label="Archivados" />
      </View>

      <UiButton
        label={showForm ? "Cerrar formulario" : "Nuevo documento"}
        icon={showForm ? "close" : "plus"}
        variant={showForm ? "ghost" : "primary"}
        onPress={() => setShowForm((value) => !value)}
      />

      {showForm ? (
        <UiCard style={styles.form}>
          <UiInput label="Título" placeholder="Nombre del documento" value={title} onChangeText={setTitle} />
          <UiInput
            label="Contenido"
            placeholder="Escribe el documento..."
            value={content}
            onChangeText={setContent}
            multiline
          />
          <UiButton label="Crear documento" onPress={submit} loading={add.isPending} disabled={!title.trim()} />
          {add.error instanceof Error ? (
            <Text style={[styles.error, { color: tokens.danger }]}>{add.error.message}</Text>
          ) : null}
        </UiCard>
      ) : null}

      <UiInput
        placeholder="Buscar documentos..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <SectionHeader title="Tus documentos" hint={`${shown.length} visibles`} />
    </View>
  );

  return (
    <AppScreen title="Documentos">
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        data={shown}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        refreshing={documents.isRefetching}
        onRefresh={() => documents.refetch()}
        ListEmptyComponent={
          documents.isLoading ? (
            <ActivityIndicator color={tokens.accent} style={styles.loading} />
          ) : documents.isError ? (
            <EmptyState glyph="warning" title="No se pudieron cargar los documentos" description="Desliza para intentar de nuevo." />
          ) : (
            <EmptyState glyph="documents" title="Sin documentos" description="Crea uno personal o desde un proyecto compartido." />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/document/[id]", params: { id: item.id } })}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          >
            <UiCard style={styles.item}>
              <View style={[styles.icon, { backgroundColor: tokens.accentSoft }]}>
                <Glyph name="documents" size={18} color={tokens.accent} />
              </View>
              <View style={styles.copy}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: tokens.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.status === "archivado" ? <Badge label="archivado" tone="neutral" /> : null}
                </View>
                <Text style={[styles.preview, { color: tokens.muted }]} numberOfLines={2}>
                  {item.content || "Sin contenido todavía."}
                </Text>
                <View style={styles.metaRow}>
                  {item.project_name ? <Badge label={item.project_name} tone="sky" /> : <Badge label="personal" tone="neutral" />}
                  {item.role ? <Text style={[styles.meta, { color: tokens.faint }]}>{item.role}</Text> : null}
                  <Text style={[styles.meta, { color: tokens.faint }]}>
                    {formatDate(item.updated_at || item.created_at)}
                  </Text>
                </View>
              </View>
              <Glyph name="arrow" size={16} color={tokens.faint} />
            </UiCard>
          </Pressable>
        )}
      />
    </AppScreen>
  );
}

function SummaryMetric({ value, label }: { value: number; label: string }) {
  const { tokens } = useAppTheme();
  return (
    <View style={[styles.metric, { borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }]}>
      <Text style={[styles.metricValue, { color: tokens.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: tokens.faint }]}>{label}</Text>
    </View>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  header: { gap: spacing.lg, paddingBottom: spacing.sm },
  metrics: { flexDirection: "row", gap: spacing.sm },
  metric: { flex: 1, borderWidth: 1, borderRadius: radii.sm, padding: spacing.md, gap: 2 },
  metricValue: { fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
  metricLabel: { fontSize: 9.5, fontWeight: "600" },
  form: { gap: spacing.md },
  error: { fontSize: 11 },
  loading: { marginTop: spacing.xl },
  item: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md },
  icon: { width: 42, height: 42, borderRadius: radii.sm, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  title: { flex: 1, fontSize: 13.5, fontWeight: "800" },
  preview: { fontSize: 11, lineHeight: 15 },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm },
  meta: { fontSize: 9.5, textTransform: "capitalize" },
});
