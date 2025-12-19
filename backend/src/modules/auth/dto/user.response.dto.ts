import { Exclude, Expose } from 'class-transformer';
import { UserEntity } from '../entities/user.entity';
import { Column } from 'typeorm';

export class UserResponseDto {
  id: number;
  email: string;

  @Exclude()
  password: string;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Expose()
  role: string;

  @Expose()
  get fullName(): string {
    return `${this.name} ${this.surname}`.trim();
  }

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
