import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { UserEntity } from '../modules/auth/entities/user.entity';
import { TokenEntity } from '../modules/auth/entities/token.entity';
import { OrdersEntity } from '../modules/orders/entities/orders.entity';
import { GroupEntity } from '../modules/group/entities/group.entity';
import { config } from 'dotenv';

ConfigModule.forRoot({
  load: [configuration],
  isGlobal: true,
});

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  entities: [UserEntity, TokenEntity, OrdersEntity, GroupEntity],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false, // ! при міграціях треба вимикати
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
