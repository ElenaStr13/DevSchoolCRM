import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {} //JwtAuthGuard перехоплює запит. Це вмикає Passport з твоєю стратегією JwtStrategy
