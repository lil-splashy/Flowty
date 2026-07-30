import client from './client';

export interface HabitResponse {
  id: number;
  name: string;
  description: string;
  frequency: string;
  completed: boolean;
}

export interface HabitRequest {
  name: string;
  description?: string;
  frequency: string;
}

export function getHabits(): Promise<HabitResponse[]> {
  return client.get('/habits').then((r) => r.data);
}

export function createHabit(data: HabitRequest): Promise<HabitResponse> {
  return client.post('/habits', data).then((r) => r.data);
}

export function updateHabit(id: number, data: HabitRequest): Promise<HabitResponse> {
  return client.put(`/habits/${id}`, data).then((r) => r.data);
}

export function toggleHabitComplete(id: number): Promise<HabitResponse> {
  return client.patch(`/habits/${id}/toggle`).then((r) => r.data);
}

export function deleteHabit(id: number): Promise<void> {
  return client.delete(`/habits/${id}`);
}