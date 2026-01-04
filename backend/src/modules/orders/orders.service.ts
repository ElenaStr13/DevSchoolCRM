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
    const {
      page = 1,
      take = 25,
      sortBy = 'created_at',
      order = 'DESC',
      onlyMy,
      managerId,
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
    console.log('ROLE:', user.role);
    console.log('RAW onlyMy:', onlyMy);
    console.log('PARSED onlyMy:', ['true', '1'].includes(String(onlyMy)));
    return {
      items,
      total,
      page,
      take,
    };
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
  ) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['group'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id=${id} not found`);
    }

    if (userRole === 'manager' && order.manager && order.manager !== userName) {
      throw new ForbiddenException(`You cannot edit this order`);
    }
    Object.assign(order, dto);
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
    console.log('Updating order group:', {
      orderId: order.id,
      groupName: order.groupName,
    });
    if (dto.groupName) {
      order.groupName = dto.groupName;
    }

    await this.orderRepository.save(order);

    const updated = await this.orderRepository.findOne({
      where: { id: order.id },
      relations: ['group'],
    });
    if (!updated) {
      throw new NotFoundException(`Order with id=${id} not found after update`);
    }

    return {
      ...updated,
      groupName: updated.group?.name ?? null,
    };
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
        throw new ForbiddenException(`You cannot comment on this order`);
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
    // order.managerId = manager.id;
    order.managerUser = manager;
    // order.manager = managerName;

    if (!order.status || order.status === 'New') {
      order.status = 'In Work';
    }
    await this.orderRepository.save(order);
    return order;
  }
}
