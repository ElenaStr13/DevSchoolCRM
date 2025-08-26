import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrdersEntity } from './entities/orders.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from './entities/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrdersEntity)
    private readonly orderRepository: Repository<OrdersEntity>,
  ) {}
  // Метод для отримання всіх заявок (без пагінації)
  async findAll(): Promise<OrdersEntity[]> {
    return this.orderRepository.find({
      select: [
        // Додали select для полів з пункту 4 ТЗ
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
        'created_at',
      ],
      order: { created_at: 'DESC' },
    });
  }

  // Метод з пагінацією
  async findPaginated(query: PaginationQueryDto) {
    const {
      page = 1,
      take = 25,
      sortBy = 'created_at',
      order = 'DESC',
    } = query;
    const skip = (page - 1) * take;
    const [data, total] = await this.orderRepository.findAndCount({
      select: [
        // Додали select для полів з пункту 4 ТЗ
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
        'created_at',
      ],
      //{ created_at: 'DESC' },
      order: { [sortBy]: order },
      skip,
      take,
    });

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

  async update(id: number, dto: Partial<OrdersEntity>) {
    await this.orderRepository.update(id, dto);
    return this.findOne(id);
  }
}
