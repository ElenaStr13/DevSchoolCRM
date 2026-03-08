import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateManagerDto {
  @ApiProperty({ example: 'Shevchenko', description: 'Прізвище менеджера' })
  @IsString()
  manager?: string;

  @Type(() => Number)
  @IsNumber()
  managerId: number;
}
