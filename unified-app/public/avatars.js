/* Avatar system — DiceBear (open source, 61 estilos) */
const DICEBEAR_BASE = "https://api.dicebear.com/9.x";
const AVATAR_STYLES = [
  { id: "lorelei", name: "Lorelei", desc: "Ilustrado" },
  { id: "micah", name: "Micah", desc: "Moderno" },
  { id: "avataaars", name: "Avataaars", desc: "Clásico" },
  { id: "bottts", name: "Bottts", desc: "Robot" },
  { id: "fun-emoji", name: "Fun Emoji", desc: "Emoji" },
  { id: "notionists", name: "Notionists", desc: "Notion" },
  { id: "adventurer", name: "Adventurer", desc: "Aventurero" },
  { id: "thumbs", name: "Thumbs", desc: "Pulgar" },
];
const DEFAULT_AVATAR = "lorelei";

function avatarUrl(style, seed) {
  const params = new URLSearchParams({ seed: seed || "default", backgroundColor: "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf" });
  return `${DICEBEAR_BASE}/${style}/svg?${params.toString()}`;
}

function renderAvatar(styleId, container, seed) {
  const style = AVATAR_STYLES.find(s => s.id === styleId) || AVATAR_STYLES[0];
  const url = avatarUrl(style.id, seed || "user");
  container.innerHTML = `<img src="${url}" alt="${style.name}" loading="lazy">`;
  container.dataset.avatar = style.id;
}

function initAvatarPicker(container, activeId) {
  container.innerHTML = "";
  AVATAR_STYLES.forEach(style => {
    const btn = document.createElement("button");
    btn.className = "avatar-option";
    btn.dataset.avatarId = style.id;
    btn.title = style.name;
    btn.innerHTML = `<img src="${avatarUrl(style.id, 'preview')}" alt="${style.name}" loading="lazy">`;
    if (style.id === activeId) btn.classList.add("active");
    container.appendChild(btn);
  });
}
