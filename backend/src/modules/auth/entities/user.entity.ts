import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { TokenEntity } from './token.entity';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column()
  name: string;

  @Column({ nullable: true })
  surname?: string;

  @Column({ type: 'enum', enum: ['admin', 'manager'], default: 'manager' })
  role: 'admin' | 'manager';

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @OneToMany(() => TokenEntity, (token) => token.user)
  tokens: TokenEntity[];

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
  }

  @BeforeInsert()
  async hashPassword() {
    if (!this.password) return;
    this.password = await bcrypt.hash(this.password, 10);
  }
}
