export type NoteKind = "nota" | "contacto" | "foto" | "nfc";
export type NoteSource = "manual" | "nfc" | "camara";

export type Contact = {
  name?: string;
  phone?: string;
  email?: string;
  org?: string;
};

export type Note = {
  id: string;
  kind: NoteKind;
  title: string;
  content: string;
  contact?: Contact;
  source: NoteSource;
  hasImage: boolean;
  createdAt: string;
};

export type NoteDetail = Note & { image?: string | null };

export type CreateNoteInput = {
  kind?: NoteKind;
  title: string;
  content?: string;
  source?: NoteSource;
  contact?: Contact;
};
