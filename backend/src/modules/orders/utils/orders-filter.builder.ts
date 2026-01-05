import { SelectQueryBuilder } from 'typeorm';
import { OrdersEntity } from '../entities/orders.entity';
import { PaginationQueryDto } from '../entities/pagination.dto';

export class OrdersFilterBuilder {
  static apply(
    qb: SelectQueryBuilder<OrdersEntity>,
    query: PaginationQueryDto,
  ) {
    if (query.name?.trim()) {
      qb.andWhere('LOWER(o.name) LIKE :name', {
        name: `%${query.name.trim().toLowerCase()}%`,
      });
    }

    if (query.surname?.trim()) {
      qb.andWhere('LOWER(o.surname) LIKE :surname', {
        surname: `%${query.surname.trim().toLowerCase()}%`,
      });
    }

    if (query.email?.trim()) {
      qb.andWhere('LOWER(o.email) LIKE :email', {
        email: `%${query.email.trim().toLowerCase()}%`,
      });
    }

    if (query.phone?.trim()) {
      qb.andWhere('o.phone LIKE :phone', {
        phone: `%${query.phone.trim()}%`,
      });
    }

    if (query.age && Number(query.age) > 0) {
      qb.andWhere('o.age = :age', { age: Number(query.age) });
    }

    if (query.course?.trim()) {
      qb.andWhere('o.course = :course', {
        course: query.course.trim(),
      });
    }

    if (query.course_format?.trim()) {
      qb.andWhere('o.course_format = :course_format', {
        course_format: query.course_format.trim(),
      });
    }

    if (query.course_type?.trim()) {
      qb.andWhere('o.course_type = :course_type', {
        course_type: query.course_type.trim(),
      });
    }

    if (query.groupName?.trim()) {
      qb.andWhere('LOWER(group.name) LIKE :groupName', {
        groupName: `%${query.groupName.trim().toLowerCase()}%`,
      });
    }

    if (query.status) {
      qb.andWhere('o.status = :status', { status: query.status });
    }

    if (query.search?.trim()) {
      const q = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        `(LOWER(o.name) LIKE :q OR LOWER(o.surname) LIKE :q OR LOWER(o.email) LIKE :q OR o.phone LIKE :q)`,
        { q },
      );
    }
  }
}
