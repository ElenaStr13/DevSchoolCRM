import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { ITokens } from './interfaces/token.interface';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { RefreshDto } from './interfaces/refresh.dto';
import { User } from '../../decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ITokens> {
    return this.authService.login(loginDto); // викликає метод authService.login(loginDto)
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard) // щоб тільки залогінені могли
  @Roles('admin')
  @ApiBearerAuth()
  async register(@Request() req, @Body() createUserDto: CreateUserDto) {
    const adminUser = req.user; // поточний логінений користувач
    return this.authService.register(adminUser, createUserDto);
  }

  @Post('refresh')
  @ApiBody({ type: RefreshDto })
  async refresh(@Body() body: RefreshDto): Promise<ITokens> {
    return this.authService.refresh(body.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMe(@User('id') userId: number) {
    return this.authService.me(userId);
  }
}
