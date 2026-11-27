import type { CreateNoteInput, Note, NoteDetail } from "../../domain/entities/note";
import type { NoteRepository } from "../../domain/repositories/note-repository";
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";

export class ApiNoteRepository implements NoteRepository {
  async list(): Promise<Note[]> {
    const data = await api<{ ok: boolean; notes: Note[] }>(endpoints.notes);
    return data.notes;
  }
  async get(id: string): Promise<NoteDetail> {
    const data = await api<{ ok: boolean; note: NoteDetail }>(`${endpoints.notes}?id=${encodeURIComponent(id)}`);
    return data.note;
  }
  async create(input: CreateNoteInput): Promise<void> {
    await api(endpoints.notes, { method: "POST", body: JSON.stringify(input) });
  }
  async delete(id: string): Promise<void> {
    await api(endpoints.notes, { method: "DELETE", body: JSON.stringify({ id }) });
  }
}
