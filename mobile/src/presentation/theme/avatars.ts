export const AVATAR_STYLES = [
  { id: "lorelei", name: "Lorelei" },
  { id: "micah", name: "Micah" },
  { id: "avataaars", name: "Avataaars" },
  { id: "bottts", name: "Bottts" },
  { id: "fun-emoji", name: "Fun Emoji" },
  { id: "notionists", name: "Notionists" },
  { id: "adventurer", name: "Adventurer" },
  { id: "thumbs", name: "Thumbs" },
] as const;

export const DEFAULT_AVATAR = "lorelei";

export type AvatarStyleId = (typeof AVATAR_STYLES)[number]["id"];

export function avatarUrl(style: string | undefined, seed: string | undefined): string {
  const safeStyle = AVATAR_STYLES.some((item) => item.id === style) ? style : DEFAULT_AVATAR;
  const params = new URLSearchParams({
    seed: seed || "nexo",
    backgroundColor: "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
    size: "256",
  });
  return `https://api.dicebear.com/9.x/${safeStyle}/png?${params.toString()}`;
}
