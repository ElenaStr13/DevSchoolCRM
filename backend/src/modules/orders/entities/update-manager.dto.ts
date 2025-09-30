import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateManagerDto {
  @ApiProperty({ example: 'Shevchenko', description: 'Прізвище менеджера' })
  @IsString()
  manager: string;
}
