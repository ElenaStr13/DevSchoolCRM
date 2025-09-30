import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  ManyToMany,
} from 'typeorm';
import { OrdersEntity } from '../../orders/entities/orders.entity';

@Entity('groups')
@Unique(['name']) // назва групи має бути унікальною
export class GroupEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => OrdersEntity, (order) => order.groups)
  orders: OrdersEntity[];
}
