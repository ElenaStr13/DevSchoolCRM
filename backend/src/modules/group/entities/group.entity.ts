import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
} from 'typeorm';
import { OrdersEntity } from '../../orders/entities/orders.entity';

@Entity('groups')
@Unique(['name']) // назва групи має бути унікальною
export class GroupEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => OrdersEntity, (order) => order.group)
  orders: OrdersEntity[];
}
