import { ValidationError } from "./errors.js";

export const ALLOWED_AVATARS = new Set(["lorelei", "micah", "avataaars", "bottts", "fun-emoji", "notionists", "adventurer", "thumbs"]);
export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
export const IMAGE_PREFIX = /^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/;
export const MAX_IMAGE_CHARS = 950000;

export function text(value, max = 200, label = "valor") {
  const v = String(value ?? "").trim();
  if (v.length > max) throw new ValidationError(`${label} demasiado largo.`);
  return v;
}

export function requiredText(value, max, label) {
  const v = text(value, max, label);
  if (!v) throw new ValidationError(`${label} requerido.`);
  return v;
}

export function email(value) {
  const v = text(value, 254, "Correo").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new ValidationError("Correo inválido.");
  return v;
}

export function password(value) {
  const v = String(value ?? "");
  if (v.length < 8 || v.length > 128) throw new ValidationError("La contraseña debe tener entre 8 y 128 caracteres.");
  return v;
}

export function name(value) {
  const v = text(value, 80, "Nombre");
  if (v.length < 2) throw new ValidationError("Nombre inválido (2-80 caracteres).");
  return v;
}

export function oneOf(value, allowed, label, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  if (!allowed.has(String(value))) throw new ValidationError(`${label} inválido.`);
  return String(value);
}

export function dateString(value) {
  if (value === undefined || value === null || value === "") return null;
  const v = text(value, 10, "Fecha");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) {
    throw new ValidationError("Formato de fecha inválido (YYYY-MM-DD).");
  }
  return v;
}

export function imageData(value, { requireImage = false } = {}) {
  if (value === undefined || value === null || value === "") {
    if (requireImage) throw new ValidationError("La foto no contiene una imagen válida.");
    return null;
  }
  if (typeof value !== "string") throw new ValidationError("Imagen inválida.");
  if (value.length > MAX_IMAGE_CHARS) throw new ValidationError("La imagen es demasiado grande. Intenta con una foto más pequeña.");
  if (!IMAGE_PREFIX.test(value)) throw new ValidationError("Formato de imagen no permitido.");
  return value;
}

export function color(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const v = String(value);
  if (!HEX_COLOR.test(v)) throw new ValidationError("Color inválido.");
  return v;
}

export function theme(value) {
  return oneOf(value, new Set(["claro", "oscuro"]), "Tema", undefined);
}

export function avatar(value) {
  return oneOf(value, ALLOWED_AVATARS, "Avatar", undefined);
}

export function optionalText(value, max, label) {
  if (value === undefined || value === null) return undefined;
  return text(value, max, label);
}

export function clientId(value) {
  const v = optionalText(value, 80, "Client id");
  return v || null;
}

export function tags(value) {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) throw new ValidationError("Etiquetas inválidas.");
  if (value.length > 8) throw new ValidationError("Máximo 8 etiquetas por tarea.");
  const normalized = value
    .map((item) => text(item, 24, "Etiqueta"))
    .filter(Boolean)
    .filter((item, index, all) => all.indexOf(item) === index);
  return normalized;
}

export function projectRole(value, fallback) {
  return oneOf(value, new Set(["owner", "editor", "viewer"]), "Rol", fallback);
}

export function documentStatus(value, fallback = "activo") {
  return oneOf(value, new Set(["activo", "archivado"]), "Estado del documento", fallback);
}
