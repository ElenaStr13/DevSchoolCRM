import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupDto } from './dto/create.group.dto';
import { GroupEntity } from './entities/group.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
  ) {}

  async create(dto: CreateGroupDto): Promise<GroupEntity> {
    const exists = await this.groupRepository.findOne({
      where: { name: dto.name },
    });
    if (exists) {
      throw new ConflictException(`Група "${dto.name}" вже існує`);
    }
    const group = this.groupRepository.create(dto);
    return this.groupRepository.save(group);
  }

  async findAll(): Promise<GroupEntity[]> {
    return this.groupRepository.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number): Promise<GroupEntity> {
    const group = await this.groupRepository.findOneBy({ id });
    if (!group) throw new NotFoundException(`Група з id=${id} не знайдена`);
    return group;
  }

  async update(id: number, dto: CreateGroupDto): Promise<GroupEntity> {
    const group = await this.findOne(id);
    group.name = dto.name;
    return this.groupRepository.save(group);
  }

  async remove(id: number): Promise<void> {
    const group = await this.findOne(id);
    await this.groupRepository.remove(group);
  }
}
