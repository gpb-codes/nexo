import { useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { useAiChat, useAiStatus } from "../src/presentation/hooks/use-ai";
import type { ChatMessage } from "../src/domain/entities/chat";
import { radii, spacing } from "../src/presentation/theme/tokens";

export default function ChatScreen() {
  const router = useRouter();
  const { tokens } = useAppTheme();
  const status = useAiStatus();
  const chat = useAiChat();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const send = () => {
    const text = input.trim();
    if (!text || chat.isPending) return;
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    chat.mutate(next, {
      onSuccess: (result) => {
        setMessages([...next, { role: "assistant", content: result.content }]);
      },
      onError: (error) => {
        setMessages([
          ...next,
          { role: "assistant", content: error instanceof Error ? error.message : "Error de IA" },
        ]);
      },
    });
  };

  return (
    <AppScreen title="Asistente IA">
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: tokens.background }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          kicker="INTELIGENCIA"
          title="Asistente IA"
          subtitle="Pregunta, conecta ideas y trabaja con el contexto de tu espacio."
        />

        <UiCard style={styles.statusCard}>
          <SectionHeader
            title="Estado del asistente"
            right={
              <Badge
                label={status.data?.configured ? "Configurada" : "Sin configurar"}
                tone={status.data?.configured ? "success" : "warning"}
              />
            }
          />
          <Text style={[styles.statusText, { color: tokens.muted }]}>
            {status.isLoading
              ? "Comprobando configuración..."
              : status.data?.configured
                ? `Modelo ${status.data.model || "predeterminado"} · ${status.data.provider || "proveedor configurado"}`
                : "Configura la API key en la web de Nexo. La app móvil nunca la muestra ni la guarda."}
          </Text>
          {!status.data?.configured && !status.isLoading ? (
            <UiButton label="Abrir ajustes" variant="secondary" compact onPress={() => router.push("/settings")} />
          ) : null}
        </UiCard>

        {messages.length === 0 ? (
          <EmptyState
            glyph="chat"
            title="Empieza una conversación"
            description="La clave del proveedor permanece en el servidor. Aquí solo viajan tus mensajes."
          />
        ) : (
          <View style={styles.messages}>
            {messages.map((item, index) => {
              const user = item.role === "user";
              return (
                <View
                  key={`${index}_${item.role}`}
                  style={[
                    styles.bubble,
                    {
                      backgroundColor: user ? tokens.accentStrong : tokens.panel,
                      borderColor: user ? tokens.accentStrong : tokens.border,
                      alignSelf: user ? "flex-end" : "flex-start",
                    },
                  ]}
                >
                  <Text style={[styles.bubbleLabel, { color: user ? "rgba(255,255,255,0.72)" : tokens.faint }]}>
                    {user ? "Tú" : "Nexo"}
                  </Text>
                  <Text style={[styles.bubbleText, { color: user ? tokens.onAccent : tokens.text }]}>
                    {item.content}
                  </Text>
                </View>
              );
            })}
            {chat.isPending ? <ActivityIndicator color={tokens.accent} style={styles.pending} /> : null}
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputBar, { backgroundColor: tokens.panel, borderTopColor: tokens.border }]}>
        <UiInput
          placeholder="Pregunta a Nexo..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
          containerStyle={styles.input}
        />
        <UiButton
          label="Enviar"
          compact
          onPress={send}
          disabled={!input.trim() || chat.isPending}
          loading={chat.isPending}
          style={styles.send}
        />
      </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl },
  statusCard: { gap: spacing.sm },
  statusText: { fontSize: 11.5, lineHeight: 17 },
  messages: { gap: spacing.sm },
  bubble: { maxWidth: "88%", borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, gap: 3 },
  bubbleLabel: { fontSize: 8.5, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  bubbleText: { fontSize: 13.5, lineHeight: 20 },
  pending: { alignSelf: "flex-start", marginLeft: spacing.sm },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1 },
  send: { minWidth: 78 },
});
