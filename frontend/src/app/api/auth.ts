import client from './client';

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

export interface WidgetPlacement {
  widgetId: string;
  x: number;
  y: number;
  zIndex: number;
}

export function signup(username: string, email: string, password: string): Promise<AuthResponse> {
  return client.post('/auth/signup', { username, email, password }).then((r) => r.data);
}

export function login(username: string, password: string): Promise<AuthResponse> {
  return client.post('/auth/login', { username, password }).then((r) => r.data);
}

export function getMe(): Promise<AuthResponse> {
  return client.get('/auth/me').then((r) => r.data);
}

export function getWidgetPlacements(): Promise<WidgetPlacement[]> {
  return client.get('/auth/me/widget-placements').then((r) => r.data);
}

export function updateWidgetPlacements(placements: WidgetPlacement[]): Promise<WidgetPlacement[]> {
  return client.put('/auth/me/widget-placements', { placements }).then((r) => r.data);
}
