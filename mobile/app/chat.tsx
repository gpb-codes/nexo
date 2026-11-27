import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { useAiChat, useAiStatus } from "../src/presentation/hooks/use-ai";
import { theme } from "../src/presentation/theme/tokens";
import type { ChatMessage } from "../src/domain/entities/chat";

export default function ChatScreen() {
  const scheme = useColorScheme() ?? "dark";
  const tokens = theme[scheme];
  const status = useAiStatus();
  const chat = useAiChat();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "Conectando..." }]);
    chat.mutate(next, {
      onSuccess: (result) => {
        setMessages([...next, { role: "assistant", content: result.content }]);
      },
      onError: (error) => {
        setMessages([...next, { role: "assistant", content: error instanceof Error ? error.message : "Error de IA" }]);
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: tokens.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={[styles.status, { color: status.data?.configured ? tokens.accent : tokens.muted }]}>
        {status.isLoading
          ? "Comprobando IA..."
          : status.data?.configured
            ? `IA lista · ${status.data.model} · ${status.data.provider}`
            : "Configura API key en Ajustes para usar el asistente."}
      </Text>

      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 && (
          <Text style={[styles.empty, { color: tokens.muted }]}>
            Escribe un mensaje para empezar. La clave nunca sale del servidor.
          </Text>
        )}
        {messages.map((item, index) => (
          <View
            key={`${index}_${item.role}`}
            style={[
              styles.bubble,
              { backgroundColor: tokens.panel, borderColor: tokens.border },
              item.role === "user" && { alignSelf: "flex-end", backgroundColor: tokens.accent },
            ]}
          >
            <Text style={[styles.bubbleText, item.role === "user" && styles.bubbleTextUser]}>
              {item.content}
            </Text>
          </View>
        ))}
        {chat.isPending && <ActivityIndicator color={tokens.accent} />}
      </ScrollView>

      <View style={styles.row}>
        <TextInput
          style={[styles.input, { borderColor: tokens.border, color: tokens.text, backgroundColor: tokens.panel }]}
          value={input}
          onChangeText={setInput}
          placeholder="Pregunta a Nexo..."
          placeholderTextColor={tokens.muted}
        />
        <Pressable style={[styles.send, { backgroundColor: tokens.accent }]} onPress={send} disabled={chat.isPending || !input.trim()}>
          <Text style={styles.sendText}>Enviar</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  status: { fontSize: 12, fontWeight: "600" },
  messages: { flex: 1 },
  messagesContent: { gap: 8, paddingVertical: 8 },
  empty: { textAlign: "center", marginTop: 40, fontSize: 13 },
  bubble: { borderWidth: 1, borderRadius: 14, padding: 12, maxWidth: "86%" },
  bubbleText: { color: "#e2e8f0", fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: "#fff" },
  row: { flexDirection: "row", gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  send: { borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" },
  sendText: { color: "#fff", fontWeight: "700" },
});
