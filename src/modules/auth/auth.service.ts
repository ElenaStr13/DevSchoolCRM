import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ITokens } from './interfaces/token.interface';
import { ConfigService } from '@nestjs/config';
import { TokenEntity } from './entities/token.entity';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from './dto/user.response.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  private readonly accessTokenExpiresIn: number;
  private readonly refreshTokenExpiresIn: number;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
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

  async register(
    adminUser: UserEntity,
    createUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    // Перевірка, чи користувач адмін
    if (adminUser.role !== 'admin') {
      throw new ForbiddenException('Only admins can register new users');
    }

    // Перевірка, чи email вже існує
    const existingUser = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ForbiddenException('User with this email already exists');
    }

    // Хешування пароля
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Створення нового користувача
    const newUser = this.userRepo.create({
      email: createUserDto.email,
      password: hashedPassword,
      role: createUserDto.role, // manager, admin або інші ролі
    });

    return await this.userRepo.save(newUser);
  }

  async refresh(refreshToken: string): Promise<ITokens> {
    try {
      // Перевіряємо refreshToken
      const payload = this.jwtService.verify(refreshToken);
      const tokenEntity = await this.tokenRepository.findOne({
        where: { refreshToken, isBlocked: false },
        relations: ['user'],
      });

      if (!tokenEntity) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Новий jti
      const jti = randomUUID();
      const newPayload = {
        userId: tokenEntity.user.id,
        email: tokenEntity.user.email,
        role: tokenEntity.user.role,
        jti,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: `${this.accessTokenExpiresIn}s`,
      });
      const newRefreshToken = this.jwtService.sign(newPayload, {
        expiresIn: `${this.refreshTokenExpiresIn}s`,
      });

      // Оновлюємо токени в БД
      tokenEntity.accessToken = newAccessToken;
      tokenEntity.refreshToken = newRefreshToken;
      tokenEntity.accessTokenExpiresAt = new Date(
        Date.now() + this.accessTokenExpiresIn * 1000,
      );
      tokenEntity.refreshTokenExpiresAt = new Date(
        Date.now() + this.refreshTokenExpiresIn * 1000,
      );
      tokenEntity.jti = jti;

      await this.tokenRepository.save(tokenEntity);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Refresh token expired or invalid');
    }
  }

  async me(userId: number): Promise<Partial<UserResponseDto> | null> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;
    const dto = plainToInstance(UserResponseDto, user);
    return instanceToPlain(dto);
  }

  private async saveTokens(
    user: UserEntity,
    accessToken: string,
    refreshToken: string,
    accessTokenExpiresIn: number,
    refreshTokenExpiresIn: number,
    jti: string,
  ): Promise<void> {
    const tokenEntity = this.tokenRepository.create({
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(Date.now() + accessTokenExpiresIn * 1000),
      refreshTokenExpiresAt: new Date(
        Date.now() + refreshTokenExpiresIn * 1000,
      ),
      user,
      jti,
      isBlocked: false,
    });
    await this.tokenRepository.save(tokenEntity);
  }

  private async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity> {
    //Дістає користувача з БД через
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['tokens'],
    }); //Викликає метод моделі user.validatePassword(password) (bcrypt.compare)

    if (!user || !(await user.validatePassword(password))) {
      throw new UnauthorizedException('Invalid credentials'); //Якщо користувача нема або пароль неправильний → кидає:
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  private async deleteExpiredTokens() {
    //видаляє з таблиці ті записи, у яких refreshTokenExpiresAt
    const now = new Date();
    await this.tokenRepository.delete({
      refreshTokenExpiresAt: LessThan(now),
    });
  }
}
