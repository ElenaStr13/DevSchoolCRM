import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrdersEntity } from './entities/orders.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from './entities/pagination.dto';
import { GroupEntity } from '../group/entities/group.entity';
import { UserEntity } from '../auth/entities/user.entity';
import * as ExcelJS from 'exceljs';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { OrdersFilterBuilder } from './utils/orders-filter.builder';
import { OrdersManagerFilter } from './utils/orders-manager.filter';

@Injectable()
export class OrdersService {
  private static readonly SORTABLE_COLUMNS: (keyof OrdersEntity)[] = [
    'id',
    'name',
    'surname',
    'email',
    'phone',
    'age',
    'course',
    'course_format',
    'course_type',
    'status',
    'sum',
    'alreadyPaid',
    'groupName',
    'created_at',
    'manager',
  ];

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OrdersEntity)
    private readonly orderRepository: Repository<OrdersEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  // заявки з пагінацією
  async findPaginated(query: PaginationQueryDto, user: AuthUser) {
    try {
      const {
        page = 1,
        take = 25,
        sortBy = 'created_at',
        order = 'DESC',
        onlyMy,
        managerId,
      } = query;

      console.log('=== findPaginated START ===');
      console.log('Raw query object:', query);
      console.log('Parsed values:', {
        page,
        take,
        sortBy,
        order,
        onlyMy: onlyMy !== undefined ? String(onlyMy) : undefined,
        managerId,
        userRole: user.role,
        userId: user.id,
      });

      const qb = this.orderRepository
        .createQueryBuilder('o')
        .leftJoinAndSelect('o.group', 'group')
        .leftJoin('o.managerUser', 'manager');
      //.leftJoinAndSelect('o.managerUser', 'manager');

      // Лог після створення базового query builder (до фільтрів)
      console.log('Base SQL (before filters):', qb.getQueryAndParameters());

      OrdersFilterBuilder.apply(qb, query);

      OrdersManagerFilter.apply(
        qb,
        user,
        managerId ? Number(managerId) : undefined,
        ['true', '1'].includes(String(onlyMy)),
      );

      // Сортування
      qb.orderBy(`o.${sortBy}`, order);

      // Перевірка на ILIKE (якщо все ще з'являється — побачимо)
      if (qb.getQuery().toUpperCase().includes('ILIKE')) {
        console.error(
          '!!! ILIKE ВСЕ ЩЕ ПРИСУТНІЙ В SQL! Перевір код фільтрів.',
        );
      }

      // Пагінація
      qb.skip((page - 1) * take).take(take);
      console.log('SQL before execution:', qb.getQueryAndParameters());
      const [items, total] = await qb.getManyAndCount();

      return {
        items,
        total,
        page,
        take,
      };
    } catch (error) {
      const err = error as Error;
      console.error('CRASH IN findPaginated');
      console.error('Query params:', query);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      console.error('Full error:', err);
      throw err;
    }
  }

  async getAllForExport() {
    return this.orderRepository.find({
      relations: ['group'],
      order: { id: 'ASC' },
    });
  }

  async generateExcel() {
    const orders = await this.getAllForExport();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Surname', key: 'surname', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Course', key: 'course', width: 15 },
      { header: 'Group', key: 'group', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Sum', key: 'sum', width: 10 },
    ];

    orders.forEach((order) => {
      worksheet.addRow({
        id: order.id,
        name: order.name,
        surname: order.surname,
        email: order.email,
        phone: order.phone,
        course: order.course,
        group: order.group?.name || '-',
        status: order.status,
        sum: order.sum,
      });
    });

    return workbook.xlsx.writeBuffer();
  }

  async findOne(id: number) {
    try {
      // Перевіряємо, що id валідне число
      if (!id || typeof id !== 'number') {
        throw new NotFoundException(`Invalid order id: ${id}`);
      }

      // Шукаємо замовлення з усіма потрібними relations
      const order = await this.orderRepository.findOne({
        where: { id }, // саме так правильно для TypeORM v0.3.x
        relations: ['group'],
      });

      if (!order) {
        // Якщо замовлення не знайдено
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      return order;
    } catch (err) {
      // Логування для дебагу
      console.error('Помилка завантаження заявки (findOne):', {
        id,
      });

      throw err;
    }
  }

  async update(
    id: number,
    dto: Partial<OrdersEntity>,
    userRole: 'admin' | 'manager',
    userName: string,
  ): Promise<OrdersEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['managerUser', 'group'], // важливо, якщо managerUser — це relation
    });

    if (!order) {
      throw new NotFoundException(`Order with id=${id} not found`);
    }
    let statusExplicitlySetToNew = false;
    // менеджер не може міняти чужу заявку
    if (userRole === 'manager') {
      if (order.managerUser && order.managerUser.name !== userName) {
        throw new ForbiddenException('Ви не можете змінювати цю заявку');
      }
    }

    //  1. якщо статус New → знімаємо менеджера
    if (dto.status === 'New' && order.status !== 'New') {
      order.status = 'New';
      order.managerUser = null;
      order.manager = null;
      statusExplicitlySetToNew = true;
    }
    // Звичайне оновлення полів (крім спеціальних)
    //Object.assign(order, dto);
    const { status, manager, managerUser, group, groupName, ...safeFields } =
      dto;
    Object.assign(order, safeFields);

    // Якщо заявка була без менеджера і редагує саме менеджер → призначаємо його
    if (
      userRole === 'manager' &&
      !order.managerUser &&
      //(!order.status || order.status === 'New') &&
      !statusExplicitlySetToNew
    ) {
      const manager = await this.userRepository.findOne({
        where: { name: userName, role: 'manager' },
      });

      if (manager) {
        order.managerUser = manager;
        order.manager = userName; // синхронізуємо строкове поле
        // Якщо статус був New або відсутній → переводимо в роботу
        if (!order.status || order.status === 'New') {
          order.status = 'In work';
        }
      }
    }

    //  group
    if (dto.groupName) {
      let group = await this.groupRepository.findOne({
        where: { name: dto.groupName },
      });

      if (!group) {
        group = this.groupRepository.create({ name: dto.groupName });
        await this.groupRepository.save(group);
      }

      order.group = group;
      order.groupName = group.name;
    }

    return await this.orderRepository.save(order);
  }

  async updateStatus(id: number, status: string) {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    order.status = status;
    return await this.orderRepository.save(order);
  }

  async addComment(
    orderId: number,
    author: string,
    text: string,
    isAdmin = false,
  ) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    if (!isAdmin) {
      if (order.manager && order.manager !== author) {
        throw new ForbiddenException(`Ви не можете коментувати цю заявку`);
      }
      if (!order.manager) {
        order.manager = author;
      }
      //Якщо статус null або "New" → ставимо "In work"
      if (!order.status || order.status === 'New') {
        order.status = 'In work';
      }
    }

    const newComment = { author, text, createdAt: new Date().toISOString() };

    // Додаємо коментар у масив
    order.comments = order.comments
      ? [...order.comments, newComment]
      : [newComment];

    // Зберігаємо замовлення
    await this.orderRepository.save(order);

    // Повертаємо **новий коментар**, а не весь order
    return newComment;
  }

  async assignGroup(orderId: number, groupId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['group'],
    });
    if (!order) throw new NotFoundException(`Order not found`);

    const group = await this.groupRepository.findOneBy({ id: groupId });
    if (!group) throw new NotFoundException(`Group not found`);

    order.group = group;
    order.groupName = group.name;

    const saved = await this.orderRepository.save(order);
    return { ...saved, groupName: saved.group?.name ?? null };
  }

  async findMyOrdersPaginated(user: AuthUser, query: PaginationQueryDto) {
    const {
      page = 1,
      take = 25,
      sortBy = 'created_at',
      order = 'DESC',
      managerId,
      onlyMy,
    } = query;

    const qb = this.orderRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.group', 'group')
      .leftJoinAndSelect('o.managerUser', 'manager');

    OrdersFilterBuilder.apply(qb, query);

    OrdersManagerFilter.apply(
      qb,
      user,
      managerId ? Number(managerId) : undefined,
      ['true', '1'].includes(String(onlyMy)),
    );

    // Сортування
    qb.orderBy(`o.${sortBy}`, order);

    // Пагінація
    qb.skip((page - 1) * take).take(take);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      take,
    };
  }

  async getStatistics(): Promise<Record<string, number>> {
    const rawStatuses = await this.orderRepository
      .createQueryBuilder('order')
      .select(
        "LOWER(COALESCE(NULLIF(order.status, ''), 'без статусу'))",
        'status',
      )
      .addSelect('COUNT(order.id)', 'count')
      .groupBy("LOWER(COALESCE(NULLIF(order.status, ''), 'без статусу'))")
      .getRawMany<{ status: string; count: string }>();

    // Нормалізація назв для красивого відображення на фронті
    const prettyNames: Record<string, string> = {
      new: 'New',
      'in work': 'In work',
      agree: 'Agree',
      disaggre: 'Disagree',
      dubbing: 'Dubbing',
      'без статусу': 'Без статусу',
    };

    const result: Record<string, number> = {};

    rawStatuses.forEach(({ status, count }) => {
      const clean = status?.trim().toLowerCase() || 'без статусу';
      const key = prettyNames[clean] || clean;
      result[key] = (result[key] || 0) + parseInt(count, 10);
    });

    return result;
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    if (role !== 'admin' && role !== 'manager') {
      throw new Error(`Invalid role: ${role}`);
    }

    const managers = await this.userRepository.find({
      where: { role: role },
      order: { id: 'DESC' },
    });

    for (const manager of managers) {
      manager['totalOrders'] = await this.orderRepository.count({
        where: { manager: manager.name }, // заявки привязаны по имени
      });
    }

    return managers;
  }

  async assignManager(id: number, managerName: string) {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    const manager = await this.userRepository.findOne({
      where: { name: managerName, role: 'manager' },
    });
    if (!manager) {
      throw new NotFoundException('Manager not found');
    }
    order.manager = manager.name;
    order.managerUser = manager;

    if (!order.status || order.status === 'New') {
      order.status = 'In Work';
    }
    await this.orderRepository.save(order);
    return order;
  }
}
