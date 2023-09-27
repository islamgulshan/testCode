import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../../utils/logger/logger.module';
import { Teams } from './teams.entity';
import { RolePermission } from '../user/role_permission.entity';
import { Role } from '../seed/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Teams, Role, RolePermission]),
    LoggerModule,
  ],
  controllers: [TeamsController],
  providers: [TeamsService],
})
export class TeamsModule {
}
