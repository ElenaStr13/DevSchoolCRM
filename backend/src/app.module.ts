import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ConfigModule } from '@nestjs/config';
import { TypeormModule } from './modules/typeorm/typeorm.module';
import { GroupModule } from './modules/group/group.module';
import { ManagersModule } from './modules/managers/managers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeormModule,
    AuthModule,
    OrdersModule,
    GroupModule,
    ManagersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
