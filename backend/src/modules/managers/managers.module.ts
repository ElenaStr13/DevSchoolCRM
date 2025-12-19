import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManagersService } from './managers.service';
import { ManagersController } from './managers.controller';
import { UserEntity } from '../auth/entities/user.entity';
import { OrdersEntity } from '../orders/entities/orders.entity';
import { TokenEntity } from '../auth/entities/token.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, OrdersEntity, TokenEntity]),
    forwardRef(() => AuthModule),
  ],
  providers: [ManagersService],
  controllers: [ManagersController],
  exports: [ManagersService],
})
export class ManagersModule {}
