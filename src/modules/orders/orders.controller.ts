import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  Delete,
  Patch,
  Post,
  Body,
} from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UpdateOrderDto } from './entities/update.order.dto';
import { CreateOrderDto } from './entities/create.order.dto';
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

  // GET /orders/:id
  @Get(':id')
  @Roles('admin', 'manager')
  async findOne(@Param('id') id: number) {
    return this.ordersService.findOne(id);
  }

  // POST /orders
  @Post()
  @Roles('admin', 'manager')
  @ApiBody({ type: CreateOrderDto })
  async create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  // PATCH /orders/:id
  @Patch(':id')
  @Roles('admin', 'manager')
  async update(@Param('id') id: number, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  // DELETE /orders/:id
  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id') id: number) {
    return this.ordersService.remove(id);
  }
}
