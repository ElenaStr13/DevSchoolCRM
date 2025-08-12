import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { Roles } from '../../decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(
    @InjectRepository(Application)
    private readonly repo: Repository<Application>,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async getApps(@Query('page') page = 1) {
    const take = 25;
    const skip = (page - 1) * take;

    const [data, total] = await this.repo.findAndCount({
      order: { created_at: 'DESC' },
      skip,
      take,
    });

    return {
      data,
      meta: {
        total,
        page,
        pages: Math.ceil(total / take),
      },
    };
  }
}
