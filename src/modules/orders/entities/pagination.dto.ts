import { IsInt, IsOptional, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    type: Number,
    example: 1,
    description: 'Номер сторінки',
  })
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({
    type: Number,
    example: 25,
    description: 'Кількість записів на сторінку',
  })
  take = 25;

  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    example: 'created_at',
    description: 'Поле для сортування',
  })
  sortBy: string = 'created_at';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  @ApiPropertyOptional({
    enum: ['ASC', 'DESC'],
    example: 'DESC',
    description: 'Напрямок сортування',
  })
  order: 'ASC' | 'DESC' = 'DESC';
}
