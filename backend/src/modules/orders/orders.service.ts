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
  ] as const;

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(OrdersEntity)
    private readonly orderRepository: Repository<OrdersEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  // всі заявки
  async findAll(): Promise<OrdersEntity[]> {
    return this.orderRepository.find({
      select: OrdersService.SORTABLE_COLUMNS,
      order: { created_at: 'DESC' },
    });
  }

  // заявки з пагінацією
  async findPaginated(
    query: PaginationQueryDto,
    user: { id: number; role: string; name: string }, // Тип користувача
  ) {
    const {
      page = 1,
      take = 25,
      sortBy = 'created_at',
      order = 'DESC',
      manager: managerFilter,
      onlyMy,
      ...filters
    } = query;

    console.log('USER:', user);
    console.log('RAW QUERY:', query);
    console.log('FILTERS:', filters);

    const qb = this.orderRepository
      .createQueryBuilder('o')
      .leftJoinAndSelect('o.group', 'group');
    const isOnlyMy = ['true', '1', 'on'].includes(String(onlyMy).toLowerCase());
    console.log('onlyMy:', onlyMy, '=>', isOnlyMy);
    // менеджер — ЗАВЖДИ тільки свої
    if (user.role === 'manager') {
      qb.andWhere('LOWER(TRIM(o.manager)) = LOWER(:manager)', {
        manager: user.name.trim(),
      });
    }

    // адмін
    if (user.role === 'admin') {
      if (isOnlyMy) {
        qb.andWhere('LOWER(TRIM(o.manager)) = LOWER(:manager)', {
          manager: user.name.trim(),
        });
      } else if (managerFilter) {
        qb.andWhere('LOWER(TRIM(o.manager)) LIKE LOWER(:managerFilter)', {
          managerFilter: `%${managerFilter.trim()}%`,
        });
      }
    }

    // Фільтрація за іншими параметрами
    Object.entries(filters).forEach(([key, value]) => {
      if (!value || value === '') return;

      if (OrdersService.SORTABLE_COLUMNS.includes(key as any)) {
        if (typeof value === 'string' && isNaN(Number(value))) {
          qb.andWhere(`LOWER(o.${key}) LIKE LOWER(:${key})`, {
            [key]: `%${value.trim()}%`,
          });
        } else {
          qb.andWhere(`o.${key} = :${key}`, { [key]: value });
        }
      }
    });

    // Сортування
    qb.orderBy(`o.${sortBy}`, order);

    // Пагінація
    qb.skip((page - 1) * take).take(take);

    console.log('SQL:', qb.getSql());
    console.log('PARAMS:', qb.getParameters());

    const [items, total] = await qb.getManyAndCount();

    console.log('FINAL SQL:', qb.getSql());
    console.log('FINAL PARAMS:', qb.getParameters());
    return {
      items,
      total,
      page,
      take,
    };
  }

  async getAllForExport(filters: Record<string, any>) {
    return this.orderRepository.find({
      relations: ['group'],
      order: { id: 'ASC' },
    });
  }

  async generateExcel(filters: Record<string, any>) {
    const orders = await this.getAllForExport(filters);

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
        relations: ['group'], // якщо потрібні додаткові relations, додавай сюди
      });

      if (!order) {
        // Якщо замовлення не знайдено
        throw new NotFoundException(`Order with id ${id} not found`);
      }

      return order;
    } catch (err) {
      // Логування для дебагу
      console.error('Помилка завантаження заявки (findOne):', {
        //message: err.message,
        //stack: err.stack,
        id,
      });
      // Кидаємо помилку далі, NestJS перетворить її на відповідний HTTP код
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
      //(order as any).student_group = group.name;
    }
    console.log('Updating order group:', {
      orderId: order.id,
      groupName: order.groupName,
      //groupId: group.id,
    });
    if (dto.groupName) {
      order.groupName = dto.groupName; // ← вручну замінюємо, TypeORM тепер точно бачить зміну
    }

    //return await this.orderRepository.save(order);
    await this.orderRepository.save(order);

    // ПІСЛЯ ЗБЕРЕЖЕННЯ ПІДВАНТАЖУЄМО АКТУАЛЬНІ ДАНІ
    const updated = await this.orderRepository.findOne({
      where: { id: order.id },
      relations: ['group'],
    });
    if (!updated) {
      throw new NotFoundException(`Order with id=${id} not found after update`);
    }
    // ДОДАЄМО groupName ДЛЯ ФРОНТУ
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

  async findMyOrdersPaginated(
    user: AuthUser,
    // currentManagerName: string,
    query: PaginationQueryDto,
  ) {
    const {
      page = 1,
      take = 25,
      sortBy = 'created_at',
      order = 'DESC',
      status,
      search,
      name,
      surname,
      email,
      phone,
      age,
      course,
      course_format,
      course_type,
      manager: managerFilter,
      groupName,
      onlyMy,
    } = query;

    console.log('query.onlyMy:', onlyMy, 'type:', typeof onlyMy);
    console.log('query.managerFilter:', managerFilter);

    /* ================== NORMALIZE onlyMy ================== */
    const isOnlyMy = onlyMy === 'true' || onlyMy === '1';

    console.log('isOnlyMy (normalized):', isOnlyMy);

    const skip = (page - 1) * take;

    /* ================== SORT ================== */
    const sortColumn = OrdersService.SORTABLE_COLUMNS.includes(sortBy as any)
      ? sortBy
      : 'created_at';

    const sortDirection: 'ASC' | 'DESC' = order === 'ASC' ? 'ASC' : 'DESC';

    /* ================== QUERY BUILDER ================== */
    const qb = this.orderRepository
      .createQueryBuilder('o')
      .select(OrdersService.SORTABLE_COLUMNS.map((col) => `o.${col}`))
      .where('1=1');

    /* ================== FILTERS ================== */
    if (name) {
      qb.andWhere('LOWER(o.name) LIKE LOWER(:name)', { name: `%${name}%` });
    }

    if (surname) {
      qb.andWhere('LOWER(o.surname) LIKE LOWER(:surname)', {
        surname: `%${surname}%`,
      });
    }

    if (email) {
      qb.andWhere('LOWER(o.email) LIKE LOWER(:email)', {
        email: `%${email}%`,
      });
    }

    if (phone) {
      qb.andWhere('o.phone LIKE :phone', { phone: `%${phone}%` });
    }

    if (age !== undefined) {
      qb.andWhere('o.age = :age', { age });
    }

    if (course) {
      qb.andWhere('o.course = :course', { course });
    }

    if (course_format) {
      qb.andWhere('o.course_format = :course_format', { course_format });
    }

    if (course_type) {
      qb.andWhere('o.course_type = :course_type', { course_type });
    }

    if (status) {
      qb.andWhere('o.status = :status', { status });
    }

    /* ================== MANAGER FILTER ================== */
    console.log('ROLE:', user.role);
    console.log('onlyMy:', onlyMy);
    console.log('managerFilter:', managerFilter);

    // менеджер — завжди тільки свої
    if (user.role === 'manager') {
      qb.andWhere('LOWER(o.manager) = LOWER(:manager)', {
        manager: user.name,
      });
    }

    // адмін
    if (user.role === 'admin') {
      if (isOnlyMy) {
        qb.andWhere('LOWER(o.manager) = LOWER(:manager)', {
          manager: user.name,
        });
      }

      if (managerFilter) {
        qb.andWhere('LOWER(o.manager) LIKE LOWER(:managerFilter)', {
          managerFilter: `%${managerFilter}%`,
        });
      }
    }

    // // 1️Якщо менеджер — завжди тільки свої
    // if (user.role === 'manager') {
    //   qb.andWhere('LOWER(o.manager) = LOWER(:manager)', {
    //     manager: user.name,
    //   });
    // }
    //
    // // 2️ Якщо адмін і включено "тільки мої"
    // else if (isOnlyMy) {
    //   qb.andWhere('LOWER(o.manager) = LOWER(:manager)', {
    //     manager: user.name,
    //   });
    // }
    //
    // // 3️Якщо адмін і введений manager у фільтрі
    // else if (managerFilter) {
    //   qb.andWhere('LOWER(o.manager) LIKE LOWER(:managerFilter)', {
    //     managerFilter: `%${managerFilter}%`,
    //   });
    // }
    /* ================== GROUP ================== */
    if (groupName) {
      qb.andWhere('o.groupName = :groupName', { groupName });
    }

    /* ================== SEARCH ================== */
    if (search) {
      qb.andWhere(
        `(o.name LIKE :q 
        OR o.surname LIKE :q 
        OR o.email LIKE :q 
        OR o.phone LIKE :q)`,
        { q: `%${search}%` },
      );
    }

    /* ================== FINAL QUERY ================== */
    qb.orderBy(`o.${sortColumn}`, sortDirection).skip(skip).take(take);

    /* ================== ЛОГИ (2) SQL ================== */
    console.log('SQL:', qb.getSql());
    console.log('PARAMS:', qb.getParameters());

    const [data, total] = await qb.getManyAndCount();

    console.log('RESULT:', data.length, 'of', total);
    console.log('=== findMyOrdersPaginated END ===');

    return {
      data,
      meta: {
        total,
        page,
        take,
        pages: Math.ceil(total / take),
      },
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

    order.manager = managerName;

    if (!order.status || order.status === 'New') {
      order.status = 'In Work';
    }
    await this.orderRepository.save(order);
    return order;
  }
}
