import { SelectQueryBuilder } from 'typeorm';
import { OrdersEntity } from '../entities/orders.entity';
import { PaginationQueryDto } from '../entities/pagination.dto';

export class OrdersFilterBuilder {
  static apply(
    qb: SelectQueryBuilder<OrdersEntity>,
    query: PaginationQueryDto,
  ) {
    if (query.name) {
      qb.andWhere('o.name ILIKE :name', {
        name: `%${query.name.trim()}%`,
      });
    }

    if (query.email) {
      qb.andWhere('o.email ILIKE :email', {
        email: `%${query.email.trim()}%`,
      });
    }

    if (query.status) {
      qb.andWhere('o.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        `
        o.name ILIKE :q OR
        o.surname ILIKE :q OR
        o.email ILIKE :q OR
        o.phone ILIKE :q
        `,
        { q: `%${query.search.trim()}%` },
      );
    }
  }
}
