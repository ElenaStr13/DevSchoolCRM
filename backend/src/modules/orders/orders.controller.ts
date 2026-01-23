import {
  Controller,
  Get,
  UseGuards,
  Query,
  Param,
  Patch,
  Post,
  Body,
  Req,
  Put,
  Res,
} from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateOrderDto } from './entities/update.order.dto';
import { PaginationQueryDto } from './entities/pagination.dto';
import { UpdateStatusDto } from './entities/update-status.dto';
import { AddCommentDto } from './entities/create.comment.dto';
import { AuthRequest } from '../auth/interfaces/auth.request';
import { AssignGroupDto } from '../group/dto/assign.group.dto';
import { Response } from 'express';
import { UpdateManagerDto } from './entities/update-manager.dto';
import { AuthUser } from '../auth/interfaces/auth-user.interface';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard) //Користувач відправляє запит з токеном
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles('admin', 'manager')
  @Get()
  async findPaginated(
    @Query() query: PaginationQueryDto,
    @Req() req: AuthRequest,
  ) {
    return this.ordersService.findPaginated(query, req.user as AuthUser);
  }

  @Get('statistics')
  @Roles('admin')
  async getStatistics() {
    return this.ordersService.getStatistics();
  }

  @Get('users')
  @Roles('admin')
  async getUsersByRole(@Query('role') role: string) {
    return this.ordersService.findByRole(role);
  }

  @Post('export')
  async exportExcel(
    // @Body() filters: Record<string, any>,
    @Res() res: Response,
  ) {
    const buffer = await this.ordersService.generateExcel();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="orders.xlsx"',
    });

    res.send(buffer);
  }

  @Get('my')
  @Roles('manager')
  async findMyOrders(
    @Req() req: AuthRequest,
    @Query() query: PaginationQueryDto,
  ) {
    console.log('HIT /orders/my');
    return this.ordersService.findMyOrdersPaginated(
      req.user as AuthUser,
      query,
    );
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

  @Patch(':id/manager')
  @Roles('admin')
  async assignManager(@Param('id') id: number, @Body() dto: UpdateManagerDto) {
    return this.ordersService.assignManager(id, dto.manager);
  }

  @Post(':id/comments')
  @Roles('admin', 'manager')
  async addCommentPost(
    @Param('id') id: number,
    @Body() dto: AddCommentDto,
    @Req() req: AuthRequest,
  ) {
    const { user } = req;
    const isAdmin = user.role === 'admin';
    return this.ordersService.addComment(id, user.name, dto.text, isAdmin);
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
