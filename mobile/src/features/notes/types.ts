export type NoteKind = "nota" | "contacto" | "foto" | "nfc";

export type Note = {
  id: string;
  kind: NoteKind;
  title: string;
  content: string;
  contact?: {
    name?: string;
    phone?: string;
    email?: string;
    org?: string;
  };
  source: string;
  hasImage: boolean;
  createdAt: string;
};

export type ContactInput = {
  name?: string;
  phone?: string;
  email?: string;
  org?: string;
};

export type CreateNoteInput = {
  kind?: NoteKind;
  title: string;
  content?: string;
  source?: "manual" | "nfc" | "camara";
  contact?: ContactInput;
};
