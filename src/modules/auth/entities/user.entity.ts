import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Token } from './token.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 'manager' })
  role: 'admin' | 'manager';

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];
}
