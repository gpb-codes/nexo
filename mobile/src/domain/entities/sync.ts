export type OutboxItem = {
  id: string;
  entity: string;
  operation: string;
  payload: string;
  created_at: string;
  status: string;
  attempts: number;
};

export type SyncResult = {
  processed: number;
  failed: number;
};
