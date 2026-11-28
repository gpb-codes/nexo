import { DOCUMENT_STATUSES } from "../../domain/entities.js";
import { ForbiddenError, NotFoundError } from "../../domain/errors.js";
import { documentStatus, oneOf, optionalText, requiredText } from "../../domain/validation.js";

async function assertDocumentWrite(env, collaboration, document, userId) {
  if (document.owner_id === userId || document.role === "owner" || document.role === "editor") return;
  throw new ForbiddenError("No tienes permiso para editar este documento.");
}

export function makeDocumentUseCases(collaboration) {
  return {
    async list(env, userId, projectId) {
      if (projectId) {
        const role = await collaboration.roleForProject(env, projectId, userId);
        if (!role) throw new NotFoundError("Proyecto no encontrado.");
      }
      return collaboration.listDocuments(env, userId, projectId || null);
    },

    async get(env, userId, documentId) {
      const document = await collaboration.findDocument(env, userId, documentId);
      if (!document) throw new NotFoundError("Documento no encontrado.");
      const [versions, activity] = await Promise.all([
        collaboration.listVersions(env, documentId),
        collaboration.listActivity(env, { entityType: "document", entityId: documentId, limit: 60 }),
      ]);
      return {
        ...document,
        content: document.content || "",
        versions,
        activity,
      };
    },

    async create(env, userId, input) {
      const title = requiredText(input.title, 160, "Título");
      const content = optionalText(input.content, 50000, "Contenido") || "";
      const status = documentStatus(input.status, "activo");
      const projectId = optionalText(input.projectId ?? input.project_id, 80, "Proyecto") || null;
      if (projectId) {
        const role = await collaboration.roleForProject(env, projectId, userId);
        if (!role) throw new NotFoundError("Proyecto no encontrado.");
        if (role !== "owner" && role !== "editor") {
          throw new ForbiddenError("No tienes permiso para crear documentos en este proyecto.");
        }
      }
      const document = await collaboration.createDocument(env, userId, { title, content, status, projectId });
      await collaboration.logActivity(env, {
        actorId: userId,
        action: "document.created",
        entityType: "document",
        entityId: document.id,
        projectId,
        detail: { title },
      });
      return document;
    },

    async update(env, userId, documentId, input) {
      const document = await collaboration.findDocument(env, userId, documentId);
      if (!document) throw new NotFoundError("Documento no encontrado.");
      await assertDocumentWrite(env, collaboration, document, userId);
      const patch = {};
      if (input.title !== undefined) patch.title = requiredText(input.title, 160, "Título");
      if (input.content !== undefined) patch.content = optionalText(input.content, 50000, "Contenido") || "";
      if (input.status !== undefined) patch.status = oneOf(input.status, DOCUMENT_STATUSES, "Estado del documento");
      if (input.projectId !== undefined || input.project_id !== undefined) {
        patch.projectId = optionalText(input.projectId ?? input.project_id, 80, "Proyecto") || null;
        if (patch.projectId) {
          const role = await collaboration.roleForProject(env, patch.projectId, userId);
          if (!role) throw new NotFoundError("Proyecto no encontrado.");
          if (role !== "owner" && role !== "editor") {
            throw new ForbiddenError("No tienes permiso para mover el documento a este proyecto.");
          }
        }
      }
      const updated = await collaboration.updateDocument(env, userId, documentId, patch);
      if (!updated) throw new NotFoundError("Documento no encontrado.");
      await collaboration.logActivity(env, {
        actorId: userId,
        action: "document.updated",
        entityType: "document",
        entityId: documentId,
        projectId: updated.project_id || document.project_id || null,
        detail: { title: updated.title, status: updated.status },
      });
      return updated;
    },

    async delete(env, userId, documentId) {
      const document = await collaboration.findDocument(env, userId, documentId);
      if (!document) throw new NotFoundError("Documento no encontrado.");
      if (document.owner_id !== userId && document.role !== "owner") {
        throw new ForbiddenError("Solo el propietario puede eliminar el documento.");
      }
      const deleted = await collaboration.deleteDocument(env, userId, documentId);
      if (!deleted) throw new NotFoundError("Documento no encontrado.");
      await collaboration.logActivity(env, {
        actorId: userId,
        action: "document.deleted",
        entityType: "document",
        entityId: documentId,
        projectId: document.project_id || null,
        detail: { title: document.title },
      });
    },
  };
}
