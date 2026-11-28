import { chatCompletion } from "../infrastructure/ai/openai-compatible.js";
import { D1AuthRepository } from "../infrastructure/d1/auth-repository.js";
import { D1CollaborationRepository } from "../infrastructure/d1/collaboration-repository.js";
import { D1NoteRepository } from "../infrastructure/d1/note-repository.js";
import { D1PreferencesRepository } from "../infrastructure/d1/preferences-repository.js";
import { D1ProjectRepository } from "../infrastructure/d1/project-repository.js";
import { D1TaskRepository } from "../infrastructure/d1/task-repository.js";
import * as security from "../infrastructure/security/session.js";
import { makeAiUseCases } from "./use-cases/ai.js";
import { makeAuthUseCases } from "./use-cases/auth.js";
import { makeDocumentUseCases } from "./use-cases/documents.js";
import { makeNoteUseCases } from "./use-cases/notes.js";
import { makePreferencesUseCases } from "./use-cases/preferences.js";
import { makeProjectUseCases } from "./use-cases/projects.js";
import { makeTaskUseCases } from "./use-cases/tasks.js";

const repositories = {
  auth: new D1AuthRepository(),
  tasks: new D1TaskRepository(),
  projects: new D1ProjectRepository(),
  notes: new D1NoteRepository(),
  preferences: new D1PreferencesRepository(),
  collaboration: new D1CollaborationRepository(),
  security,
};

export const useCases = {
  ai: makeAiUseCases({ chatCompletion }),
  auth: makeAuthUseCases(repositories),
  tasks: makeTaskUseCases(repositories.tasks, repositories.collaboration),
  projects: makeProjectUseCases(repositories.projects, repositories.collaboration, repositories.tasks),
  notes: makeNoteUseCases(repositories.notes),
  preferences: makePreferencesUseCases(repositories.preferences),
  documents: makeDocumentUseCases(repositories.collaboration),
};

export { repositories };
