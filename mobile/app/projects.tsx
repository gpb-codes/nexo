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
import { createProject, deleteProject, listProjects, updateProject } from "../src/features/projects/api";
import type { ProjectPriority, ProjectStatus } from "../src/features/projects/types";

const PRIORITIES: ProjectPriority[] = ["alta", "media", "baja"];

export default function ProjectsScreen() {
  const scheme = useColorScheme() ?? "dark";
  const tokens = theme[scheme];
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<ProjectPriority>("media");

  const projects = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["projects"] });

  const add = useMutation({
    mutationFn: () => createProject({ name: name.trim(), description: description.trim(), priority }),
    onSuccess: async () => {
      setName("");
      setDescription("");
      await invalidate();
    },
  });

  const toggle = useMutation({
    mutationFn: (project: { id: string; status: ProjectStatus }) =>
      updateProject(project.id, { status: project.status === "completado" ? "activo" : "completado" }),
    onSuccess: invalidate,
  });

  const remove = useMutation({ mutationFn: deleteProject, onSuccess: invalidate });

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]}
          placeholder="Nombre del proyecto"
          placeholderTextColor={tokens.muted}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]}
          placeholder="Descripción"
          placeholderTextColor={tokens.muted}
          value={description}
          onChangeText={setDescription}
        />
        <View style={styles.priorities}>
          {PRIORITIES.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.priority,
                { borderColor: tokens.border },
                priority === p && { backgroundColor: tokens.accent, borderColor: tokens.accent },
              ]}
            >
              <Text style={priority === p ? styles.priorityActive : { color: tokens.muted }}>{p}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          style={[styles.button, { backgroundColor: tokens.accent }]}
          onPress={() => add.mutate()}
          disabled={add.isPending || !name.trim()}
        >
          {add.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear</Text>}
        </Pressable>
        {add.error instanceof Error && <Text style={styles.error}>{add.error.message}</Text>}
      </View>

      {projects.isLoading ? (
        <ActivityIndicator color={tokens.accent} />
      ) : (
        <FlatList
          data={projects.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: tokens.border, backgroundColor: tokens.panel }]}>
              <Pressable onPress={() => toggle.mutate({ id: item.id, status: item.status })} style={styles.cardMain}>
                <View style={[styles.dot, item.status === "completado" && { backgroundColor: tokens.accent }]} />
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, { color: tokens.text }]}>{item.name}</Text>
                  {!!item.description && <Text style={[styles.desc, { color: tokens.muted }]}>{item.description}</Text>}
                  <Text style={[styles.meta, { color: tokens.muted }]}>{item.status} · {item.priority}</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert("Eliminar proyecto", item.name, [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Eliminar", style: "destructive", onPress: () => remove.mutate(item.id) },
                  ])
                }
              >
                <Text style={{ color: "#f87171" }}>✕</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text style={[styles.empty, { color: tokens.muted }]}>Sin proyectos todavía.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  form: { gap: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  priorities: { flexDirection: "row", gap: 8 },
  priority: { borderWidth: 1, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  priorityActive: { color: "#fff", fontWeight: "700" },
  button: { borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
  error: { color: "#f87171", fontSize: 12 },
  list: { gap: 8, paddingBottom: 24 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  cardMain: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  cardText: { gap: 2, flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "600" },
  desc: { fontSize: 12 },
  meta: { fontSize: 11 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: "#64748b" },
  empty: { textAlign: "center", marginTop: 24 },
});
