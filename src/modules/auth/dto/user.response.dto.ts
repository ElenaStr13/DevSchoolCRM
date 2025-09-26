import { Exclude } from 'class-transformer';
import { UserEntity } from '../entities/user.entity';
import { Column } from 'typeorm';

export class UserResponseDto {
  id: number;
  email: string;

  @Exclude()
  password: string;

  @Column()
  name: string;

  @Exclude()
  role: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
