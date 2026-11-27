import type { CreateNoteInput, Note, NoteDetail } from "../entities/note";

export interface NoteRepository {
  list(): Promise<Note[]>;
  get(id: string): Promise<NoteDetail>;
  create(input: CreateNoteInput): Promise<void>;
  delete(id: string): Promise<void>;
}
