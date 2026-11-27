import { D1AuthRepository } from "../infrastructure/d1/auth-repository.js";
import { D1NoteRepository } from "../infrastructure/d1/note-repository.js";
import { D1PreferencesRepository } from "../infrastructure/d1/preferences-repository.js";
import { D1ProjectRepository } from "../infrastructure/d1/project-repository.js";
import { D1TaskRepository } from "../infrastructure/d1/task-repository.js";
import * as security from "../infrastructure/security/session.js";
import { makeAuthUseCases } from "./use-cases/auth.js";
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
  security,
};

export const useCases = {
  auth: makeAuthUseCases(repositories),
  tasks: makeTaskUseCases(repositories.tasks),
  projects: makeProjectUseCases(repositories.projects),
  notes: makeNoteUseCases(repositories.notes),
  preferences: makePreferencesUseCases(repositories.preferences),
};

export { repositories };
