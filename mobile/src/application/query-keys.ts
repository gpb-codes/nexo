export const queryKeys = {
  session: ["session"] as const,
  tasks: ["tasks"] as const,
  projects: ["projects"] as const,
  projectDetail: (id: string) => ["projects", id] as const,
  documents: ["documents"] as const,
  document: (id: string) => ["documents", id] as const,
  notes: ["notes"] as const,
  preferences: ["preferences"] as const,
};
