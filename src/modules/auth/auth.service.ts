import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async onModuleInit() {
    const user = await this.userRepo.findOne({
      where: { email: 'admin@gmail.com' },
    });
    if (!user) {
      const hashed = await bcrypt.hash('admin', 10);
      await this.userRepo.save({
        email: 'admin@gmail.com',
        password: hashed,
        role: 'admin',
      });
    }
  }
}
