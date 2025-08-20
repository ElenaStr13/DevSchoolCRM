import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenEntity } from './entities/token.entity';
import { Repository } from 'typeorm';
import { IJWTPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
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
      console.log('JWT payload received:', payload);
      console.log('Searching for token with jti:', payload.jti);
      const tokenEntity = await this.tokenRepository.findOne({
        where: { jti: payload.jti, isBlocked: false }, //Шукає токен у таблиці tokens
        relations: ['user'],
      });
      console.log('TOKEN ENTITY:', tokenEntity);

      if (!tokenEntity) {
        console.log('Token not found in DB or blocked');
        throw new UnauthorizedException('Token is blocked or invalid'); //Якщо не знайдений або isBlocked = true → UnauthorizedException
      }

      const user = tokenEntity.user;
      console.log('Token valid. User returned:', user.email);
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
