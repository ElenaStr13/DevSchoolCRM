import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: number;
  email: string;
  role: string;

  @Exclude()
  password: string;
}
