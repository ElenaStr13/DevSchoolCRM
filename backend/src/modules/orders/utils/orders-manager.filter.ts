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
    if (user.role === 'admin') {
      if (managerId) {
        qb.andWhere('manager.id = :managerId', { managerId });
      } else if (onlyMy) {
        qb.andWhere('manager.id = :myId', { myId: user.id });
      }
      return;
    }
  }
}
