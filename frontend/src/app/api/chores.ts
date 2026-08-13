import client from './client';

export interface ChoreResponse {
  id: number;
  description: string;
  completed: boolean;
}

export function getChores(): Promise<ChoreResponse[]> {
  return client.get('/chores').then((r) => r.data);
}

export function createChore(data: { description: string }): Promise<ChoreResponse> {
  return client.post('/chores', data).then((r) => r.data);
}

export function toggleChoreComplete(id: number): Promise<ChoreResponse> {
  return client.patch(`/chores/${id}/complete`).then((r) => r.data);
}