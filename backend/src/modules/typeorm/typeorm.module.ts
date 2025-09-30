import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from '../auth/entities/user.entity';
import { TokenEntity } from '../auth/entities/token.entity';
import configuration from '../../configs/configuration';
import { DatabaseConfig } from '../../configs/config.type';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.get<DatabaseConfig>('database');
        return {
          type: db?.type || 'mysql',
          host: db?.host,
          port: db?.port,
          username: db?.user,
          password: db?.password,
          database: db?.name,
          entities: [UserEntity, TokenEntity],
          synchronize: false,
          autoLoadEntities: true,
        };
      },
    }),
  ],
})
export class TypeormModule {}
