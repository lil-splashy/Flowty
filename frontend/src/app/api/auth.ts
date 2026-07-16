import client from './client';

interface AuthResponse {
  token: string;
  username: string;
  email: string;
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