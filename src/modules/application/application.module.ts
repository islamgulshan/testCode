import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../../utils/logger/logger.module';
import { Application } from './application.entity';
import { JobModule } from '../../modules/job/job.module';
import { UserModule } from '../../modules/user/user.module';
import { Role } from '../seed/role.entity';
import { RolePermission } from '..//user/role_permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Role, RolePermission]),
    LoggerModule,
    JobModule,
    UserModule,
  ],
  controllers: [ApplicationController],
  providers: [ApplicationService],
})
export class ApplicationModule {
}
