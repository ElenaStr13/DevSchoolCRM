import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  Patch,
  Body,
} from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateOrderDto } from './entities/update.order.dto';
import { PaginationQueryDto } from './entities/pagination.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard) //Користувач відправляє запит з токеном
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles('admin', 'manager')
  async findPaginated(@Query() query: PaginationQueryDto) {
    //async findPaginated(@Query('page') page = 1) {
    return this.ordersService.findPaginated(query);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  async findOne(@Param('id') id: number) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(@Param('id') id: number, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }
}
