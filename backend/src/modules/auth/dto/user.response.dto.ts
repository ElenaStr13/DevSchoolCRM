import { Exclude, Expose } from 'class-transformer';
import { UserEntity } from '../entities/user.entity';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  surname?: string;

  @Expose()
  role: string;

  @Expose()
  get fullName(): string {
    return `${this.name} ${this.surname}`.trim();
  }

  constructor(user: UserEntity) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.surname = user.surname;
    this.role = user.role;
  }
}
