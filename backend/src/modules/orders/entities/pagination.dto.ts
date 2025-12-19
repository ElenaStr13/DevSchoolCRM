import {
  IsInt,
  IsOptional,
  Min,
  Max,
  IsIn,
  IsBooleanString,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  //PaginationQueryDto описує page, take, sortBy, order
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

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @Type(() => Number)
  age?: number;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsString()
  course_format?: string;

  @IsOptional()
  @IsString()
  course_type?: string;

  @IsOptional()
  @ApiPropertyOptional({
    type: 'string',
    default: 'new',
    description: 'Фільтр по статусу',
  })
  status?: string;

  @IsOptional()
  @ApiPropertyOptional({
    type: String,
    description: 'Пошук по name/surname/email/phone',
  })
  search?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Фільтр по менеджеру',
    example: 'manager1@gmail.com',
  })
  manager?: string;

  @IsOptional()
  groupName?: string;

  @IsOptional()
  @IsBooleanString()
  @ApiPropertyOptional({
    type: Boolean,
    description: 'Показувати лише мої заявки (manager)',
    example: true,
  })
  onlyMy?: string;
}
