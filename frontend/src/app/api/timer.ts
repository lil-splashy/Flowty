import client from './client';

export function completeSession(): Promise<{ pointsEarned: number; status: string }> {
  return client.post('/timer/session-complete').then((r) => r.data);
}