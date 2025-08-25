import { Exclude } from 'class-transformer';
import { UserEntity } from '../entities/user.entity';

export class UserResponseDto {
  id: number;
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  role: string;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
