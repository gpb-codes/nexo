import { useEffect, useState } from "react";
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
  SectionHeader,
  UiButton,
  UiCard,
  UiInput,
  useAppTheme,
} from "../../src/presentation/components/ui";
import { useSession } from "../../src/presentation/hooks/use-auth";
import {
  useDeleteDocument,
  useDocument,
  useUpdateDocument,
} from "../../src/presentation/hooks/use-documents";
import { avatarUrl, DEFAULT_AVATAR } from "../../src/presentation/theme/avatars";
import { radii, spacing } from "../../src/presentation/theme/tokens";
import type { DocumentVersion } from "../../src/domain/entities/document";

const ACTION_LABELS: Record<string, string> = {
  "document.created": "creó el documento",
  "document.updated": "actualizó el documento",
  "document.deleted": "eliminó el documento",
};

export default function DocumentDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const documentId = typeof params.id === "string" ? params.id : params.id?.[0] || "";
  const router = useRouter();
  const { tokens } = useAppTheme();
  const session = useSession();
  const detail = useDocument(documentId || null);
  const update = useUpdateDocument();
  const remove = useDeleteDocument();

  const doc = detail.data;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (doc && !editing) {
      setTitle(doc.title);
      setContent(doc.content || "");
    }
  }, [doc?.id, doc?.updated_at, editing]);

  const currentUserId = session.data?.id;
  const canEdit = !!doc && (doc.owner_id === currentUserId || doc.role === "owner" || doc.role === "editor");
  const isOwner = !!doc && (doc.owner_id === currentUserId || doc.role === "owner");

  const startEdit = () => {
    if (!doc) return;
    setTitle(doc.title);
    setContent(doc.content || "");
    setEditing(true);
  };

  const save = () => {
    if (!doc || !title.trim()) return;
    update.mutate(
      { id: doc.id, patch: { title: title.trim(), content } },
      {
        onSuccess: () => {
          setEditing(false);
          detail.refetch();
        },
      },
    );
  };

  const toggleArchive = () => {
    if (!doc) return;
    update.mutate(
      { id: doc.id, patch: { status: doc.status === "archivado" ? "activo" : "archivado" } },
      { onSuccess: () => detail.refetch() },
    );
  };

  const confirmDelete = () => {
    if (!doc) return;
    Alert.alert("Eliminar documento", `¿Eliminar “${doc.title}”? Esta acción no se puede deshacer.`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () =>
          remove.mutate(doc.id, {
            onSuccess: () => router.replace("/documents"),
          }),
      },
    ]);
  };

  const restore = (version: DocumentVersion) => {
    if (!doc) return;
    Alert.alert("Restaurar versión", `¿Restaurar “${version.title}”?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Restaurar",
        onPress: () =>
          update.mutate(
            { id: doc.id, patch: { title: version.title, content: version.content } },
            {
              onSuccess: () => {
                setEditing(false);
                detail.refetch();
              },
            },
          ),
      },
    ]);
  };

  if (detail.isLoading) {
    return (
      <AppScreen title="Documento" back>
        <View style={styles.center}>
          <ActivityIndicator color={tokens.accent} />
        </View>
      </AppScreen>
    );
  }

  if (detail.isError || !doc) {
    return (
      <AppScreen title="Documento" back>
        <View style={styles.center}>
          <EmptyState
            glyph="warning"
            title="No se pudo abrir el documento"
            description="Puede que ya no tengas acceso o que haya sido eliminado."
          />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Documento" back>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          kicker="DOCUMENTO COMPARTIDO"
          title={doc.title}
          subtitle={doc.project_name ? `Proyecto: ${doc.project_name}` : "Documento personal"}
        />

        <UiCard style={styles.panel}>
          <View style={styles.badgeRow}>
            <Badge label={doc.status} tone={doc.status === "archivado" ? "neutral" : "success"} />
            {doc.project_name ? <Badge label={doc.project_name} tone="sky" /> : null}
            {doc.role ? <Badge label={doc.role} tone={doc.role === "owner" ? "accent" : "neutral"} /> : null}
            <Text style={[styles.meta, { color: tokens.faint }]}>
              Actualizado {formatDateTime(doc.updated_at || doc.created_at)}
            </Text>
          </View>

          {doc.project_id ? (
            <Pressable
              onPress={() => router.push({ pathname: "/project/[id]", params: { id: doc.project_id as string } })}
              style={[styles.projectLink, { borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }]}
            >
              <Glyph name="projects" size={16} color={tokens.accent} />
              <Text style={[styles.projectLinkText, { color: tokens.text }]} numberOfLines={1}>
                Abrir proyecto {doc.project_name}
              </Text>
              <Glyph name="arrow" size={15} color={tokens.faint} />
            </Pressable>
          ) : null}

          <View style={styles.actions}>
            {canEdit ? (
              <UiButton
                label={editing ? "Cancelar edición" : "Editar"}
                icon={editing ? "close" : "notes"}
                variant={editing ? "ghost" : "secondary"}
                onPress={() => (editing ? setEditing(false) : startEdit())}
              />
            ) : null}
            {canEdit ? (
              <UiButton
                label={doc.status === "archivado" ? "Reactivar" : "Archivar"}
                icon="check"
                variant="ghost"
                onPress={toggleArchive}
                loading={update.isPending}
              />
            ) : null}
            {isOwner ? <UiButton label="Eliminar" variant="danger" onPress={confirmDelete} loading={remove.isPending} /> : null}
          </View>
        </UiCard>

        <UiCard style={styles.panel}>
          <SectionHeader title="Contenido" hint={editing ? "Editando" : "Lectura"} />
          {editing ? (
            <View style={styles.form}>
              <UiInput label="Título" value={title} onChangeText={setTitle} />
              <UiInput
                label="Contenido"
                value={content}
                onChangeText={setContent}
                multiline
                style={styles.editor}
              />
              <UiButton
                label="Guardar cambios"
                onPress={save}
                loading={update.isPending}
                disabled={!title.trim()}
              />
              {update.error instanceof Error ? (
                <Text style={[styles.error, { color: tokens.danger }]}>{update.error.message}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={[styles.contentText, { color: doc.content ? tokens.text : tokens.faint }]}>
              {doc.content || "Este documento todavía no tiene contenido."}
            </Text>
          )}
        </UiCard>

        <UiCard style={styles.panel}>
          <SectionHeader title="Historial de versiones" hint={`${doc.versions?.length || 0} versiones`} />
          {!doc.versions?.length ? (
            <EmptyState glyph="notes" title="Sin versiones" description="Cada edición guardará una versión anterior." />
          ) : (
            doc.versions.map((version) => (
              <View key={version.id} style={[styles.versionRow, { borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }]}>
                <View style={styles.versionCopy}>
                  <Text style={[styles.versionTitle, { color: tokens.text }]} numberOfLines={1}>
                    {version.title}
                  </Text>
                  <Text style={[styles.meta, { color: tokens.faint }]}>
                    {version.editor_name} · {formatDateTime(version.created_at)}
                  </Text>
                  <Text style={[styles.versionPreview, { color: tokens.muted }]} numberOfLines={2}>
                    {version.content || "Sin contenido"}
                  </Text>
                </View>
                {canEdit ? (
                  <Pressable
                    onPress={() => restore(version)}
                    style={[styles.restoreButton, { borderColor: tokens.borderStrong }]}
                  >
                    <Text style={[styles.restoreText, { color: tokens.accent }]}>Restaurar</Text>
                  </Pressable>
                ) : null}
              </View>
            ))
          )}
        </UiCard>

        <UiCard style={styles.panel}>
          <SectionHeader title="Actividad" hint="Quién hizo qué" />
          {!doc.activity?.length ? (
            <EmptyState glyph="notes" title="Sin actividad" description="Los cambios del documento aparecerán aquí." />
          ) : (
            doc.activity.map((entry) => (
              <View key={entry.id} style={styles.activityRow}>
                <Avatar uri={avatarUrl(DEFAULT_AVATAR, entry.actor_name)} name={entry.actor_name} size={30} />
                <View style={styles.activityCopy}>
                  <Text style={[styles.activityText, { color: tokens.text }]}>
                    <Text style={{ fontWeight: "800" }}>{entry.actor_name}</Text>{" "}
                    {ACTION_LABELS[entry.action] || entry.action}
                  </Text>
                </View>
                <Text style={[styles.activityDate, { color: tokens.faint }]}>{formatDateTime(entry.created_at)}</Text>
              </View>
            ))
          )}
        </UiCard>
      </ScrollView>
    </AppScreen>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  panel: { gap: spacing.md },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: spacing.sm },
  meta: { fontSize: 9.5 },
  projectLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  projectLinkText: { flex: 1, fontSize: 11.5, fontWeight: "700" },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  form: { gap: spacing.md },
  editor: { minHeight: 220, textAlignVertical: "top" },
  error: { fontSize: 11 },
  contentText: { fontSize: 13, lineHeight: 21 },
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  versionCopy: { flex: 1, gap: 2 },
  versionTitle: { fontSize: 12, fontWeight: "800" },
  versionPreview: { fontSize: 10.5, lineHeight: 14 },
  restoreButton: { borderWidth: 1, borderRadius: radii.pill, paddingHorizontal: 10, paddingVertical: 6 },
  restoreText: { fontSize: 9.5, fontWeight: "800" },
  activityRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  activityCopy: { flex: 1 },
  activityText: { fontSize: 11.5, lineHeight: 16 },
  activityDate: { fontSize: 9 },
});
