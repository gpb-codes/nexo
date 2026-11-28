export type ActivityEntry = {
  id: string;
  actor_id?: string | null;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  project_id?: string | null;
  detail?: Record<string, unknown> | null;
  created_at: string;
};
