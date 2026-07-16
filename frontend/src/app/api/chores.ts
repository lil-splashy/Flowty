import client from './client';

export interface ChoreResponse {
  id: number;
  rollNumber: number;
  description: string;
  category: string;
  completed: boolean;
}

export function getChores(): Promise<ChoreResponse[]> {
  return client.get('/chores').then((r) => r.data);
}

export function createChore(data: { description: string; rollNumber: number; category: string }): Promise<ChoreResponse> {
  return client.post('/chores', data).then((r) => r.data);
}

export function updateChore(id: number, data: { description: string; rollNumber: number; category: string }): Promise<ChoreResponse> {
  return client.put(`/chores/${id}`, data).then((r) => r.data);
}

export function toggleChoreComplete(id: number): Promise<ChoreResponse> {
  return client.patch(`/chores/${id}/complete`).then((r) => r.data);
}

export function deleteChore(id: number): Promise<void> {
  return client.delete(`/chores/${id}`);
}