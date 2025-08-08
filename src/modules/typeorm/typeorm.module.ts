import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from '../configs/configuration';

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
          entities: [ClinicEntity, DoctorEntity, ServiceEntity],
          synchronize: true,
          autoLoadEntities: true,
        };
      },
    }),
  ],
})
export class TypeormModule {}
