import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../auth/entities/user.entity';
import { OrdersEntity } from '../orders/entities/orders.entity';
import { TokenEntity } from '../auth/entities/token.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ManagersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OrdersEntity)
    private readonly orderRepository: Repository<OrdersEntity>,
    @InjectRepository(TokenEntity)
    private readonly tokenRepository: Repository<TokenEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // Пагінація менеджерів
  async findManagersPaginated(page = 1, take = 10) {
    const skip = (page - 1) * take;

    const [managers, total] = await this.userRepository.findAndCount({
      where: { role: 'manager' },
      order: { id: 'DESC' },
      skip,
      take,
    });

    // Кількість заявок для кожного менеджера
    for (const manager of managers) {
      manager['totalOrders'] = await this.orderRepository.count({
        where: { manager: manager.name },
      });
    }

    return {
      data: managers,
      meta: {
        total,
        page,
        take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findAllManagers() {
    return this.userRepository.find({
      where: { role: 'manager', isActive: true },
      order: { name: 'ASC' },
    });
  }

  // Статистика менеджера (кількість заявок по статусах)
  async getManagerStatistics(
    managerId: number,
  ): Promise<Record<string, number>> {
    // 1. знайти менеджера
    const user = await this.userRepository.findOne({
      where: { id: managerId, role: 'manager' },
    });

    if (!user) {
      throw new NotFoundException(`Manager with id ${managerId} not found`);
    }

    const managerName = user.name; // заявки прив'язані по name

    // 2. групуємо всі заявки менеджера
    const rows = await this.orderRepository
      .createQueryBuilder('o')
      .select("LOWER(COALESCE(NULLIF(o.status, ''), 'без статусу'))", 'status')
      .addSelect('COUNT(o.id)', 'count')
      .where('o.manager = :manager', { manager: managerName })
      .groupBy("LOWER(COALESCE(NULLIF(o.status, ''), 'без статусу'))")
      .getRawMany<{ status: string; count: string }>();

    // 3. назви статусів
    const prettyNames: Record<string, string> = {
      new: 'New',
      'in work': 'In work',
      agree: 'Agree',
      disaggre: 'Disagree',
      dubbing: 'Dubbing',
      'без статусу': 'Без статусу',
    };

    const result: Record<string, number> = {};

    rows.forEach(({ status, count }) => {
      const clean = status?.trim().toLowerCase() || 'без статусу';
      const key = prettyNames[clean] || clean;
      result[key] = parseInt(count, 10);
    });

    return result;
  }

  // Активувати менеджера
  async activateManager(
    userId: number,
  ): Promise<{ user: UserEntity; activationLink: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    // 1. Активуємо користувача
    user.isActive = true;
    await this.userRepository.save(user);

    // 2. Генеруємо токен для фронту
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const frontUrl = this.configService.get<string>('FRONT_URL');
    if (!jwtSecret || !frontUrl)
      throw new Error('JWT_SECRET or FRONT_URL not configured');

    const token = this.jwtService.sign(
      { userId: user.id, token_type: 'activate' },
      { expiresIn: '30m', secret: jwtSecret },
    );

    const activationLink = `${frontUrl}/activate/${token}`;

    return { user, activationLink };
  }

  async generateRecoveryPasswordLink(
    userId: number,
  ): Promise<{ user: UserEntity; recoveryLink: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Не міняємо isActive — він і так true
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const frontUrl = this.configService.get<string>('FRONT_URL');

    const token = this.jwtService.sign(
      { userId: user.id, token_type: 'activate' },
      { expiresIn: '30m', secret: jwtSecret },
    );

    const recoveryLink = `${frontUrl}/activate/${token}`;
    return { user, recoveryLink };
  }

  // Бан
  async banManager(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException('User not found');

    user.isBanned = true;
    await this.userRepository.save(user);
    return { message: 'User banned' };
  }
  //Розбан
  async unbanManager(id: number): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException('User not found');
    user.isBanned = false;
    //user.isActive = true;
    await this.userRepository.save(user);
    return { message: 'User unbanned' };
  }
}
