import client from './client';

export interface StampSlotResponse {
  slotNumber: number;
  filled: boolean;
}

export interface StampCardResponse {
  id: string;
  totalStamps: number;
  redeemed: boolean;
  slots: StampSlotResponse[];
}

export function getStampCards(): Promise<StampCardResponse[]> {
  return client.get('/stampcards').then((r) => r.data);
}

export function getActiveCard(): Promise<StampCardResponse> {
  return client.get('/stampcards/active').then((r) => r.data);
}

export function addStamp(cardId: string): Promise<StampCardResponse> {
  return client.post(`/stampcards/${cardId}/stamp`).then((r) => r.data);
}

export function redeemCard(cardId: string): Promise<StampCardResponse> {
  return client.post(`/stampcards/${cardId}/redeem`).then((r) => r.data);
}