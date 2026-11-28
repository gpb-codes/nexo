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
import {
  AppScreen,
  Badge,
  EmptyState,
  PageHeader,
  ProgressBar,
  SectionHeader,
  UiButton,
  UiCard,
  UiInput,
  useAppTheme,
} from "../src/presentation/components/ui";
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "../src/presentation/hooks/use-tasks";
import { useProjects } from "../src/presentation/hooks/use-projects";
import type { TaskPriority } from "../src/domain/entities/task";
import { radii, spacing } from "../src/presentation/theme/tokens";

const PRIORITIES: TaskPriority[] = ["alta", "media", "baja"];
type Filter = "todas" | "pendiente" | "completada" | TaskPriority;
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "pendiente", label: "Pendientes" },
  { id: "completada", label: "Completadas" },
  { id: "alta", label: "Alta" },
  { id: "media", label: "Media" },
  { id: "baja", label: "Baja" },
];

export default function TasksScreen() {
  const { tokens } = useAppTheme();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("media");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [tags, setTags] = useState("");
  const [filter, setFilter] = useState<Filter>("todas");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const tasks = useTasks();
  const projects = useProjects();
  const add = useCreateTask();
  const toggle = useUpdateTask();
  const remove = useDeleteTask();

  const all = tasks.data ?? [];
  const writableProjects = (projects.data ?? []).filter((project) => project.role !== "viewer");
  const pending = all.filter((task) => task.status === "pendiente");
  const completed = all.length - pending.length;
  const progress = all.length ? Math.round((completed / all.length) * 100) : 0;

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    return all.filter((task) => {
      const matchesFilter =
        filter === "todas"
          ? true
          : filter === "pendiente" || filter === "completada"
            ? task.status === filter
            : task.priority === filter;
      const matchesSearch = !query
        ? true
        : [task.title, task.category, task.priority, task.status, task.project_name, ...(task.tags ?? [])]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [all, filter, search]);

  const submit = () => {
    add.mutate(
      {
        title: title.trim(),
        priority,
        category: category.trim() || undefined,
        due_date: dueDate.trim() || undefined,
        project_id: projectId,
        tags: parseTags(tags),
      },
      {
        onSuccess: () => {
          setTitle("");
          setCategory("");
          setDueDate("");
          setProjectId(null);
          setTags("");
          setShowForm(false);
        },
      },
    );
  };

  const confirmDelete = (id: string, taskTitle: string) => {
    Alert.alert("Eliminar tarea", taskTitle, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => remove.mutate(id) },
    ]);
  };

  const header = (
    <View style={styles.header}>
      <PageHeader
        kicker="ACTIVIDAD"
        title="Tareas"
        subtitle="Organiza lo que necesitas hacer y mantén visible tu progreso real."
      />

      <UiCard style={styles.summary}>
        <SectionHeader title="Progreso diario" right={<Badge label={`${pending.length} pendientes`} tone="accent" />} />
        <ProgressBar value={progress} />
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryText, { color: tokens.faint }]}>
            {completed} de {all.length} completadas
          </Text>
          <Text style={[styles.summaryText, { color: tokens.cyan }]}>{progress}%</Text>
        </View>
      </UiCard>

      <UiButton
        label={showForm ? "Cerrar formulario" : "Nueva tarea"}
        icon={showForm ? "close" : "plus"}
        variant={showForm ? "ghost" : "primary"}
        onPress={() => setShowForm((value) => !value)}
      />

      {showForm ? (
        <UiCard style={styles.form}>
          <UiInput label="Título" placeholder="¿Qué necesitas hacer?" value={title} onChangeText={setTitle} />
          <View style={styles.formRow}>
            <UiInput
              label="Categoría"
              placeholder="Lectura, familia..."
              value={category}
              onChangeText={setCategory}
              containerStyle={styles.flex}
            />
            <UiInput
              label="Fecha límite"
              placeholder="AAAA-MM-DD"
              value={dueDate}
              onChangeText={setDueDate}
              containerStyle={styles.flex}
            />
          </View>
          <Text style={[styles.label, { color: tokens.muted }]}>Prioridad</Text>
          <View style={styles.chips}>
            {PRIORITIES.map((item) => (
              <Choice
                key={item}
                label={item}
                active={priority === item}
                onPress={() => setPriority(item)}
              />
            ))}
          </View>
          <UiInput
            label="Etiquetas"
            placeholder="backend, diseño, urgente"
            value={tags}
            onChangeText={setTags}
          />
          <Text style={[styles.label, { color: tokens.muted }]}>Proyecto</Text>
          <View style={styles.chips}>
            <Choice label="Sin proyecto" active={!projectId} onPress={() => setProjectId(null)} />
            {writableProjects.map((project) => (
              <Choice
                key={project.id}
                label={project.name}
                active={projectId === project.id}
                onPress={() => setProjectId(project.id)}
              />
            ))}
          </View>
          <UiButton
            label="Agregar tarea"
            onPress={submit}
            loading={add.isPending}
            disabled={!title.trim()}
          />
          {add.error instanceof Error ? (
            <Text style={[styles.error, { color: tokens.danger }]}>{add.error.message}</Text>
          ) : null}
        </UiCard>
      ) : null}

      <UiInput
        placeholder="Buscar tareas..."
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

      <SectionHeader title="Tus tareas" hint={`${shown.length} visibles`} />
    </View>
  );

  return (
    <AppScreen title="Tareas">
      <FlatList
        style={[styles.container, { backgroundColor: tokens.background }]}
      contentContainerStyle={styles.content}
      data={shown}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      keyboardShouldPersistTaps="handled"
      refreshing={tasks.isRefetching}
      onRefresh={() => tasks.refetch()}
      ListEmptyComponent={
        tasks.isLoading ? (
          <ActivityIndicator color={tokens.accent} style={styles.loading} />
        ) : tasks.isError ? (
          <EmptyState glyph="warning" title="No se pudieron cargar las tareas" description="Desliza para intentar de nuevo." />
        ) : (
          <EmptyState glyph="tasks" title="Sin tareas en este filtro" description="Cambia el filtro o crea una tarea nueva." />
        )
      }
      renderItem={({ item }) => (
        <UiCard style={styles.item}>
          <Pressable
            onPress={() =>
              toggle.mutate({
                id: item.id,
                patch: { status: item.status === "completada" ? "pendiente" : "completada" },
              })
            }
            style={styles.itemMain}
          >
            <View
              style={[
                styles.check,
                { borderColor: tokens.borderStrong },
                item.status === "completada" && { backgroundColor: tokens.accentStrong, borderColor: tokens.accentStrong },
              ]}
            >
              {item.status === "completada" ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <View style={styles.itemCopy}>
              <Text
                style={[
                  styles.itemTitle,
                  { color: tokens.text },
                  item.status === "completada" && { color: tokens.faint, textDecorationLine: "line-through" },
                ]}
                numberOfLines={2}
              >
                {item.title}
              </Text>
              <View style={styles.metaRow}>
                <Badge label={item.priority} tone={item.priority === "alta" ? "danger" : item.priority === "media" ? "warning" : "neutral"} />
                <Text style={[styles.meta, { color: tokens.faint }]} numberOfLines={1}>
                  {item.category || "Sin categoría"}
                  {item.due_date ? ` · ${item.due_date}` : ""}
                </Text>
                {item.project_name ? <Badge label={item.project_name} tone="sky" /> : null}
                {item.assignee_name ? <Text style={[styles.meta, { color: tokens.faint }]}>{item.assignee_name}</Text> : null}
                {item.tags?.length ? (
                  <Text style={[styles.meta, { color: tokens.faint }]} numberOfLines={1}>
                    {item.tags.join(" · ")}
                  </Text>
                ) : null}
              </View>
            </View>
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
    </AppScreen>
  );
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
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
  summary: { gap: spacing.sm },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryText: { fontSize: 10.5, fontWeight: "600" },
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
  itemMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md },
  check: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  checkMark: { color: "#fff", fontSize: 12, fontWeight: "800" },
  itemCopy: { flex: 1, gap: 5 },
  itemTitle: { fontSize: 13.5, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontSize: 10, flexShrink: 1 },
  delete: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  deleteText: { fontSize: 22, lineHeight: 24 },
});
