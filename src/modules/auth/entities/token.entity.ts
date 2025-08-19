import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 1000 })
  token: string;

  @Column({
    type: 'enum',
    enum: TokenType,
  })
  type: TokenType;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isBlocked: boolean;

  @Column()
  jti: string;

  @ManyToOne(() => User, (user) => user.tokens)
  user: User;
}
