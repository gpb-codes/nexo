import { PROJECT_PRIORITIES, PROJECT_ROLE_WRITE, PROJECT_STATUSES } from "../../domain/entities.js";
import { ForbiddenError, NotFoundError } from "../../domain/errors.js";
import { color, dateString, email as validateEmail, oneOf, optionalText, projectRole, requiredText } from "../../domain/validation.js";

async function projectAccess(env, collaboration, projectId, userId) {
  const role = await collaboration.roleForProject(env, projectId, userId);
  if (!role) throw new NotFoundError("Proyecto no encontrado.");
  return role;
}

export function makeProjectUseCases(repository, collaboration, taskRepository) {
  return {
    list: (env, userId) => repository.list(env, userId),

    async get(env, userId, projectId) {
      const project = await repository.find(env, userId, projectId);
      if (!project) throw new NotFoundError("Proyecto no encontrado.");
      const [members, documents, tasks, activity] = await Promise.all([
        collaboration.listMembers(env, projectId),
        collaboration.listDocuments(env, userId, projectId),
        taskRepository.list(env, userId),
        collaboration.listActivity(env, { projectId, limit: 60 }),
      ]);
      return {
        project,
        members,
        documents,
        tasks: tasks.filter((task) => task.project_id === projectId),
        activity,
      };
    },

    async create(env, userId, input) {
      const name = requiredText(input.name, 120, "Nombre");
      const priority = oneOf(input.priority, PROJECT_PRIORITIES, "Prioridad", "media");
      const description = optionalText(input.description, 2000, "Descripción") || "";
      const dueDate = dateString(input.dueDate ?? input.due_date);
      const projectColor = color(input.color) || "#8b5cf6";
      const project = await repository.create(env, userId, {
        name, priority, description, dueDate, color: projectColor,
      });
      await collaboration.logActivity(env, {
        actorId: userId,
        action: "project.created",
        entityType: "project",
        entityId: project.id,
        projectId: project.id,
        detail: { name },
      });
      return project;
    },

    async update(env, userId, id, input) {
      if (!id) throw new NotFoundError("id requerido.");
      const current = await repository.find(env, userId, id);
      if (!current) throw new NotFoundError("Proyecto no encontrado.");
      if (!PROJECT_ROLE_WRITE.has(current.role)) {
        throw new ForbiddenError("No tienes permiso para editar este proyecto.");
      }
      const patch = {};
      if (input.name !== undefined) patch.name = requiredText(input.name, 120, "Nombre");
      if (input.description !== undefined) patch.description = optionalText(input.description, 2000, "Descripción") || "";
      if (input.status !== undefined) patch.status = oneOf(input.status, PROJECT_STATUSES, "Estado");
      if (input.priority !== undefined) patch.priority = oneOf(input.priority, PROJECT_PRIORITIES, "Prioridad");
      if (input.dueDate !== undefined || input.due_date !== undefined) {
        patch.due_date = dateString(input.dueDate ?? input.due_date);
      }
      if (input.color !== undefined) patch.color = color(input.color);
      if (Object.keys(patch).length) patch.updated_at = new Date().toISOString();
      if (!(await repository.update(env, userId, id, patch))) throw new NotFoundError("Proyecto no encontrado.");
      await collaboration.logActivity(env, {
        actorId: userId,
        action: input.status !== undefined ? "project.status_changed" : "project.updated",
        entityType: "project",
        entityId: id,
        projectId: id,
        detail: { name: patch.name || current.name, status: patch.status || current.status },
      });
    },

    async delete(env, userId, id) {
      const current = await repository.find(env, userId, id);
      if (!current) throw new NotFoundError("Proyecto no encontrado.");
      if (current.role !== "owner") throw new ForbiddenError("Solo el propietario puede eliminar el proyecto.");
      if (!(await repository.delete(env, userId, id))) throw new NotFoundError("Proyecto no encontrado.");
    },

    async invite(env, userId, input) {
      const projectId = requiredText(input.projectId ?? input.project_id, 80, "Proyecto");
      const role = await projectAccess(env, collaboration, projectId, userId);
      if (role !== "owner") throw new ForbiddenError("Solo el propietario puede invitar miembros.");
      const userEmail = validateEmail(input.email);
      const nextRole = projectRole(input.role, "editor");
      if (nextRole === "owner") throw new ForbiddenError("El rol owner no se puede asignar desde una invitación.");
      const target = await collaboration.findUserByEmail(env, userEmail);
      if (!target) throw new NotFoundError("No existe una cuenta con ese correo. La persona debe registrarse primero.");
      if (target.id === userId) throw new ForbiddenError("Ya eres propietario de este proyecto.");
      const member = await collaboration.upsertMember(env, projectId, target.id, nextRole, userId);
      await collaboration.logActivity(env, {
        actorId: userId,
        action: "member.invited",
        entityType: "project_member",
        entityId: target.id,
        projectId,
        detail: { email: userEmail, role: nextRole },
      });
      return member;
    },

    async removeMember(env, userId, projectId, memberId) {
      const role = await projectAccess(env, collaboration, projectId, userId);
      if (role !== "owner") throw new ForbiddenError("Solo el propietario puede quitar miembros.");
      if (memberId === userId) throw new ForbiddenError("No puedes quitarte a ti mismo del proyecto.");
      const removed = await collaboration.removeMember(env, projectId, memberId);
      if (!removed) throw new NotFoundError("Miembro no encontrado o es el propietario.");
      await collaboration.logActivity(env, {
        actorId: userId,
        action: "member.removed",
        entityType: "project_member",
        entityId: memberId,
        projectId,
        detail: {},
      });
    },

    async activity(env, userId, projectId) {
      await projectAccess(env, collaboration, projectId, userId);
      return collaboration.listActivity(env, { projectId, limit: 80 });
    },
  };
}
