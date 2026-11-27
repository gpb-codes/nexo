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
import { createTask, deleteTask, listTasks, updateTask } from "../src/features/tasks/api";
import type { TaskPriority, TaskStatus } from "../src/features/tasks/types";

const PRIORITIES: TaskPriority[] = ["alta", "media", "baja"];

export default function TasksScreen() {
  const scheme = useColorScheme() ?? "dark";
  const tokens = theme[scheme];
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("media");

  const tasks = useQuery({ queryKey: ["tasks"], queryFn: listTasks });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["tasks"] });

  const add = useMutation({
    mutationFn: () =>
      createTask({
        title: title.trim(),
        priority,
        category: category.trim() || undefined,
        due_date: dueDate.trim() || undefined,
      }),
    onSuccess: async () => {
      setTitle("");
      setCategory("");
      setDueDate("");
      await invalidate();
    },
  });

  const toggle = useMutation({
    mutationFn: (task: { id: string; status: TaskStatus }) =>
      updateTask(task.id, { status: task.status === "completada" ? "pendiente" : "completada" }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: deleteTask,
    onSuccess: invalidate,
  });

  return (
    <View style={[styles.container, { backgroundColor: tokens.background }]}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]}
          placeholder="Nueva tarea"
          placeholderTextColor={tokens.muted}
          value={title}
          onChangeText={setTitle}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.grow, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]}
            placeholder="Categoría"
            placeholderTextColor={tokens.muted}
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            style={[styles.input, styles.date, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={tokens.muted}
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>
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
          disabled={add.isPending || !title.trim()}
        >
          {add.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Agregar</Text>}
        </Pressable>
        {add.error instanceof Error && <Text style={styles.error}>{add.error.message}</Text>}
      </View>

      {tasks.isLoading ? (
        <ActivityIndicator color={tokens.accent} />
      ) : (
        <FlatList
          data={tasks.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderColor: tokens.border, backgroundColor: tokens.panel }]}>
              <Pressable onPress={() => toggle.mutate({ id: item.id, status: item.status })} style={styles.cardMain}>
                <View style={[styles.check, item.status === "completada" && { backgroundColor: tokens.accent }]} />
                <View style={styles.cardText}>
                  <Text style={[styles.cardTitle, { color: tokens.text, opacity: item.status === "completada" ? 0.5 : 1 }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.meta, { color: tokens.muted }]}>
                    {item.priority} · {item.category || "Sin categoría"} · {item.due_date || "sin fecha"}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert("Eliminar tarea", item.title, [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Eliminar", style: "destructive", onPress: () => remove.mutate(item.id) },
                  ])
                }
              >
                <Text style={{ color: "#f87171" }}>✕</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text style={[styles.empty, { color: tokens.muted }]}>Sin tareas todavía.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  form: { gap: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  row: { flexDirection: "row", gap: 8 },
  grow: { flex: 2 },
  date: { flex: 1.4 },
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
  meta: { fontSize: 11 },
  check: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: "#64748b" },
  empty: { textAlign: "center", marginTop: 24 },
});
