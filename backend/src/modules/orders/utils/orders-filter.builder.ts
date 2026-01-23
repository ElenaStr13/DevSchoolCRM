import { SelectQueryBuilder } from 'typeorm';
import { OrdersEntity } from '../entities/orders.entity';
import { PaginationQueryDto } from '../entities/pagination.dto';

export class OrdersFilterBuilder {
  static apply(
    qb: SelectQueryBuilder<OrdersEntity>,
    query: PaginationQueryDto,
  ) {
    console.log('OrdersFilterBuilder - input query:', query);
    const textFields = [
      'surname',
      'email',
      'phone',
      'manager',
      'groupName',
    ] as const;

    if (query.name?.trim()) {
      const value = query.name.trim();
      console.log('Applying name filter:', value);
      qb.andWhere('LOWER(o.name) LIKE :name', {
        name: `%${value.toLowerCase()}%`,
      });
    }

    textFields.forEach((field) => {
      const raw = query[field];
      if (raw === undefined || raw === null) return;

      const value = String(raw).trim();
      if (!value) return;

      const paramValue = `%${value.toLowerCase()}%`;

      // Для MySQL використовуємо LOWER()
      if (field === 'groupName') {
        qb.andWhere('LOWER(group.name) LIKE :gn', { gn: paramValue });
      } else if (field === 'manager') {
        qb.andWhere('LOWER(o.manager) LIKE :mgr', { mgr: paramValue });
      } else if (field === 'phone') {
        qb.andWhere('o.phone LIKE :ph', { ph: `%${value}%` }); // телефон без LOWER
      } else {
        qb.andWhere(`LOWER(o.${field}) LIKE :${field}`, {
          [field]: paramValue,
        });
      }
    });

    const exactFields = [
      'course',
      'course_format',
      'course_type',
      'status',
    ] as const;
    exactFields.forEach((field) => {
      const value = query[field]?.toString()?.trim();
      if (value) {
        qb.andWhere(`o.${field} = :${field}`, { [field]: value });
      }
    });

    if (query.age && !isNaN(Number(query.age))) {
      qb.andWhere('o.age = :age', { age: Number(query.age) });
    }

    if (query.search?.trim()) {
      const q = `%${query.search.trim().toLowerCase()}%`;
      qb.andWhere(
        'LOWER(o.name) LIKE :q OR LOWER(o.surname) LIKE :q OR LOWER(o.email) LIKE :q OR o.phone LIKE :q',
        { q },
      );
    }
    console.log(
      'OrdersFilterBuilder - applied filters count:',
      qb.expressionMap.wheres?.length || 0,
    );
  }
}
