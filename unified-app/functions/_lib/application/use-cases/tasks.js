import { TASK_PRIORITIES, TASK_STATUSES } from "../../domain/entities.js";
import { NotFoundError } from "../../domain/errors.js";
import { dateString, oneOf, optionalText, requiredText } from "../../domain/validation.js";

export function makeTaskUseCases(repository) {
  return {
    list: (env, userId) => repository.list(env, userId),

    async create(env, userId, input) {
      const title = requiredText(input.title, 200, "Título");
      const priority = oneOf(input.priority, TASK_PRIORITIES, "Prioridad", "media");
      const dueDate = dateString(input.dueDate ?? input.due_date);
      const category = optionalText(input.category, 80, "Categoría") || null;
      const description = optionalText(input.description, 2000, "Descripción") || "";
      return repository.create(env, userId, { title, priority, dueDate, category, description });
    },

    async update(env, userId, id, input) {
      if (!id) throw new NotFoundError("id requerido.");
      const patch = {};
      if (input.title !== undefined) patch.title = requiredText(input.title, 200, "Título");
      if (input.priority !== undefined) patch.priority = oneOf(input.priority, TASK_PRIORITIES, "Prioridad");
      if (input.category !== undefined) patch.category = optionalText(input.category, 80, "Categoría") || null;
      if (input.description !== undefined) patch.description = optionalText(input.description, 2000, "Descripción") || "";
      if (input.dueDate !== undefined || input.due_date !== undefined) {
        patch.due_date = dateString(input.dueDate ?? input.due_date);
      }
      if (input.status !== undefined) {
        const status = oneOf(input.status, TASK_STATUSES, "Estado");
        patch.status = status;
        patch.completed_at = status === "completada" ? new Date().toISOString() : null;
      }
      if (!(await repository.update(env, userId, id, patch))) throw new NotFoundError("Tarea no encontrada.");
    },

    async delete(env, userId, id) {
      if (!(await repository.delete(env, userId, id))) throw new NotFoundError("Tarea no encontrada.");
    },
  };
}
