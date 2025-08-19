import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ITokens } from './interfaces/token.interface';
import { ConfigService } from '@nestjs/config';
import { Token, TokenType } from './entities/token.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly accessTokenExpiresIn: number;
  private readonly refreshTokenExpiresIn: number;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenExpiresIn =
      this.configService.get<number>('ACCESS_TOKEN_EXPIRATION_TIME') || 0;
    this.refreshTokenExpiresIn =
      this.configService.get<number>('REFRESH_TOKEN_EXPIRATION_TIME') || 0;
  }

  async login(loginDto: LoginDto): Promise<ITokens> {
    //Отримує loginDto з поштою і паролем
    const user = await this.validateUser(loginDto.email, loginDto.password); // викликає щоб перевірити, чи є такий користувач і чи правильний пароль.
    const jti = randomUUID(); //Генерує jti (унікальний ID токена)
    const payload = {
      //Формує payload
      userId: user.id,
      email: user.email,
      role: user.role,
      jti,
    };
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.jwtService.sign(payload, {
      //Створює accessToken
      expiresIn: `${this.accessTokenExpiresIn}s`,
    });
    const refreshToken = this.jwtService.sign(payload, {
      //Створює  refreshToken
      expiresIn: `${this.refreshTokenExpiresIn}s`,
    });
    await this.saveTokens(
      //Збереження токенів у БД
      user,
      accessToken,
      refreshToken,
      this.accessTokenExpiresIn,
      this.refreshTokenExpiresIn,
      jti,
    );
    await this.deleteExpiredTokens();
    return {
      accessToken, //повертається до користувача
      refreshToken, //повертається до користувача
    };
  }

  private async saveTokens(
    user: User,
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number,
    refreshTokenExpiresIn: number,
    jti: string,
  ): Promise<void> {
    const accessTokenEntity = this.tokenRepository.create({
      token: accessToken,
      type: TokenType.ACCESS,
      expiresAt: new Date(Date.now() + accessTokenExpiresIn * 1000),
      user,
      jti,
    });

    const refreshTokenEntity = this.tokenRepository.create({
      token: refreshToken,
      type: TokenType.REFRESH,
      expiresAt: new Date(Date.now() + refreshTokenExpiresIn * 1000),
      user,
      jti,
    });

    await this.tokenRepository.save([accessTokenEntity, refreshTokenEntity]);
  }

  private async validateUser(email: string, password: string): Promise<User> {
    //Дістає користувача з БД через
    const user = await this.userRepo.findOneBy({ email }); //Викликає метод моделі user.validatePassword(password) (ймовірно, bcrypt.compare)

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Invalid credentials'); //Якщо користувача нема або пароль неправильний → кидає:
    }
    return user;
  }

  private async deleteExpiredTokens() {
    //видаляє з таблиці ті записи, у яких refreshTokenExpiresAt
    const now = new Date();
    await this.tokenRepository.delete({
      expiresAt: LessThan(now),
    });
  }
}
