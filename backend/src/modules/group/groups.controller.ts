import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create.group.dto';
import { GroupEntity } from './entities/group.entity';
import { Roles } from '../../decorators/roles.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateGroupDto): Promise<GroupEntity> {
    return this.groupsService.create(dto);
  }

  @Get()
  findAll(): Promise<GroupEntity[]> {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<GroupEntity> {
    return this.groupsService.findOne(+id);
  }

  @Put(':id')
  @Roles('admin')
  update(
    @Param('id') id: number,
    @Body() dto: CreateGroupDto,
  ): Promise<GroupEntity> {
    return this.groupsService.update(+id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: number): Promise<void> {
    return this.groupsService.remove(+id);
  }
}
