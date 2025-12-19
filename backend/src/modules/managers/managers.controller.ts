import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ManagersService } from './managers.service';
import { PaginationDto } from './dto/pagination.dto';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('managers')
@UseGuards(JwtAuthGuard, RolesGuard) //Користувач відправляє запит з токеном
@ApiBearerAuth()
export class ManagersController {
  constructor(private readonly managersService: ManagersService) {}

  @Get('list')
  @Roles('admin')
  getAllManagers() {
    console.log(' GET /managers/all called');
    return this.managersService.findAllManagers();
  }

  @Get('paginated')
  @Roles('admin')
  getManagers(@Query() query: PaginationDto) {
    return this.managersService.findManagersPaginated(query.page, query.take);
  }

  @Get('statistics/:id')
  @Roles('admin')
  getStatistics(@Param('id') id: number) {
    return this.managersService.getManagerStatistics(Number(id));
  }

  @Post('recovery-password/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  async recoveryPassword(@Param('userId') userId: number) {
    return this.managersService.generateRecoveryPasswordLink(userId);
  }

  @Patch(':id/activate')
  @Roles('admin')
  activateManager(@Param('id') id: number) {
    return this.managersService.activateManager(Number(id));
  }

  @Post(':id/ban')
  @Roles('admin')
  banManager(@Param('id') id: number) {
    return this.managersService.banManager(Number(id));
  }

  @Post(':id/unban')
  @Roles('admin')
  unbanManager(@Param('id') id: number) {
    return this.managersService.unbanManager(Number(id));
  }
}
