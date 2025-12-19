import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    id: number;
    name: string;
    surname: string;
    fullName: string;
    role: 'admin' | 'manager';
  };
}
