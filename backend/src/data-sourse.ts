import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from './modules/auth/entities/user.entity';
import { TokenEntity } from './modules/auth/entities/token.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'owu.linkpc.net',
  port: 3306,
  username: 'crmapplications',
  password: 'ElenaStr',
  database: 'crmapplications',
  entities: [UserEntity, TokenEntity],
  synchronize: true,
  logging: false,
});
