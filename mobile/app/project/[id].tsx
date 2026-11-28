import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AppScreen,
  Avatar,
  Badge,
  EmptyState,
  Glyph,
  PageHeader,
  ProgressBar,
  SectionHeader,
  UiButton,
  UiCard,
  UiInput,
  useAppTheme,
} from "../../src/presentation/components/ui";
import { useSession } from "../../src/presentation/hooks/use-auth";
import {
  useDeleteProject,
  useInviteMember,
  useProject,
  useRemoveMember,
  useUpdateProject,
} from "../../src/presentation/hooks/use-projects";
import { useCreateTask, useUpdateTask } from "../../src/presentation/hooks/use-tasks";
import { useCreateDocument } from "../../src/presentation/hooks/use-documents";
import { avatarUrl, DEFAULT_AVATAR } from "../../src/presentation/theme/avatars";
import { radii, spacing } from "../../src/presentation/theme/tokens";
import type { TaskPriority } from "../../src/domain/entities/task";
import type { ProjectStatus } from "../../src/domain/entities/project";

const PRIORITIES: TaskPriority[] = ["alta", "media", "baja"];
const STATUSES: ProjectStatus[] = ["activo", "pausado", "completado", "archivado"];

const ACTION_LABELS: Record<string, string> = {
  "project.created": "creó el proyecto",
  "project.updated": "actualizó el proyecto",
  "project.status_changed": "cambió el estado del proyecto",
  "task.created": "creó una tarea",
  "task.updated": "actualizó una tarea",
  "task.status_changed": "cambió el estado de una tarea",
  "task.deleted": "eliminó una tarea",
  "member.invited": "invitó a un miembro",
  "member.removed": "quitó a un miembro",
  "document.created": "creó un documento",
  "document.updated": "actualizó un documento",
  "document.deleted": "eliminó un documento",
};

