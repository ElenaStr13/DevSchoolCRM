import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'FE-2025', description: 'Назва групи' })
  @IsString()
  @MinLength(2, { message: 'Назва групи занадто коротка' })
  name: string;
}
