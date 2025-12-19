import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import {
  CourseEnum,
  CourseFormatEnum,
  CourseTypeEnum,
  StatusEnum,
} from '../enums';

export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  surname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(16)
  age?: number;

  @ApiPropertyOptional({ enum: CourseEnum })
  @IsOptional()
  @IsEnum(CourseEnum)
  course?: CourseEnum;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sum?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  alreadyPaid?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  groupId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  groupName?: string;
}
