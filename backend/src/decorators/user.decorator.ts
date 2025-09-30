import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJWTPayload } from '../modules/auth/interfaces/jwt-payload.interface';

export const User = createParamDecorator(
  (
    data: keyof IJWTPayload | undefined,
    ctx: ExecutionContext,
  ): IJWTPayload | IJWTPayload[keyof IJWTPayload] => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as IJWTPayload;
    return data ? user?.[data] : user;
  },
);
