import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from './modules/auth/entities/user.entity';
import { TokenEntity } from './modules/auth/entities/token.entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'owu.linkpc.net', // твій хост хмарної БД
  port: 3306, // порт MySQL
  username: 'crmapplications', // твій логін
  password: 'ElenaStr', // твій пароль
  database: 'crmapplications', // назва БД
  entities: [UserEntity, TokenEntity], // всі entity, які використовуєш
  synchronize: true, // true — автоматично створює таблиці (для деву)
  logging: false,
});
