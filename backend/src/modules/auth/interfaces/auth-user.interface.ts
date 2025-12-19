export interface AuthUser {
  id: number;
  email?: string;
  role: 'admin' | 'manager';
  name: string;
}
