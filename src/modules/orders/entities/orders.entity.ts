import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { GroupEntity } from '../../group/entities/group.entity';

@Entity('orders')
export class OrdersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  age: number;

  @Column()
  course: string;

  @Column()
  course_format: string;

  @Column()
  course_type: string;

  @Column({ nullable: true })
  status: string;

  @Column()
  sum: number;

  @Column()
  alreadyPaid: number;

  @Column({ nullable: true, name: 'student_group' })
  group: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: true })
  manager: string;

  @Column('json', { nullable: true })
  comments?: { author: string; text: string; createdAt: Date }[];

  @ManyToMany(() => GroupEntity, (group) => group.orders, { eager: true })
  @JoinTable({
    name: 'assign_group', // назва проміжної таблиці
    joinColumn: { name: 'orderId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'groupId', referencedColumnName: 'id' },
  })
  groups: GroupEntity[];
}
