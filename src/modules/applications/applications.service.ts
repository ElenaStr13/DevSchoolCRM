import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}
  // Метод для отримання всіх заявок (без пагінації)
  async findAll(): Promise<Application[]> {
    return this.applicationRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  // Метод з пагінацією
  async findPaginated(page = 1, take = 25) {
    const skip = (page - 1) * take;

    const [data, total] = await this.applicationRepository.findAndCount({
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
