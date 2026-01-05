import { SelectQueryBuilder } from 'typeorm';
import { OrdersEntity } from '../entities/orders.entity';
import { AuthUser } from '../../auth/interfaces/auth-user.interface';

export class OrdersManagerFilter {
  static apply(
    qb: SelectQueryBuilder<OrdersEntity>,
    user: AuthUser,
    managerId?: number,
    onlyMy?: boolean,
  ) {
    // Адмін → фільтр по менеджеру
    if (user.role === 'admin' && managerId) {
      qb.andWhere('manager.id = :managerId', { managerId });
      return;
    }

    //OnlyMy — для будь-якої ролі
    if (onlyMy === true) {
      qb.andWhere('manager.id = :myId', { myId: user.id });
    }
  }
}
