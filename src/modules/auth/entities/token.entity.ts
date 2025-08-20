import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

@Entity()
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column()
  accessTokenExpiresAt: Date;

  @Column()
  refreshTokenExpiresAt: Date;

  @Column({ default: false })
  isBlocked: boolean;

  @Column()
  jti: string;

  @ManyToOne(() => UserEntity, (user) => user.tokens)
  user: UserEntity;
}
