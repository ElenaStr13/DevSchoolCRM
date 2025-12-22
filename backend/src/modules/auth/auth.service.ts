import {
  BadRequestException,
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
import { UserResponseDto } from './dto/user.response.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { SetPasswordDto } from './dto/set-password.dto';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

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
    console.log('LOGIN USER:', user);
    const payload = {
      //Формує payload
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
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
      accessToken,
      refreshToken,
      user,
    };
  }

  async register(
    adminUser: UserEntity,
    createUserDto: CreateUserDto,
  ): Promise<{ user: UserResponseDto; activationLink: string }> {
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

    // Створення нового користувача
    const newUser = this.userRepo.create({
      email: createUserDto.email,
      password: null,
      name: createUserDto.name,
      ...(createUserDto.surname ? { surname: createUserDto.surname } : {}),
      role: 'manager',
      isActive: false,
    });

    const savedUser = await this.userRepo.save(newUser);

    // 4. Створюємо токен активації, який живе 30 хвилин
    const token = this.jwtService.sign(
      { userId: savedUser.id, token_type: 'activate' },
      {
        expiresIn: '30m',
        secret: this.configService.get('JWT_SECRET'),
      },
    );

    // 5. Формуємо посилання для активації
    const activationLink = `${this.configService.get('FRONT_URL')}/activate/${token}`;
    //const activationLink = `${frontUrl}/activate/${activationToken}`;
    const userDto = new UserResponseDto(savedUser);

    // 6. Повертаємо користувача + лінк для фронту
    return {
      user: userDto,
      activationLink,
    };
  }

  //Метод активації — створення паролю
  async setPassword(dto: SetPasswordDto) {
    const payload = this.jwtService.verify(dto.token, {
      secret: this.configService.get('JWT_SECRET'),
    });

    if (!payload || payload.token_type !== 'activate') {
      throw new ForbiddenException('Invalid activation token');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.userId } });
    if (!user) throw new NotFoundException('User not found');

    user.password = await bcrypt.hash(dto.password, 10);
    user.isActive = true;

    return this.userRepo.save(user);
  }

  async refresh(refreshToken: string): Promise<ITokens> {
    try {
      // Перевіряємо refreshToken
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
    } catch {
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
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    //Дістає користувача з БД через
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['tokens'],
    }); //Викликає метод моделі user.validatePassword(password) (bcrypt.compare)

    if (!user) {
      throw new UnauthorizedException('Email and password are required'); //Якщо користувача нема або пароль неправильний → кидає:
    }

    if (user.isBanned) {
      throw new UnauthorizedException('User is banned');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  private async deleteExpiredTokens() {
    const now = new Date();
    await this.tokenRepository.delete({
      refreshTokenExpiresAt: LessThan(now),
    });
  }
}