export default function ProjectDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const projectId = typeof params.id === "string" ? params.id : params.id?.[0] || "";
  const router = useRouter();
  const { tokens } = useAppTheme();
  const session = useSession();
  const detail = useProject(projectId || null);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const invite = useInviteMember();
  const removeMember = useRemoveMember();
  const addTask = useCreateTask();
  const toggleTask = useUpdateTask();
  const addDocument = useCreateDocument();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("media");
  const [taskTags, setTaskTags] = useState("");
  const [taskAssignee, setTaskAssignee] = useState<string | null>(null);
  const [showDocForm, setShowDocForm] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");

  const data = detail.data;
  const project = data?.project;
  const role = project?.role || "viewer";
  const canEdit = role === "owner" || role === "editor";
  const isOwner = role === "owner";
  const currentUserId = session.data?.id;
  const tasks = data?.tasks ?? [];
  const completed = tasks.filter((task) => task.status === "completada").length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const submitTask = () => {
    if (!projectId || !taskTitle.trim()) return;
    addTask.mutate(
      {
        title: taskTitle.trim(),
        priority: taskPriority,
        project_id: projectId,
        assignee_id: taskAssignee,
        tags: parseTags(taskTags),
      },
      {
        onSuccess: () => {
          setTaskTitle("");
          setTaskTags("");
          setTaskAssignee(null);
          setShowTaskForm(false);
          detail.refetch();
        },
      },
    );
  };

  const submitDocument = () => {
    if (!projectId || !docTitle.trim()) return;
    addDocument.mutate(
      { title: docTitle.trim(), content: docContent.trim(), project_id: projectId },
      {
        onSuccess: () => {
          setDocTitle("");
          setDocContent("");
          setShowDocForm(false);
          detail.refetch();
        },
      },
    );
  };

  const submitInvite = () => {
    if (!projectId || !inviteEmail.trim()) return;
    invite.mutate(
      { project_id: projectId, email: inviteEmail.trim(), role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
          setShowInvite(false);
          detail.refetch();
        },
      },
    );
  };

  const confirmRemove = (userId: string, name: string) => {
    Alert.alert("Quitar miembro", `¿Quitar a ${name} del proyecto?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Quitar",
        style: "destructive",
        onPress: () => removeMember.mutate({ projectId, userId }, { onSuccess: () => detail.refetch() }),
      },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert("Eliminar proyecto", "Se eliminarán sus documentos y actividad. Las tareas quedarán sin proyecto.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () =>
          deleteProject.mutate(projectId, {
            onSuccess: () => router.replace("/projects"),
          }),
      },
    ]);
  };

  if (detail.isLoading) {
    return (
      <AppScreen title="Proyecto" back>
        <View style={styles.center}>
          <ActivityIndicator color={tokens.accent} />
        </View>
      </AppScreen>
    );
  }

  if (detail.isError || !data || !project) {
    return (
      <AppScreen title="Proyecto" back>
        <View style={styles.center}>
          <EmptyState
            glyph="warning"
            title="No se pudo abrir el proyecto"
            description="Puede que ya no tengas acceso o que el proyecto haya sido eliminado."
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Proyecto" back>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          kicker="PROYECTO COMPARTIDO"
          title={project.name}
          subtitle={project.description || "Sin descripción todavía."}
        />

        <UiCard style={styles.panel}>
          <View style={styles.titleRow}>
            <View style={[styles.colorDot, { backgroundColor: project.color || tokens.accent }]} />
            <Badge label={role} tone={role === "owner" ? "accent" : role === "editor" ? "sky" : "neutral"} />
            <Badge label={project.priority} tone={project.priority === "alta" ? "danger" : "warning"} />
            {project.due_date ? <Badge label={project.due_date} tone="neutral" /> : null}
          </View>
          <ProgressBar value={progress} />
          <Text style={[styles.progressText, { color: tokens.faint }]}>
            {completed} de {tasks.length} tareas completadas · {data.members.length} miembros
          </Text>
          <View style={styles.statusRow}>
            {STATUSES.map((status) => (
              <Pressable
                key={status}
                disabled={!canEdit}
                onPress={() => updateProject.mutate({ id: projectId, patch: { status } })}
                style={[
                  styles.statusChip,
                  {
                    borderColor: project.status === status ? tokens.accentStrong : tokens.border,
                    backgroundColor: project.status === status ? tokens.accentStrong : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: project.status === status ? tokens.onAccent : tokens.muted },
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            ))}
          </View>
        </UiCard>

        <UiCard style={styles.panel}>
          <SectionHeader
            title="Tareas del proyecto"
            hint={`${tasks.length} tareas`}
            right={
              <UiButton
                label={showTaskForm ? "Cerrar" : "Añadir"}
                compact
                icon={showTaskForm ? "close" : "plus"}
                onPress={() => setShowTaskForm((value) => !value)}
              />
            }
          />
          {showTaskForm ? (
            <View style={styles.form}>
              <UiInput label="Título" placeholder="Nueva tarea del proyecto" value={taskTitle} onChangeText={setTaskTitle} />
              <UiInput
                label="Etiquetas"
                placeholder="diseño, backend, urgente"
                value={taskTags}
                onChangeText={setTaskTags}
              />
              <Text style={[styles.label, { color: tokens.muted }]}>Prioridad</Text>
              <View style={styles.chips}>
                {PRIORITIES.map((item) => (
                  <Choice key={item} label={item} active={taskPriority === item} onPress={() => setTaskPriority(item)} />
                ))}
              </View>
              <Text style={[styles.label, { color: tokens.muted }]}>Responsable</Text>
              <View style={styles.chips}>
                <Choice label="Sin asignar" active={!taskAssignee} onPress={() => setTaskAssignee(null)} />
                {data.members.map((member) => (
                  <Choice
                    key={member.user_id}
                    label={member.name}
                    active={taskAssignee === member.user_id}
                    onPress={() => setTaskAssignee(member.user_id)}
                  />
                ))}
              </View>
              <UiButton
                label="Crear tarea"
                onPress={submitTask}
                loading={addTask.isPending}
                disabled={!taskTitle.trim()}
              />
            </View>
          ) : null}
          {tasks.length === 0 ? (
            <EmptyState glyph="tasks" title="Sin tareas todavía" description="Añade la primera tarea de este proyecto." />
          ) : (
            tasks.map((task) => (
              <Pressable
                key={task.id}
                onPress={() =>
                  toggleTask.mutate({
                    id: task.id,
                    patch: { status: task.status === "completada" ? "pendiente" : "completada" },
                  })
                }
                style={[styles.taskRow, { borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }]}
              >
                <View
                  style={[
                    styles.check,
                    { borderColor: tokens.borderStrong },
                    task.status === "completada" && { backgroundColor: tokens.success, borderColor: tokens.success },
                  ]}
                >
                  {task.status === "completada" ? <Text style={styles.checkMark}>✓</Text> : null}
                </View>
                <View style={styles.taskCopy}>
                  <Text
                    style={[
                      styles.taskTitle,
                      { color: tokens.text },
                      task.status === "completada" && { color: tokens.faint, textDecorationLine: "line-through" },
                    ]}
                  >
                    {task.title}
                  </Text>
                  <Text style={[styles.meta, { color: tokens.faint }]}>
                    {task.assignee_name || "Sin asignar"}
                    {task.tags?.length ? ` · ${task.tags.join(", ")}` : ""}
                  </Text>
                </View>
                <Badge label={task.priority} tone={task.priority === "alta" ? "danger" : "neutral"} />
              </Pressable>
            ))
          )}
        </UiCard>

        <UiCard style={styles.panel}>
          <SectionHeader
            title="Documentos"
            hint={`${data.documents.length} compartidos`}
            right={
              canEdit ? (
                <UiButton
                  label={showDocForm ? "Cerrar" : "Nuevo"}
                  compact
                  icon={showDocForm ? "close" : "plus"}
                  onPress={() => setShowDocForm((value) => !value)}
                />
              ) : null
            }
          />
          {showDocForm ? (
            <View style={styles.form}>
              <UiInput label="Título" placeholder="Documento del proyecto" value={docTitle} onChangeText={setDocTitle} />
              <UiInput
                label="Contenido"
                placeholder="Escribe el documento..."
                value={docContent}
                onChangeText={setDocContent}
                multiline
              />
              <UiButton
                label="Crear documento"
                onPress={submitDocument}
                loading={addDocument.isPending}
                disabled={!docTitle.trim()}
              />
            </View>
          ) : null}
          {data.documents.length === 0 ? (
            <EmptyState glyph="documents" title="Sin documentos" description="Crea un documento compartido para el equipo." />
          ) : (
            data.documents.map((document) => (
              <Pressable
                key={document.id}
                onPress={() => router.push({ pathname: "/document/[id]", params: { id: document.id } })}
                style={[styles.documentRow, { borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }]}
              >
                <View style={[styles.docIcon, { backgroundColor: tokens.accentSoft }]}>
                  <Glyph name="documents" size={17} color={tokens.accent} />
                </View>
                <View style={styles.docCopy}>
                  <Text style={[styles.docTitle, { color: tokens.text }]} numberOfLines={1}>
                    {document.title}
                  </Text>
                  <Text style={[styles.meta, { color: tokens.faint }]} numberOfLines={1}>
                    {document.content || "Sin contenido"} · {formatDate(document.updated_at || document.created_at)}
                  </Text>
                </View>
                <Glyph name="arrow" size={16} color={tokens.faint} />
              </Pressable>
            ))
          )}
        </UiCard>

        <UiCard style={styles.panel}>
          <SectionHeader
            title="Miembros"
            hint={`${data.members.length} personas`}
            right={
              isOwner ? (
                <UiButton
                  label={showInvite ? "Cerrar" : "Invitar"}
                  compact
                  icon={showInvite ? "close" : "plus"}
                  onPress={() => setShowInvite((value) => !value)}
                />
              ) : null
            }
          />
          {showInvite ? (
            <View style={styles.form}>
              <UiInput
                label="Correo de la persona"
                placeholder="persona@correo.com"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={[styles.label, { color: tokens.muted }]}>Rol</Text>
              <View style={styles.chips}>
                <Choice label="Editor" active={inviteRole === "editor"} onPress={() => setInviteRole("editor")} />
                <Choice label="Lector" active={inviteRole === "viewer"} onPress={() => setInviteRole("viewer")} />
              </View>
              <Text style={[styles.hint, { color: tokens.faint }]}>
                La persona debe tener una cuenta en Nexo. No se envían correos automáticos todavía.
              </Text>
              <UiButton
                label="Añadir al proyecto"
                onPress={submitInvite}
                loading={invite.isPending}
                disabled={!inviteEmail.trim()}
              />
              {invite.error instanceof Error ? (
                <Text style={[styles.error, { color: tokens.danger }]}>{invite.error.message}</Text>
              ) : null}
            </View>
          ) : null}
          {data.members.map((member) => (
            <View
              key={member.user_id}
              style={[styles.memberRow, { borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }]}
            >
              <Avatar uri={avatarUrl(member.avatar, member.email)} name={member.name} size={38} />
              <View style={styles.memberCopy}>
                <Text style={[styles.memberName, { color: tokens.text }]} numberOfLines={1}>
                  {member.name}
                  {member.user_id === currentUserId ? " · tú" : ""}
                </Text>
                <Text style={[styles.meta, { color: tokens.faint }]} numberOfLines={1}>
                  {member.email}
                </Text>
              </View>
              <Badge
                label={member.role}
                tone={member.role === "owner" ? "accent" : member.role === "editor" ? "sky" : "neutral"}
              />
              {isOwner && member.role !== "owner" ? (
                <Pressable
                  onPress={() => confirmRemove(member.user_id, member.name)}
                  style={styles.removeButton}
                  accessibilityLabel={`Quitar a ${member.name}`}
                >
                  <Glyph name="trash" size={17} color={tokens.danger} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </UiCard>

        <UiCard style={styles.panel}>
          <SectionHeader title="Actividad" hint="Quién hizo qué" />
          {data.activity.length === 0 ? (
            <EmptyState glyph="notes" title="Sin actividad" description="Los cambios del proyecto aparecerán aquí." />
          ) : (
            data.activity.map((entry) => (
              <View key={entry.id} style={styles.activityRow}>
                <Avatar uri={avatarUrl(DEFAULT_AVATAR, entry.actor_name)} name={entry.actor_name} size={30} />
                <View style={styles.activityCopy}>
                  <Text style={[styles.activityText, { color: tokens.text }]}>
                    <Text style={{ fontWeight: "800" }}>{entry.actor_name}</Text>{" "}
                    {ACTION_LABELS[entry.action] || entry.action}
                  </Text>
                  {entry.detail?.title || entry.detail?.email ? (
                    <Text style={[styles.meta, { color: tokens.faint }]} numberOfLines={1}>
                      {String(entry.detail?.title || entry.detail?.email)}
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.activityDate, { color: tokens.faint }]}>{formatDate(entry.created_at)}</Text>
              </View>
            ))
          )}
        </UiCard>

        {isOwner ? (
          <UiCard style={styles.panel}>
            <SectionHeader title="Zona del propietario" hint="Acciones irreversibles" />
            <UiButton label="Eliminar proyecto" variant="danger" onPress={confirmDelete} loading={deleteProject.isPending} />
          </UiCard>
        ) : null}
      </ScrollView>
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
      <Text style={[styles.chipText, { color: active ? tokens.onAccent : tokens.muted }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  panel: { gap: spacing.md },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  progressText: { fontSize: 10.5 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statusChip: {
    minHeight: 32,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: { fontSize: 10.5, fontWeight: "700", textTransform: "capitalize" },
  form: { gap: spacing.md },
  label: { fontSize: 11, fontWeight: "700" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    maxWidth: "100%",
    minHeight: 34,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  hint: { fontSize: 10.5, lineHeight: 15 },
  error: { fontSize: 11 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 10,
  },
  check: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  checkMark: { color: "#fff", fontSize: 11, fontWeight: "800" },
  taskCopy: { flex: 1, gap: 2 },
  taskTitle: { fontSize: 12.5, fontWeight: "700" },
  meta: { fontSize: 10 },
  documentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 10,
  },
  docIcon: { width: 34, height: 34, borderRadius: radii.sm, alignItems: "center", justifyContent: "center" },
  docCopy: { flex: 1, gap: 2 },
  docTitle: { fontSize: 12.5, fontWeight: "700" },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: 8,
  },
  memberCopy: { flex: 1, gap: 1 },
  memberName: { fontSize: 12, fontWeight: "700" },
  removeButton: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  activityRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  activityCopy: { flex: 1, gap: 1 },
  activityText: { fontSize: 11.5, lineHeight: 16 },
  activityDate: { fontSize: 9 },
});
