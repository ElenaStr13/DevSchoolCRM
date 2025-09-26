import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  Patch,
  Body,
  Req,
  Put,
} from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateOrderDto } from './entities/update.order.dto';
import { PaginationQueryDto } from './entities/pagination.dto';
import { UpdateStatusDto } from './entities/update-status.dto';
import { UpdateManagerDto } from './entities/update-manager.dto';
import { AddCommentDto } from './entities/create.comment.dto';
import { AuthRequest } from '../auth/interfaces/auth.request';
import { AssignGroupDto } from '../group/dto/assign.group.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard) //Користувач відправляє запит з токеном
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Roles('admin')
  async findPaginated(@Query() query: PaginationQueryDto) {
    //async findPaginated(@Query('page') page = 1) {
    return this.ordersService.findPaginated(query);
  }

  @Get('my')
  @Roles('manager')
  async findMyOrders(
    @Req() req: AuthRequest,
    @Query() query: PaginationQueryDto,
  ) {
    const { user } = req;
    return this.ordersService.findMyOrdersPaginated(user.name, query);
  }

  @Put('assign-group')
  @Roles('admin')
  async assignGroup(@Body() dto: AssignGroupDto) {
    return this.ordersService.assignGroup(dto.orderId, dto.groupId);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  async findOne(@Param('id') id: number) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateOrderDto,
    @Req() req: AuthRequest,
  ) {
    const { user } = req;
    return this.ordersService.update(id, dto, user.role, user.name);
  }

  @Patch(':id/status')
  @Roles('admin', 'manager')
  async updateStatus(@Param('id') id: number, @Body() dto: UpdateStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }

  @Patch(':id/manager')
  @Roles('admin')
  async assignManager(@Param('id') id: number, @Body() dto: UpdateManagerDto) {
    return this.ordersService.assignManager(id, dto.manager);
  }

  @Patch(':id/comment')
  @Roles('admin', 'manager')
  async addComment(
    @Param('id') id: number,
    @Body() dto: AddCommentDto,
    @Req() req: AuthRequest, // тут беремо поточного користувача
  ) {
    const { user } = req; // наприклад user.name або user.username
    const isAdmin = user.role === 'admin';
    return this.ordersService.addComment(id, user.name, dto.text, isAdmin);
  }
}
