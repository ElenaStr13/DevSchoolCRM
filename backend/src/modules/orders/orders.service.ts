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
  async findPaginated(query: PaginationQueryDto) {
    const {
      page = 1,
      take = 25,
      sortBy = 'created_at',
      order = 'DESC',
      status,
      search,
      manager,
    } = query;

    const skip = (page - 1) * take;
    const sortColumn = OrdersService.SORTABLE_COLUMNS.includes(sortBy as any)
      ? sortBy
      : 'created_at';
    const sortDirection: 'ASC' | 'DESC' = order === 'ASC' ? 'ASC' : 'DESC';

    const qb = this.orderRepository
      .createQueryBuilder('o')
      .select(OrdersService.SORTABLE_COLUMNS.map((col) => `o.${col}`));

    if (status) {
      qb.andWhere('o.status = :status', { status });
    }

    if (manager) {
      qb.andWhere('o.manager = :manager', { manager });
    }

    if (search) {
      qb.andWhere(
        '(o.name LIKE :q OR o.surname LIKE :q OR o.email LIKE :q OR o.phone LIKE :q)',
        { q: `%${search}%` },
      );
    }

    qb.orderBy(`o.${sortColumn}`, sortDirection).skip(skip).take(take);

    const [data, total] = await qb.getManyAndCount();

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

  async findOne(id: number) {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async update(
    id: number,
    dto: Partial<OrdersEntity>,
    userRole: 'admin' | 'manager',
    userName: string,
  ) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['groups'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id=${id} not found`);
    }

    if (userRole === 'manager' && order.manager && order.manager !== userName) {
      throw new ForbiddenException(`You cannot edit this order`);
    }

    if (dto.groupName) {
      let group = await this.groupRepository.findOne({
        where: { name: dto.groupName },
      });

      if (!group) {
        group = this.groupRepository.create({ name: dto.groupName });
        await this.groupRepository.save(group);
      }

      order.groupName = group.name;
      order.groups = [group];
    }

    Object.assign(order, dto);
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

  async assignManager(id: number, managerName: string) {
    const order = await this.orderRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    order.manager = managerName;

    if (!order.status || order.status === 'New') {
      order.status = 'In Work';
    }

    return this.orderRepository.save(order);
  }

  async addComment(
    orderId: number,
    author: string,
    text: string,
    isAdmin = false,
  ) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order)
      throw new NotFoundException(`Order with id ${orderId} not found`);

    if (!isAdmin) {
      if (order.manager && order.manager !== author) {
        throw new NotFoundException(`You cannot comment on this order`);
      }
    }

    const newComment = { author, text, createdAt: new Date() };
    order.comments = order.comments
      ? [...order.comments, newComment]
      : [newComment];

    return this.orderRepository.save(order);
  }

  async assignGroup(orderId: number, groupId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['groups'],
    });

    if (!order) {
      throw new NotFoundException(`Order with id=${orderId} not found`);
    }

    const group = await this.groupRepository.findOneBy({ id: groupId });
    if (!group) {
      throw new NotFoundException(`Group with id=${groupId} not found`);
    }

    if (!order.groups) order.groups = [];
    if (!order.groups.find((g) => g.id === group.id)) {
      order.groups.push(group);
    }
    return this.orderRepository.save(order);
  }

  async findMyOrdersPaginated(managerName: string, query: PaginationQueryDto) {
    console.log('Manager name:', managerName);
    const {
      page = 1,
      take = 25,
      sortBy = 'created_at',
      order = 'DESC',
      status,
      search,
    } = query;

    const skip = (page - 1) * take;

    // Використовуємо винесену константу
    const sortColumn = OrdersService.SORTABLE_COLUMNS.includes(sortBy as any)
      ? sortBy
      : 'created_at';

    const sortDirection: 'ASC' | 'DESC' = order === 'ASC' ? 'ASC' : 'DESC';

    const qb = this.orderRepository
      .createQueryBuilder('o')
      .select(OrdersService.SORTABLE_COLUMNS.map((col) => `o.${col}`))
      .where('o.manager = :manager', { manager: managerName });

    if (status) {
      qb.andWhere('o.status = :status', { status });
    }

    if (search) {
      qb.andWhere(
        '(o.name LIKE :q OR o.surname LIKE :q OR o.email LIKE :q OR o.phone LIKE :q)',
        { q: `%${search}%` },
      );
    }

    qb.orderBy(`o.${sortColumn}`, sortDirection).skip(skip).take(take);

    const [data, total] = await qb.getManyAndCount();

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
}
