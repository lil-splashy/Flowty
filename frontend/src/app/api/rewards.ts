import client from './client';

export interface SpendResponse {
  previousBalance: number;
  newBalance: number;
  pointsSpent: number;
  itemName: string;
}

export function spendPoints(points: number, itemName: string): Promise<SpendResponse> {
  return client.post('/rewards/spend', { points, itemName }).then((r) => r.data);
}