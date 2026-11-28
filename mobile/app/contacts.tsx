import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  AppScreen,
  Avatar,
  Badge,
  EmptyState,
  PageHeader,
  SectionHeader,
  UiButton,
  UiCard,
  UiInput,
  useAppTheme,
} from "../src/presentation/components/ui";
import { useCreateNote, useDeleteNote, useNotes } from "../src/presentation/hooks/use-notes";
import type { Note } from "../src/domain/entities/note";
import { avatarUrl, DEFAULT_AVATAR } from "../src/presentation/theme/avatars";
import { radii, spacing } from "../src/presentation/theme/tokens";

export default function ContactsScreen() {
  const { tokens } = useAppTheme();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const all = useNotes();
  const add = useCreateNote();
  const remove = useDeleteNote();

  const contacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (all.data ?? [])
      .filter((item) => item.kind === "contacto")
      .filter((item) => {
        if (!query) return true;
        return [item.title, item.content, item.contact?.name, item.contact?.phone, item.contact?.email, item.contact?.org]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
  }, [all.data, search]);

  const openWhatsApp = async (value?: string) => {
    const digits = (value || "").replace(/\D/g, "");
    if (!digits) {
      Alert.alert("Sin teléfono", "Este contacto no tiene número para WhatsApp.");
      return;
    }
    try {
      await Linking.openURL(`https://wa.me/${digits}`);
    } catch {
      Alert.alert("Error", "No se pudo abrir WhatsApp.");
    }
  };

  const submit = () => {
    add.mutate(
      {
        kind: "contacto",
        title: name.trim() || phone.trim() || "Contacto",
        content: note.trim(),
        source: "manual",
        contact: { name: name.trim(), phone: phone.trim(), email: email.trim(), org: org.trim() },
      },
      {
        onSuccess: () => {
          setName("");
          setPhone("");
          setEmail("");
          setOrg("");
          setNote("");
          setShowForm(false);
        },
      },
    );
  };

  const confirmDelete = (id: string, title: string) => {
    Alert.alert("Eliminar contacto", title, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => remove.mutate(id) },
    ]);
  };

  const header = (
    <View style={styles.header}>
      <PageHeader
        kicker="RED"
        title="Contactos"
        subtitle="Personas, organizaciones y oportunidades que forman parte de tu ecosistema."
      />
      <UiCard style={styles.introCard}>
        <Badge label="Agenda Nexo" tone="sky" />
        <Text style={[styles.intro, { color: tokens.muted }]}>
          Estos contactos viven en Nexo. No se copian a la agenda del teléfono; puedes abrirlos en WhatsApp cuando lo necesites.
        </Text>
      </UiCard>

      <UiButton
        label={showForm ? "Cerrar formulario" : "Nuevo contacto"}
        icon={showForm ? "close" : "plus"}
        variant={showForm ? "ghost" : "primary"}
        onPress={() => setShowForm((value) => !value)}
      />

      {showForm ? (
        <UiCard style={styles.form}>
          <UiInput label="Nombre" placeholder="Nombre de la persona" value={name} onChangeText={setName} />
          <UiInput
            label="Teléfono"
            placeholder="+34 600 111 222"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <UiInput
            label="Correo"
            placeholder="nombre@empresa.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <UiInput label="Organización" placeholder="Empresa o proyecto" value={org} onChangeText={setOrg} />
          <UiInput
            label="Nota de trabajo"
            placeholder="Cómo os conocisteis, qué puede aportar..."
            value={note}
            onChangeText={setNote}
            multiline
          />
          <UiButton
            label="Guardar contacto"
            onPress={submit}
            loading={add.isPending}
            disabled={!name.trim() && !phone.trim() && !email.trim()}
          />
          {add.error instanceof Error ? (
            <Text style={[styles.error, { color: tokens.danger }]}>{add.error.message}</Text>
          ) : null}
        </UiCard>
      ) : null}

      <UiInput
        placeholder="Buscar contactos..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <SectionHeader title="Contactos en Nexo" hint={`${contacts.length} visibles`} />
    </View>
  );

  return (
    <AppScreen title="Contactos">
      <FlatList<Note>
        style={[styles.container, { backgroundColor: tokens.background }]}
      contentContainerStyle={styles.content}
      data={contacts}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      keyboardShouldPersistTaps="handled"
      refreshing={all.isRefetching}
      onRefresh={() => all.refetch()}
      ListEmptyComponent={
        all.isLoading ? (
          <ActivityIndicator color={tokens.accent} style={styles.loading} />
        ) : all.isError ? (
          <EmptyState glyph="warning" title="No se pudieron cargar los contactos" description="Desliza para intentar de nuevo." />
        ) : (
          <EmptyState glyph="contact" title="Sin contactos guardados" description="Crea el primero con el formulario de arriba." />
        )
      }
      renderItem={({ item }) => {
        const displayName = item.contact?.name || item.title || "Contacto";
        const meta = [item.contact?.org, item.contact?.email].filter(Boolean).join(" · ");
        return (
          <UiCard style={styles.item}>
            <Avatar uri={avatarUrl(DEFAULT_AVATAR, item.contact?.email || displayName)} name={displayName} size={44} />
            <Pressable style={styles.itemMain} onPress={() => openWhatsApp(item.contact?.phone)}>
              <Text style={[styles.itemTitle, { color: tokens.text }]} numberOfLines={1}>
                {displayName}
              </Text>
              {item.contact?.phone ? (
                <Text style={[styles.meta, { color: tokens.muted }]}>{item.contact.phone}</Text>
              ) : null}
              {meta ? (
                <Text style={[styles.meta, { color: tokens.faint }]} numberOfLines={1}>
                  {meta}
                </Text>
              ) : null}
              {item.content ? (
                <Text style={[styles.note, { color: tokens.faint }]} numberOfLines={2}>
                  {item.content}
                </Text>
              ) : null}
            </Pressable>
            <View style={styles.actions}>
              {item.contact?.phone ? (
                <Pressable
                  onPress={() => openWhatsApp(item.contact?.phone)}
                  style={[styles.whatsapp, { borderColor: tokens.borderStrong, backgroundColor: tokens.surfaceSoft }]}
                >
                  <Text style={[styles.whatsappText, { color: tokens.accent }]}>WhatsApp</Text>
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Eliminar ${displayName}`}
                onPress={() => confirmDelete(item.id, displayName)}
                style={styles.delete}
              >
                <Text style={[styles.deleteText, { color: tokens.danger }]}>×</Text>
              </Pressable>
            </View>
          </UiCard>
        );
      }}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxl },
  header: { gap: spacing.lg, paddingBottom: spacing.sm },
  introCard: { gap: spacing.sm },
  intro: { fontSize: 11.5, lineHeight: 17 },
  form: { gap: spacing.md },
  error: { fontSize: 11 },
  loading: { marginTop: spacing.xl },
  item: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, padding: spacing.md },
  itemMain: { flex: 1, gap: 2 },
  itemTitle: { fontSize: 14, fontWeight: "700" },
  meta: { fontSize: 10.5 },
  note: { fontSize: 10.5, lineHeight: 15, marginTop: 2 },
  actions: { alignItems: "flex-end", gap: 4 },
  whatsapp: { borderWidth: 1, borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 5 },
  whatsappText: { fontSize: 9.5, fontWeight: "800" },
  delete: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  deleteText: { fontSize: 22, lineHeight: 24 },
});
