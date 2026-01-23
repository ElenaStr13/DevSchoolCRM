import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TokenEntity } from './token.entity';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Exclude({ toPlainOnly: true })
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
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
    console.log('VALIDATE PASSWORD DEBUG:');
    console.log('  Введений:', password);
    console.log('  Хеш у БД:', this.password);
    console.log('  Тип хешу:', typeof this.password);
    if (!this.password) {
      return false;
    }
    return await bcrypt.compare(password, this.password);
  }
}
