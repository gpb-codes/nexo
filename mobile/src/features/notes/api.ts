import { api, endpoints } from "../../infrastructure/api/client";
import type { CreateNoteInput, Note } from "./types";

export async function listNotes(): Promise<Note[]> {
  const data = await api<{ ok: boolean; notes: Note[] }>(endpoints.notes);
  return data.notes;
}

export async function createNote(input: CreateNoteInput): Promise<void> {
  await api(endpoints.notes, { method: "POST", body: JSON.stringify(input) });
}

export async function deleteNote(id: string): Promise<void> {
  await api(endpoints.notes, { method: "DELETE", body: JSON.stringify({ id }) });
}

export async function getNote(id: string): Promise<Note & { image?: string | null }> {
  const data = await api<{ ok: boolean; note: Note & { image?: string | null } }>(`${endpoints.notes}?id=${encodeURIComponent(id)}`);
  return data.note;
}
