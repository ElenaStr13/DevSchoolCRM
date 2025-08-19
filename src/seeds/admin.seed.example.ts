import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/auth/entities/user.entity';
import { Token } from '../modules/auth/entities/token.entity';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'owu.linkpc.net',
  port: 3306,
  username: 'crmaplications',
  password: 'ElenaStr',
  database: 'crmaplications',
  entities: [User, Token],
});

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  const hashedPassword = await bcrypt.hash('admin', 10);

  const admin = userRepo.create({
    email: 'admin@gmail.com',
    password: hashedPassword,
    role: 'admin',
  });

  await userRepo.save(admin);
  console.log('✅ Admin created');
  await AppDataSource.destroy();
}

seed();
