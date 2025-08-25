import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  surname: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  course: string;

  @ApiProperty()
  course_format: string;

  @ApiProperty()
  course_type: string;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty()
  sum: number;

  @ApiProperty()
  alreadyPaid: number;
}
