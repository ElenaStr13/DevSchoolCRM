import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AssignGroupDto {
  @ApiProperty({ example: 1, description: 'ID заявки (Order)' })
  @IsNumber()
  orderId: number;

  @ApiProperty({ example: 2, description: 'ID групи (Group)' })
  @IsNumber()
  groupId: number;
}
