import { useEffect } from "react";
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
  EmptyState,
  Glyph,
  Metric,
  PageHeader,
  ProgressBar,
  SectionHeader,
  UiButton,
  UiCard,
  useAppTheme,
} from "../src/presentation/components/ui";
import { useLogout, useSession } from "../src/presentation/hooks/use-auth";
import { useNotes } from "../src/presentation/hooks/use-notes";
import { useProjects } from "../src/presentation/hooks/use-projects";
import { usePendingChanges, useSync } from "../src/presentation/hooks/use-sync";
import { useTasks, useUpdateTask } from "../src/presentation/hooks/use-tasks";
import { avatarUrl } from "../src/presentation/theme/avatars";
import { WEB_BRAIN_URL } from "../src/presentation/theme/links";
import { radii, spacing } from "../src/presentation/theme/tokens";

export default function HomeScreen() {
  const router = useRouter();
  const { tokens } = useAppTheme();
  const session = useSession();
  const tasks = useTasks();
  const projects = useProjects();
  const notes = useNotes();
  const pending = usePendingChanges();
  const sync = useSync();
  const toggle = useUpdateTask();
  const logout = useLogout();

  useEffect(() => {
    if (session.isError) router.replace("/login");
  }, [session.isError, router]);

  const user = session.data;
  const allTasks = tasks.data ?? [];
  const allProjects = projects.data ?? [];
  const pendingTasks = allTasks.filter((task) => task.status === "pendiente");
  const completed = allTasks.length - pendingTasks.length;
  const progress = allTasks.length ? Math.round((completed / allTasks.length) * 100) : 0;
  const activeProjects = allProjects.filter((project) => project.status === "activo");
  const contactCount = (notes.data ?? []).filter((note) => note.kind === "contacto").length;
  const visibleName = user?.displayName || user?.name || user?.email || "Nexo";
  const avatarUri = avatarUrl(user?.avatar, user?.email);

  const openBrain = async () => {
    try {
      await Linking.openURL(WEB_BRAIN_URL);
    } catch {
      Alert.alert("No disponible", "No se pudo abrir el grafo del Segundo Cerebro.");
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

  if (session.isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: tokens.background }]}>
        <ActivityIndicator color={tokens.accent} />
      </View>
    );
  }

  return (
    <AppScreen title="Inicio">
      <ScrollView
        style={[styles.container, { backgroundColor: tokens.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
      <PageHeader
        kicker="ESPACIO PERSONAL"
        title="Bienvenido de vuelta,"
        subtitle="Tu segundo cerebro, en un solo lugar."
      />
      <Text style={[styles.heroName, { color: tokens.accent }]}>{visibleName}</Text>

      <UiCard style={styles.heroCard}>
        <View style={styles.orb}>
          <View style={[styles.orbRing, { borderColor: tokens.borderStrong }]} />
          <View style={[styles.orbRingOuter, { borderColor: tokens.border }]} />
          <Avatar uri={avatarUri} name={visibleName} size={116} />
        </View>
        <View style={styles.heroCopy}>
          <Badge label="Identidad" tone="sky" />
          <Text style={[styles.heroTitle, { color: tokens.text }]}>{visibleName}</Text>
          <Text style={[styles.heroEmail, { color: tokens.faint }]} numberOfLines={1}>
            {user?.email}
          </Text>
          <Text style={[styles.heroText, { color: tokens.muted }]}>
            Conocimiento, actividad y objetivos en un mismo espacio.
          </Text>
        </View>
      </UiCard>

      <View style={styles.metrics}>
        <Metric value={pendingTasks.length} label="Tareas" />
        <Metric value={activeProjects.length} label="Proyectos" />
        <Metric value={notes.data?.length ?? 0} label="Notas" />
        <Metric value={contactCount} label="Contactos" />
      </View>

      <UiCard onPress={openBrain} style={styles.brainCard}>
        <View style={[styles.brainIcon, { backgroundColor: tokens.accentSoft }]}>
          <Glyph name="brain" size={22} color={tokens.cyan} />
        </View>
        <View style={styles.brainCopy}>
          <Text style={[styles.brainTitle, { color: tokens.text }]}>Segundo Cerebro</Text>
          <Text style={[styles.brainSubtitle, { color: tokens.faint }]}>Explora el grafo de conocimiento</Text>
        </View>
        <Glyph name="arrow" size={20} color={tokens.cyan} />
      </UiCard>

      <UiCard style={styles.panel}>
        <SectionHeader
          title="Tareas diarias"
          right={<Badge label={`${pendingTasks.length} pendientes`} tone="accent" />}
        />
        <ProgressBar value={progress} />
        <Text style={[styles.progressLabel, { color: tokens.faint }]}>
          {completed} de {allTasks.length} completadas
        </Text>
        {pendingTasks.length === 0 ? (
          <EmptyState glyph="check" title="Sin tareas pendientes" description="Crea una tarea para empezar." />
        ) : (
          pendingTasks.slice(0, 4).map((task) => (
            <Pressable
              key={task.id}
              onPress={() => toggle.mutate({ id: task.id, patch: { status: "completada" } })}
              style={[styles.taskRow, { borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }]}
            >
              <View style={[styles.check, { borderColor: tokens.borderStrong }]} />
              <View style={styles.taskCopy}>
                <Text style={[styles.taskTitle, { color: tokens.text }]} numberOfLines={1}>
                  {task.title}
                </Text>
                <Text style={[styles.taskMeta, { color: tokens.faint }]}>
                  {task.priority} · {task.category || "Sin categoría"}
                  {task.due_date ? ` · ${task.due_date}` : ""}
                </Text>
              </View>
            </Pressable>
          ))
        )}
        <UiButton label="Ver todas las tareas" variant="ghost" compact onPress={() => router.push("/tasks")} />
      </UiCard>

      <UiCard style={styles.panel}>
        <SectionHeader
          title="Proyectos"
          right={<Badge label={`${activeProjects.length} activos`} tone="sky" />}
        />
        {activeProjects.length === 0 ? (
          <EmptyState glyph="projects" title="Sin proyectos activos" description="Crea un proyecto para organizar tus objetivos." />
        ) : (
          activeProjects.slice(0, 4).map((project) => (
            <View
              key={project.id}
              style={[styles.projectRow, { borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }]}
            >
              <Badge label={project.status} tone="sky" />
              <View style={styles.projectCopy}>
                <Text style={[styles.projectTitle, { color: tokens.text }]} numberOfLines={1}>
                  {project.name}
                </Text>
                <Text style={[styles.projectMeta, { color: tokens.faint }]}>
                  {project.priority}
                  {project.description ? ` · ${project.description}` : ""}
                </Text>
              </View>
            </View>
          ))
        )}
        <View style={styles.panelActions}>
          <UiButton label="Nuevo proyecto" compact onPress={() => router.push("/projects")} style={styles.flexButton} />
          <UiButton
            label="Ver proyectos"
            variant="ghost"
            compact
            onPress={() => router.push("/projects")}
            style={styles.flexButton}
          />
        </View>
      </UiCard>

      <UiCard style={styles.panel}>
        <SectionHeader title="Herramientas" hint="Accesos directos" />
        <View style={styles.toolsGrid}>
          <ToolButton glyph="contact" label="Contactos" onPress={() => router.push("/contacts")} />
          <ToolButton glyph="chat" label="Asistente IA" onPress={() => router.push("/chat")} />
          <ToolButton glyph="settings" label="Ajustes" onPress={() => router.push("/settings")} />
          <ToolButton
            glyph="sync"
            label={sync.isPending ? "Sincronizando" : `Sincronizar${pending.data ? ` (${pending.data})` : ""}`}
            onPress={() => sync.mutate()}
          />
        </View>
        <UiButton label="Cerrar sesión" variant="danger" compact onPress={confirmLogout} />
      </UiCard>
      </ScrollView>
    </AppScreen>
  );
}

function ToolButton({ glyph, label, onPress }: { glyph: "contact" | "chat" | "settings" | "sync"; label: string; onPress: () => void }) {
  const { tokens } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.toolButton,
        { borderColor: tokens.border, backgroundColor: tokens.surfaceSoft },
        pressed && { opacity: 0.86 },
      ]}
    >
      <Glyph name={glyph} size={18} color={tokens.accent} />
      <Text style={[styles.toolLabel, { color: tokens.text }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroName: { fontSize: 34, lineHeight: 38, fontWeight: "800", letterSpacing: -1.4, marginTop: -spacing.md },
  heroCard: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  orb: { width: 132, height: 132, alignItems: "center", justifyContent: "center" },
  orbRing: {
    position: "absolute",
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
  },
  orbRingOuter: {
    position: "absolute",
    width: 156,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    transform: [{ rotate: "-24deg" }],
  },
  heroCopy: { flex: 1, gap: 5 },
  heroTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.4 },
  heroEmail: { fontSize: 11 },
  heroText: { fontSize: 12, lineHeight: 17 },
  metrics: { flexDirection: "row", gap: spacing.sm },
  brainCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderColor: "rgba(103,232,249,0.28)",
  },
  brainIcon: { width: 44, height: 44, borderRadius: radii.md, alignItems: "center", justifyContent: "center" },
  brainCopy: { flex: 1, gap: 2 },
  brainTitle: { fontSize: 15, fontWeight: "800" },
  brainSubtitle: { fontSize: 11 },
  panel: { gap: spacing.md },
  progressLabel: { fontSize: 10.5, marginTop: -4 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 10,
  },
  check: { width: 18, height: 18, borderRadius: 9, borderWidth: 1 },
  taskCopy: { flex: 1, gap: 2 },
  taskTitle: { fontSize: 13, fontWeight: "700" },
  taskMeta: { fontSize: 10 },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 10,
  },
  projectCopy: { flex: 1, gap: 2 },
  projectTitle: { fontSize: 13, fontWeight: "700" },
  projectMeta: { fontSize: 10 },
  panelActions: { flexDirection: "row", gap: spacing.sm },
  flexButton: { flex: 1 },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  toolButton: {
    width: "48.5%",
    minHeight: 54,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  toolLabel: { fontSize: 11.5, fontWeight: "700", flexShrink: 1 },
});
