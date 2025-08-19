import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { IJWTPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: IJWTPayload) {
    //Розшифровує токен, отримує payload
    try {
      const tokenEntity = await this.tokenRepository.findOne({
        where: { jti: payload.jti, isBlocked: false }, //Шукає токен у таблиці tokens
        relations: ['user'],
      });
      console.log('TOKEN ENTITY:', tokenEntity);

      if (!tokenEntity) {
        throw new UnauthorizedException('Token is blocked or invalid'); //Якщо не знайдений або isBlocked = true → UnauthorizedException
      }

      const user = tokenEntity.user;
      // Якщо знайдений → повертає { id, email, role }
      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
