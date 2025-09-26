import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  CourseEnum,
  CourseFormatEnum,
  CourseTypeEnum,
  StatusEnum,
} from '../enums';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @MinLength(2, { message: 'Ім’я занадто коротке' })
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(2, { message: 'Прізвище занадто коротке' })
  surname: string;

  @ApiProperty()
  @IsString()
  @IsEmail({}, { message: 'Невірний формат email' })
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(7, { message: 'Номер телефону занадто короткий' })
  phone: string;

  @ApiProperty()
  @IsNumber()
  age: number;

  @ApiPropertyOptional({ enum: CourseEnum })
  @IsOptional()
  @IsEnum(CourseEnum)
  course: CourseEnum;

  @ApiPropertyOptional({ enum: CourseFormatEnum })
  @IsOptional()
  @IsEnum(CourseFormatEnum)
  course_format?: CourseFormatEnum;

  @ApiPropertyOptional({ enum: CourseTypeEnum })
  @IsOptional()
  @IsEnum(CourseTypeEnum)
  course_type?: CourseTypeEnum;

  @ApiPropertyOptional({ enum: StatusEnum })
  @IsOptional()
  @IsEnum(StatusEnum)
  status?: StatusEnum;

  @ApiProperty()
  @IsNumber()
  sum: number;

  @ApiProperty()
  @IsNumber()
  alreadyPaid: number;

  @ApiProperty()
  @IsString()
  group?: string;
}
