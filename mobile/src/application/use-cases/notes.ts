import type { CreateNoteInput } from "../../domain/entities/note";
import type { NoteRepository } from "../../domain/repositories/note-repository";

export function makeNoteUseCases(repository: NoteRepository) {
  return {
    list: () => repository.list(),
    get: (id: string) => repository.get(id),
    create: (input: CreateNoteInput) => repository.create(input),
    remove: (id: string) => repository.delete(id),
  };
}
