import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroupEntity } from '../../group/entities/group.entity';
import { UserEntity } from '../../auth/entities/user.entity';

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
  groupName: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: true })
  manager: string;

  @Column('json', { nullable: true })
  comments?: { author: string; text: string; createdAt: string }[];

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'text', nullable: true })
  utm?: string;

  @ManyToOne(() => GroupEntity, (group) => group.orders, {
    eager: true, // автоматично підтягує group при запиті order
    nullable: true,
  })
  @JoinColumn({ name: 'groupId' })
  group?: GroupEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  managerUser?: UserEntity;
}
