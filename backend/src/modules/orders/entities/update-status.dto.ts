import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @ApiProperty({
    enum: ['new', 'in_progress', 'done', 'rejected'],
    example: 'done',
    description: 'Новий статус заявки',
  })
  @IsIn(['new', 'in_progress', 'done', 'rejected'])
  status: string;
}
