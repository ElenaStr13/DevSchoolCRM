import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class CustomJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path;

    // Публічні роути — пропускаємо без будь-якої перевірки
    const publicPaths = [
      '/auth/login',
      '/auth/register',
      '/auth/set-password',
      '/auth/refresh',
      // додай інші публічні, якщо потрібно
    ];

    if (publicPaths.some((p) => path.startsWith(p) || path === p)) {
      console.log(`Публічний роут ${path} — пропускаємо JWT перевірку`);
      return true; // ← це найважливіше: повний пропуск guard
    }

    // Для захищених роутів — стандартна перевірка
    return super.canActivate(context);
  }

  // Додатковий захист на випадок помилки
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing token');
    }
    return user;
  }
}
