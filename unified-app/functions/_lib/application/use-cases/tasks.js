import { PROJECT_ROLE_WRITE, TASK_PRIORITIES, TASK_STATUSES } from "../../domain/entities.js";
import { ForbiddenError, NotFoundError, ValidationError } from "../../domain/errors.js";
import { clientId, dateString, oneOf, optionalText, requiredText, tags as validateTags } from "../../domain/validation.js";

async function assertProjectWrite(env, collaboration, projectId, userId) {
  if (!projectId) return;
  const role = await collaboration.roleForProject(env, projectId, userId);
  if (!role) throw new NotFoundError("Proyecto no encontrado.");
  if (!PROJECT_ROLE_WRITE.has(role)) throw new ForbiddenError("No tienes permiso para modificar tareas de este proyecto.");
}

async function assertAssignee(env, collaboration, projectId, assigneeId) {
  if (!assigneeId) return;
  if (!projectId) throw new ValidationError("Asigna un proyecto antes de elegir un responsable.");
  const role = await collaboration.roleForProject(env, projectId, assigneeId);
  if (!role) throw new ValidationError("El responsable no pertenece al proyecto.");
}

export function makeTaskUseCases(repository, collaboration) {
  return {
    list: (env, userId) => repository.list(env, userId),

    async create(env, userId, input) {
      const title = requiredText(input.title, 200, "Título");
      const priority = oneOf(input.priority, TASK_PRIORITIES, "Prioridad", "media");
      const dueDate = dateString(input.dueDate ?? input.due_date);
      const category = optionalText(input.category, 80, "Categoría") || null;
      const description = optionalText(input.description, 2000, "Descripción") || "";
      const idempotencyKey = clientId(input.clientId ?? input.client_id);
      const projectId = optionalText(input.projectId ?? input.project_id, 80, "Proyecto") || null;
      const assigneeId = optionalText(input.assigneeId ?? input.assignee_id, 80, "Responsable") || null;
      const taskTags = validateTags(input.tags) || [];
      await assertProjectWrite(env, collaboration, projectId, userId);
      await assertAssignee(env, collaboration, projectId, assigneeId);
      const task = await repository.create(env, userId, {
        title, priority, dueDate, category, description, clientId: idempotencyKey,
        projectId, assigneeId, tags: taskTags,
      });
      if (projectId) {
        await collaboration.logActivity(env, {
          actorId: userId,
          action: "task.created",
          entityType: "task",
          entityId: task.id,
          projectId,
          detail: { title },
        });
      }
      return task;
    },

    async update(env, userId, id, input) {
      if (!id) throw new NotFoundError("id requerido.");
      const current = await repository.find(env, userId, id);
      if (!current) throw new NotFoundError("Tarea no encontrada.");
      if (current.project_id) await assertProjectWrite(env, collaboration, current.project_id, userId);

      const patch = {};
      if (input.title !== undefined) patch.title = requiredText(input.title, 200, "Título");
      if (input.priority !== undefined) patch.priority = oneOf(input.priority, TASK_PRIORITIES, "Prioridad");
      if (input.category !== undefined) patch.category = optionalText(input.category, 80, "Categoría") || null;
      if (input.description !== undefined) patch.description = optionalText(input.description, 2000, "Descripción") || "";
      if (input.dueDate !== undefined || input.due_date !== undefined) {
        patch.due_date = dateString(input.dueDate ?? input.due_date);
      }
      if (input.tags !== undefined) patch.tags = validateTags(input.tags) || [];
      if (input.projectId !== undefined || input.project_id !== undefined) {
        patch.project_id = optionalText(input.projectId ?? input.project_id, 80, "Proyecto") || null;
        await assertProjectWrite(env, collaboration, patch.project_id, userId);
      }
      if (input.assigneeId !== undefined || input.assignee_id !== undefined) {
        patch.assignee_id = optionalText(input.assigneeId ?? input.assignee_id, 80, "Responsable") || null;
        await assertAssignee(env, collaboration, patch.project_id ?? current.project_id, patch.assignee_id);
      }
      if (input.status !== undefined) {
        const status = oneOf(input.status, TASK_STATUSES, "Estado");
        patch.status = status;
        patch.completed_at = status === "completada" ? new Date().toISOString() : null;
      }
      if (!(await repository.update(env, userId, id, patch))) throw new NotFoundError("Tarea no encontrada.");

      const projectId = patch.project_id === undefined ? current.project_id : patch.project_id;
      if (projectId) {
        await collaboration.logActivity(env, {
          actorId: userId,
          action: input.status !== undefined ? "task.status_changed" : "task.updated",
          entityType: "task",
          entityId: id,
          projectId,
          detail: { title: patch.title || current.title, status: patch.status || current.status },
        });
      }
    },

    async delete(env, userId, id) {
      const current = await repository.find(env, userId, id);
      if (!current) throw new NotFoundError("Tarea no encontrada.");
      if (current.project_id) await assertProjectWrite(env, collaboration, current.project_id, userId);
      if (!(await repository.delete(env, userId, id))) throw new NotFoundError("Tarea no encontrada.");
      if (current.project_id) {
        await collaboration.logActivity(env, {
          actorId: userId,
          action: "task.deleted",
          entityType: "task",
          entityId: id,
          projectId: current.project_id,
          detail: { title: current.title },
        });
      }
    },
  };
}
