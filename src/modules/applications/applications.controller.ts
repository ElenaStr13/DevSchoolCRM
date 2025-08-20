import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ApplicationsService } from './applications.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard) //Користувач відправляє запит з токеном
  @Roles('admin', 'manager')
  async getAll(@Query('page') page = 1) {
    return this.applicationsService.findPaginated(Number(page));
  }
}
