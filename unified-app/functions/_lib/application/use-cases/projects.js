import { PROJECT_PRIORITIES, PROJECT_STATUSES } from "../../domain/entities.js";
import { NotFoundError } from "../../domain/errors.js";
import { optionalText, oneOf, requiredText } from "../../domain/validation.js";

export function makeProjectUseCases(repository) {
  return {
    list: (env, userId) => repository.list(env, userId),

    async create(env, userId, input) {
      const name = requiredText(input.name, 120, "Nombre");
      const priority = oneOf(input.priority, PROJECT_PRIORITIES, "Prioridad", "media");
      const description = optionalText(input.description, 2000, "Descripción") || "";
      return repository.create(env, userId, { name, priority, description });
    },

    async update(env, userId, id, input) {
      if (!id) throw new NotFoundError("id requerido.");
      const patch = {};
      if (input.name !== undefined) patch.name = requiredText(input.name, 120, "Nombre");
      if (input.description !== undefined) patch.description = optionalText(input.description, 2000, "Descripción") || "";
      if (input.status !== undefined) patch.status = oneOf(input.status, PROJECT_STATUSES, "Estado");
      if (input.priority !== undefined) patch.priority = oneOf(input.priority, PROJECT_PRIORITIES, "Prioridad");
      if (input.updated_at !== undefined) patch.updated_at = new Date().toISOString();
      if (Object.keys(patch).length) patch.updated_at = new Date().toISOString();
      if (!(await repository.update(env, userId, id, patch))) throw new NotFoundError("Proyecto no encontrado.");
    },

    async delete(env, userId, id) {
      if (!(await repository.delete(env, userId, id))) throw new NotFoundError("Proyecto no encontrado.");
    },
  };
}
