import { NOTE_KINDS, NOTE_SOURCES, serializeNote } from "../../domain/entities.js";
import { NotFoundError } from "../../domain/errors.js";
import { imageData, oneOf, optionalText } from "../../domain/validation.js";

export function makeNoteUseCases(repository) {
  return {
    list: (env, userId) => repository.list(env, userId),

    async get(env, userId, id) {
      const row = await repository.find(env, userId, id);
      if (!row) throw new NotFoundError("Nota no encontrada.");
      return {
        ...serializeNote({ ...row, has_image: row.image_data ? 1 : 0 }),
        image: row.image_data || null,
      };
    },

    async create(env, userId, input) {
      const kind = oneOf(input.kind, NOTE_KINDS, "Tipo", "nota");
      const source = oneOf(input.source, NOTE_SOURCES, "Origen", "manual");
      const contact = input.contact && typeof input.contact === "object" ? input.contact : {};
      const name = optionalText(contact.name, 120, "Nombre") || "";
      const phone = optionalText(contact.phone, 80, "Teléfono") || "";
      const contactEmail = optionalText(contact.email, 160, "Correo") || "";
      const org = optionalText(contact.org, 120, "Organización") || "";
      const content = optionalText(input.content, 10000, "Contenido") || "";
      let title = optionalText(input.title, 120, "Título") || "";
      if (!title && name) title = name;
      if (!title && content) title = content.split("\n")[0].slice(0, 80);
      if (!title) title = kind === "foto" ? "Foto" : kind === "contacto" ? "Contacto" : "Nota";
      const image = imageData(input.image, { requireImage: kind === "foto" });
      return repository.create(env, userId, {
        kind, source, title, content, image,
        contact: { name, phone, email: contactEmail, org },
      });
    },

    async delete(env, userId, id) {
      if (!(await repository.delete(env, userId, id))) throw new NotFoundError("Nota no encontrada.");
    },
  };
}
