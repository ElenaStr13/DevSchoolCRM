import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TokenEntity } from './token.entity';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 'manager' })
  role: 'admin' | 'manager';

  @OneToMany(() => TokenEntity, (token) => token.user)
  tokens: TokenEntity[];

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
