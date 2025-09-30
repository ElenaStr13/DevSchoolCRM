import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AddCommentDto {
  @ApiProperty({
    description: 'Текст коментаря',
    example: 'Це коментар по заявці',
  })
  @IsString()
  @MinLength(1, { message: 'Коментар не може бути порожнім' })
  text: string;
}
