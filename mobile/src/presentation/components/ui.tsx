import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSession } from "../hooks/use-auth";
import { usePendingChanges } from "../hooks/use-sync";
import { avatarUrl, DEFAULT_AVATAR } from "../theme/avatars";
import { WEB_BRAIN_URL } from "../theme/links";
import { radii, spacing, theme, type AppScheme } from "../theme/tokens";

/* ------------------------------------------------------------------ theme */

type ThemeContextValue = {
  tokens: (typeof theme)[AppScheme];
  scheme: AppScheme;
};

const ThemeContext = createContext<ThemeContextValue>({
  tokens: theme.dark,
  scheme: "dark",
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme() ?? "dark";
  const session = useSession();
  const preference = session.data?.theme;
  const scheme: AppScheme =
    preference === "claro" ? "light" : preference === "oscuro" ? "dark" : system === "light" ? "light" : "dark";
  const value = useMemo(() => ({ tokens: theme[scheme], scheme }), [scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

/* ------------------------------------------------------------------ glyphs */

const GLYPHS = {
  home: "⌂",
  tasks: "✓",
  projects: "▦",
  notes: "✎",
  documents: "▤",
  more: "•••",
  brain: "◈",
  back: "‹",
  plus: "+",
  sync: "↻",
  close: "×",
  arrow: "→",
  contact: "◎",
  chat: "✦",
  settings: "⚙",
  external: "↗",
  trash: "×",
  check: "✓",
  warning: "!",
} as const;

export type GlyphName = keyof typeof GLYPHS;

export function Glyph({
  name,
  size = 18,
  color,
  style,
}: {
  name: GlyphName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}) {
  return <Text style={[{ fontSize: size, color, lineHeight: size * 1.15 }, style]}>{GLYPHS[name]}</Text>;
}

/* ------------------------------------------------------------------ shell */

const NAV_ITEMS = [
  { key: "inicio", label: "Inicio", glyph: "home", path: "/" },
  { key: "tareas", label: "Tareas", glyph: "tasks", path: "/tasks" },
  { key: "proyectos", label: "Proyectos", glyph: "projects", path: "/projects" },
  { key: "notas", label: "Notas", glyph: "notes", path: "/notes" },
] as const;

const MORE_ITEMS = [
  { label: "Documentos", glyph: "documents", path: "/documents" },
  { label: "Contactos", glyph: "contact", path: "/contacts" },
  { label: "Asistente IA", glyph: "chat", path: "/chat" },
  { label: "Ajustes", glyph: "settings", path: "/settings" },
] as const;

function activeKey(pathname: string) {
  if (pathname === "/tasks") return "tareas";
  if (pathname === "/projects" || pathname.startsWith("/project/")) return "proyectos";
  if (pathname === "/notes") return "notas";
  if (pathname === "/") return "inicio";
  return "more";
}

function TopBar({ title, back = false }: { title: string; back?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tokens } = useAppTheme();
  const session = useSession();
  const pending = usePendingChanges();
  const user = session.data;
  const seed = user?.email || "nexo";
  const uri = avatarUrl(user?.avatar || DEFAULT_AVATAR, seed);
  const pendingCount = pending.data ?? 0;

  return (
    <View
      style={[
        styles.topbar,
        {
          paddingTop: insets.top + 10,
          backgroundColor: tokens.background,
          borderBottomColor: tokens.border,
        },
      ]}
    >
      <View style={styles.brandGroup}>
        {back ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={() => router.back()}
            style={[styles.backButton, { borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }]}
          >
            <Glyph name="back" size={22} color={tokens.text} />
          </Pressable>
        ) : null}
        <View style={[styles.brandMark, { backgroundColor: tokens.accentSoft, borderColor: tokens.borderStrong }]}>
          <Glyph name="brain" size={16} color={tokens.cyan} />
        </View>
        <View style={styles.brandText}>
          <Text style={[styles.brandName, { color: tokens.text }]}>Nexo</Text>
          <Text style={[styles.brandPage, { color: tokens.faint }]}>{title}</Text>
        </View>
      </View>
      <View style={styles.topActions}>
        <View style={[styles.sessionPill, { backgroundColor: tokens.surfaceSoft, borderColor: tokens.border }]}>
          <View style={[styles.dot, { backgroundColor: tokens.success }]} />
          <Text style={[styles.sessionText, { color: tokens.faint }]}>
            {pendingCount > 0 ? `${pendingCount} por sincronizar` : "En línea"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir ajustes"
          onPress={() => router.push("/settings")}
        >
          <Avatar uri={uri} name={user?.displayName || user?.name || "Nexo"} size={34} />
        </Pressable>
      </View>
    </View>
  );
}

function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { tokens } = useAppTheme();
  const [moreOpen, setMoreOpen] = useState(false);
  const current = activeKey(pathname);

  const openExternal = async (url: string) => {
    setMoreOpen(false);
    try {
      await Linking.openURL(url);
    } catch {
      // El enlace externo puede no estar disponible en el dispositivo.
    }
  };

  return (
    <>
      <View
        style={[
          styles.bottomNav,
          {
            paddingBottom: Math.max(insets.bottom, 8),
            backgroundColor: tokens.panel,
            borderTopColor: tokens.border,
          },
        ]}
      >
        {NAV_ITEMS.map((item) => {
          const active = current === item.key;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => router.push(item.path)}
              style={[styles.navItem, active && { backgroundColor: tokens.accentSoft }]}
            >
              <Glyph name={item.glyph} size={19} color={active ? tokens.cyan : tokens.faint} />
              <Text style={[styles.navLabel, { color: active ? tokens.cyan : tokens.faint }]}>{item.label}</Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Más secciones"
          onPress={() => setMoreOpen(true)}
          style={[styles.navItem, current === "more" && { backgroundColor: tokens.accentSoft }]}
        >
          <Glyph name="more" size={17} color={current === "more" ? tokens.cyan : tokens.faint} />
          <Text style={[styles.navLabel, { color: current === "more" ? tokens.cyan : tokens.faint }]}>Más</Text>
        </Pressable>
      </View>

      <Modal visible={moreOpen} transparent animationType="fade" onRequestClose={() => setMoreOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMoreOpen(false)}>
          <Pressable
            style={[
              styles.moreSheet,
              {
                paddingBottom: Math.max(insets.bottom, 16),
                backgroundColor: tokens.panel,
                borderColor: tokens.borderStrong,
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.sheetHead}>
              <Text style={[styles.sheetTitle, { color: tokens.text }]}>Más secciones</Text>
              <Pressable onPress={() => setMoreOpen(false)} accessibilityLabel="Cerrar">
                <Glyph name="close" size={22} color={tokens.muted} />
              </Pressable>
            </View>
            <View style={styles.moreGrid}>
              {MORE_ITEMS.map((item) => (
                <Pressable
                  key={item.path}
                  onPress={() => {
                    setMoreOpen(false);
                    router.push(item.path);
                  }}
                  style={[styles.moreItem, { backgroundColor: tokens.surfaceSoft, borderColor: tokens.border }]}
                >
                  <Glyph name={item.glyph} size={20} color={tokens.accent} />
                  <Text style={[styles.moreLabel, { color: tokens.text }]}>{item.label}</Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => openExternal(WEB_BRAIN_URL)}
                style={[styles.moreItem, { backgroundColor: tokens.surfaceSoft, borderColor: tokens.border }]}
              >
                <Glyph name="brain" size={20} color={tokens.cyan} />
                <View style={styles.moreItemText}>
                  <Text style={[styles.moreLabel, { color: tokens.text }]}>Segundo Cerebro</Text>
                  <Text style={[styles.moreHint, { color: tokens.faint }]}>Abrir grafo web</Text>
                </View>
                <Glyph name="external" size={14} color={tokens.faint} />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export function AppScreen({
  title,
  children,
  back = false,
}: {
  title: string;
  children: ReactNode;
  back?: boolean;
}) {
  const { tokens } = useAppTheme();
  return (
    <View style={[styles.screen, { backgroundColor: tokens.background }]}>
      <TopBar title={title} back={back} />
      <View style={styles.screenBody}>{children}</View>
      <BottomNav />
    </View>
  );
}

/* ------------------------------------------------------------------ primitives */

export function PageHeader({
  kicker,
  title,
  subtitle,
  accent,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  accent?: string;
}) {
  const { tokens } = useAppTheme();
  return (
    <View style={styles.pageHeader}>
      <Text style={[styles.kicker, { color: tokens.cyan }]}>{kicker}</Text>
      <Text style={[styles.pageTitle, { color: tokens.text }]}>
        {title}
        {accent ? <Text style={{ color: tokens.accent }}>{accent}</Text> : null}
      </Text>
      {subtitle ? <Text style={[styles.pageSubtitle, { color: tokens.muted }]}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionHeader({
  title,
  hint,
  right,
}: {
  title: string;
  hint?: string;
  right?: ReactNode;
}) {
  const { tokens } = useAppTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleGroup}>
        <Text style={[styles.sectionTitle, { color: tokens.text }]}>{title}</Text>
        {hint ? <Text style={[styles.sectionHint, { color: tokens.faint }]}>{hint}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function UiCard({
  children,
  style,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const { tokens } = useAppTheme();
  const cardStyle = [
    styles.card,
    { backgroundColor: tokens.panel, borderColor: tokens.border },
    style,
  ];
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && { opacity: 0.92 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

export function UiButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  style,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  disabled?: boolean;
  icon?: GlyphName;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}) {
  const { tokens } = useAppTheme();
  const inactive = disabled || loading;
  const paletteByVariant = {
    primary: { backgroundColor: tokens.accentStrong, borderColor: tokens.accentStrong, color: tokens.onAccent },
    secondary: { backgroundColor: tokens.surfaceSoft, borderColor: tokens.borderStrong, color: tokens.text },
    ghost: { backgroundColor: "transparent", borderColor: tokens.border, color: tokens.muted },
    danger: { backgroundColor: tokens.dangerSoft, borderColor: tokens.danger, color: tokens.danger },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.button,
        compact && styles.buttonCompact,
        { backgroundColor: paletteByVariant.backgroundColor, borderColor: paletteByVariant.borderColor },
        inactive && { opacity: 0.55 },
        pressed && !inactive && { opacity: 0.86 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={paletteByVariant.color} />
      ) : (
        <>
          {icon ? <Glyph name={icon} size={16} color={paletteByVariant.color} /> : null}
          <Text style={[styles.buttonLabel, { color: paletteByVariant.color }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export function UiInput({
  label,
  hint,
  error,
  style,
  containerStyle,
  multiline,
  ...props
}: TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const { tokens } = useAppTheme();
  return (
    <View style={[styles.inputGroup, containerStyle]}>
      {label ? <Text style={[styles.inputLabel, { color: tokens.muted }]}>{label}</Text> : null}
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={tokens.faint}
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          {
            backgroundColor: tokens.surfaceSoft,
            borderColor: error ? tokens.danger : tokens.border,
            color: tokens.text,
          },
          style,
        ]}
      />
      {error ? <Text style={[styles.inputHint, { color: tokens.danger }]}>{error}</Text> : null}
      {!error && hint ? <Text style={[styles.inputHint, { color: tokens.faint }]}>{hint}</Text> : null}
    </View>
  );
}

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "accent" | "sky" | "success" | "danger" | "warning";
}) {
  const { tokens } = useAppTheme();
  const map = {
    neutral: { color: tokens.muted, borderColor: tokens.border, backgroundColor: "transparent" },
    accent: { color: tokens.accent, borderColor: tokens.borderStrong, backgroundColor: tokens.accentSoft },
    sky: { color: tokens.sky, borderColor: tokens.border, backgroundColor: tokens.surfaceSoft },
    success: { color: tokens.success, borderColor: tokens.border, backgroundColor: tokens.surfaceSoft },
    danger: { color: tokens.danger, borderColor: tokens.danger, backgroundColor: tokens.dangerSoft },
    warning: { color: tokens.warning, borderColor: tokens.border, backgroundColor: tokens.surfaceSoft },
  }[tone];
  return (
    <View style={[styles.badge, { borderColor: map.borderColor, backgroundColor: map.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: map.color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const { tokens } = useAppTheme();
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.progressTrack, { backgroundColor: tokens.surfaceSoft }]}>
      <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: tokens.accent }]} />
    </View>
  );
}

export function EmptyState({
  glyph = "notes",
  title,
  description,
}: {
  glyph?: GlyphName;
  title: string;
  description?: string;
}) {
  const { tokens } = useAppTheme();
  return (
    <View style={styles.empty}>
      <Glyph name={glyph} size={24} color={tokens.faint} />
      <Text style={[styles.emptyTitle, { color: tokens.muted }]}>{title}</Text>
      {description ? <Text style={[styles.emptyDescription, { color: tokens.faint }]}>{description}</Text> : null}
    </View>
  );
}

export function Avatar({ uri, name, size = 40 }: { uri: string; name: string; size?: number }) {
  const { tokens } = useAppTheme();
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [uri]);
  const initial = (name || "N").trim().charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tokens.accentSoft,
          borderColor: tokens.borderStrong,
        },
      ]}
    >
      {failed ? (
        <Text style={[styles.avatarInitial, { color: tokens.accent, fontSize: size * 0.38 }]}>{initial}</Text>
      ) : (
        <Image
          source={{ uri }}
          onError={() => setFailed(true)}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      )}
    </View>
  );
}

export function Metric({ value, label }: { value: string | number; label: string }) {
  const { tokens } = useAppTheme();
  return (
    <View style={[styles.metric, { backgroundColor: tokens.surfaceSoft, borderColor: tokens.border }]}>
      <Text style={[styles.metricValue, { color: tokens.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: tokens.faint }]}>{label}</Text>
    </View>
  );
}

export function Divider() {
  const { tokens } = useAppTheme();
  return <View style={[styles.divider, { backgroundColor: tokens.border }]} />;
}

export const uiStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  gapSm: { gap: spacing.sm },
  gapMd: { gap: spacing.md },
  grow: { flex: 1 },
});

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenBody: { flex: 1 },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  brandGroup: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { gap: 1, flexShrink: 1 },
  brandName: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  brandPage: { fontSize: 10, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" },
  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  sessionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  sessionText: { fontSize: 9.5, fontWeight: "600" },
  bottomNav: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-around",
    paddingTop: 6,
    paddingHorizontal: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  navItem: {
    flex: 1,
    minHeight: 46,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  navLabel: { fontSize: 9.5, fontWeight: "700" },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  moreSheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sheetHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
  moreGrid: { gap: spacing.sm },
  moreItem: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  moreItemText: { flex: 1, gap: 1 },
  moreLabel: { fontSize: 14, fontWeight: "700" },
  moreHint: { fontSize: 10.5 },
  pageHeader: { gap: 4, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  kicker: { fontSize: 10, fontWeight: "800", letterSpacing: 1.6 },
  pageTitle: { fontSize: 30, fontWeight: "800", letterSpacing: -1.1, lineHeight: 34 },
  pageSubtitle: { fontSize: 13, lineHeight: 19 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  sectionTitleGroup: { gap: 1, flexShrink: 1 },
  sectionTitle: { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  sectionHint: { fontSize: 10.5 },
  card: { borderWidth: 1, borderRadius: radii.lg, padding: spacing.lg },
  button: {
    minHeight: 44,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  buttonCompact: { minHeight: 38, paddingHorizontal: spacing.md },
  buttonLabel: { fontSize: 13, fontWeight: "700" },
  inputGroup: { gap: 5 },
  inputLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.2 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputMultiline: { minHeight: 76, textAlignVertical: "top" },
  inputHint: { fontSize: 10.5, lineHeight: 15 },
  badge: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 8.5, fontWeight: "800", letterSpacing: 0.5 },
  progressTrack: { height: 6, borderRadius: radii.pill, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: radii.pill },
  empty: { alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: spacing.xl },
  emptyTitle: { fontSize: 13, fontWeight: "700", textAlign: "center" },
  emptyDescription: { fontSize: 11.5, textAlign: "center", lineHeight: 16, maxWidth: 280 },
  avatar: { borderWidth: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarInitial: { fontWeight: "800" },
  metric: { flex: 1, borderWidth: 1, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 8, gap: 1 },
  metricValue: { fontSize: 17, fontWeight: "800", letterSpacing: -0.4 },
  metricLabel: { fontSize: 8.5, fontWeight: "700", letterSpacing: 0.6, textTransform: "uppercase" },
  divider: { height: StyleSheet.hairlineWidth, width: "100%" },
});
