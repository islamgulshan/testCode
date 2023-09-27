import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from './job.entity';
import { JobService } from './job.service';
import { JobController } from './job.controller';
import { LoggerModule } from '../../utils/logger/logger.module';
import { User } from './../user/user.entity';
import { Role } from '../seed/role.entity';
import { RolePermission } from '..//user/role_permission.entity';

@Module({
  controllers: [JobController],
  imports: [
    TypeOrmModule.forFeature([Job, User, Role, RolePermission]),
    LoggerModule,
  ],
  exports: [JobService],
  providers: [JobService],
})
export class JobModule {
}
