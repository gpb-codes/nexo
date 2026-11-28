import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  PageHeader,
  SectionHeader,
  UiButton,
  UiCard,
  UiInput,
  useAppTheme,
} from "../src/presentation/components/ui";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
} from "../src/presentation/hooks/use-projects";
import type { ProjectPriority, ProjectStatus } from "../src/domain/entities/project";
import { radii, spacing } from "../src/presentation/theme/tokens";

const PRIORITIES: ProjectPriority[] = ["alta", "media", "baja"];
type Filter = "todos" | ProjectStatus;
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "todos", label: "Todos" },
  { id: "activo", label: "Activos" },
  { id: "pausado", label: "Pausados" },
  { id: "completado", label: "Completados" },
  { id: "archivado", label: "Archivados" },
];

export default function ProjectsScreen() {
  const { tokens } = useAppTheme();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ProjectPriority>("media");
  const [dueDate, setDueDate] = useState("");
  const [color, setColor] = useState("#8b5cf6");
  const [filter, setFilter] = useState<Filter>("todos");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const projects = useProjects();
  const add = useCreateProject();
  const remove = useDeleteProject();

  const all = projects.data ?? [];
  const active = all.filter((project) => project.status === "activo");
  const completed = all.filter((project) => project.status === "completado");

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    return all.filter((project) => {
      const matchesFilter = filter === "todos" ? true : project.status === filter;
      const matchesSearch = !query
        ? true
        : [project.name, project.description, project.priority, project.status]
            .join(" ")
            .toLowerCase()
            .includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [all, filter, search]);

  const submit = () => {
    add.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate.trim() || undefined,
        color: color.trim() || undefined,
      },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          setDueDate("");
          setColor("#8b5cf6");
          setShowForm(false);
        },
      },
    );
  };

  const confirmDelete = (id: string, projectName: string) => {
    Alert.alert("Eliminar proyecto", projectName, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => remove.mutate(id) },
    ]);
  };

  const header = (
    <View style={styles.header}>
      <PageHeader
        kicker="OBJETIVOS"
        title="Proyectos"
        subtitle="Agrupa tus objetivos, revisa su estado y avanza sin perder el contexto."
      />

      <View style={styles.metrics}>
        <SummaryMetric value={active.length} label="Activos" />
        <SummaryMetric value={completed.length} label="Completados" />
        <SummaryMetric value={all.length} label="Total" />
      </View>

      <UiButton
        label={showForm ? "Cerrar formulario" : "Nuevo proyecto"}
        icon={showForm ? "close" : "plus"}
        variant={showForm ? "ghost" : "primary"}
        onPress={() => setShowForm((value) => !value)}
      />

      {showForm ? (
        <UiCard style={styles.form}>
          <UiInput label="Nombre" placeholder="Nombre del proyecto" value={name} onChangeText={setName} />
          <UiInput
            label="Descripción"
            placeholder="¿Qué quieres conseguir?"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <Text style={[styles.label, { color: tokens.muted }]}>Prioridad</Text>
          <View style={styles.chips}>
            {PRIORITIES.map((item) => (
              <Choice key={item} label={item} active={priority === item} onPress={() => setPriority(item)} />
            ))}
          </View>
          <View style={styles.formRow}>
            <UiInput
              label="Fecha límite"
              placeholder="AAAA-MM-DD"
              value={dueDate}
              onChangeText={setDueDate}
              containerStyle={styles.flex}
            />
            <UiInput
              label="Color"
              placeholder="#8b5cf6"
              value={color}
              onChangeText={setColor}
              containerStyle={styles.flex}
              autoCapitalize="none"
            />
          </View>
          <UiButton
            label="Crear proyecto"
            onPress={submit}
            loading={add.isPending}
            disabled={!name.trim()}
          />
          {add.error instanceof Error ? (
            <Text style={[styles.error, { color: tokens.danger }]}>{add.error.message}</Text>
          ) : null}
        </UiCard>
      ) : null}

      <UiInput
        placeholder="Buscar proyectos..."
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

      <SectionHeader title="Tus proyectos" hint={`${shown.length} visibles`} />
    </View>
  );

  return (
    <AppScreen title="Proyectos">
      <FlatList
        style={[styles.container, { backgroundColor: tokens.background }]}
      contentContainerStyle={styles.content}
      data={shown}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      keyboardShouldPersistTaps="handled"
      refreshing={projects.isRefetching}
      onRefresh={() => projects.refetch()}
      ListEmptyComponent={
        projects.isLoading ? (
          <ActivityIndicator color={tokens.accent} style={styles.loading} />
        ) : projects.isError ? (
          <EmptyState glyph="warning" title="No se pudieron cargar los proyectos" description="Desliza para intentar de nuevo." />
        ) : (
          <EmptyState glyph="projects" title="Sin proyectos en este filtro" description="Cambia el filtro o crea uno nuevo." />
        )
      }
      renderItem={({ item }) => (
        <UiCard style={styles.item}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Abrir ${item.name}`}
            onPress={() => router.push({ pathname: "/project/[id]", params: { id: item.id } })}
            style={styles.itemMain}
          >
            <View
              style={[
                styles.statusDot,
                { borderColor: tokens.borderStrong, backgroundColor: item.color || tokens.accentStrong },
              ]}
            />
            <View style={styles.itemCopy}>
              <Text style={[styles.itemTitle, { color: tokens.text }]} numberOfLines={2}>
                {item.name}
              </Text>
              {item.description ? (
                <Text style={[styles.itemDescription, { color: tokens.muted }]} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <View style={styles.metaRow}>
                <Badge
                  label={item.status}
                  tone={item.status === "activo" ? "accent" : item.status === "completado" ? "success" : "neutral"}
                />
                {item.role ? <Badge label={item.role} tone={item.role === "owner" ? "accent" : "sky"} /> : null}
                <Text style={[styles.meta, { color: tokens.faint }]}>{item.priority}</Text>
                <Text style={[styles.meta, { color: tokens.faint }]}>
                  {item.member_count || 1} {item.member_count === 1 ? "miembro" : "miembros"}
                </Text>
                {item.due_date ? <Text style={[styles.meta, { color: tokens.faint }]}>{item.due_date}</Text> : null}
              </View>
              {typeof item.task_count === "number" && item.task_count > 0 ? (
                <Text style={[styles.meta, { color: tokens.faint }]}>
                  {item.completed_task_count || 0}/{item.task_count} tareas
                </Text>
              ) : null}
            </View>
          </Pressable>
          {item.role === "owner" || !item.role ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Eliminar ${item.name}`}
              onPress={() => confirmDelete(item.id, item.name)}
              style={styles.delete}
            >
              <Text style={[styles.deleteText, { color: tokens.danger }]}>×</Text>
            </Pressable>
          ) : null}
        </UiCard>
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

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  header: { gap: spacing.lg, paddingBottom: spacing.sm },
  metrics: { flexDirection: "row", gap: spacing.sm },
  metric: { flex: 1, borderWidth: 1, borderRadius: radii.md, padding: spacing.md, gap: 2 },
  metricValue: { fontSize: 22, fontWeight: "800", letterSpacing: -0.6 },
  metricLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  form: { gap: spacing.md },
  formRow: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
  label: { fontSize: 11, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { minHeight: 34, borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  chipText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  error: { fontSize: 11 },
  loading: { marginTop: spacing.xl },
  item: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md },
  itemMain: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  statusDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, marginTop: 3 },
  itemCopy: { flex: 1, gap: 4 },
  itemTitle: { fontSize: 14, fontWeight: "700" },
  itemDescription: { fontSize: 11.5, lineHeight: 16 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontSize: 10, textTransform: "capitalize" },
  delete: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  deleteText: { fontSize: 22, lineHeight: 24 },
});
