import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './user.service';
import { Role } from './../seed/role.entity';
import { Permission } from './../seed/permission.entity';
import { Staff } from './staff.entity';
import { RolePermission } from './role_permission.entity';
import { UserController } from './user.controller';
import { LoggerModule } from '../../utils/logger/logger.module';
import { MailModule } from '../../utils/mailer/mail.module';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Staff, Permission, RolePermission]),
    LoggerModule,
    MailModule,
  ],
  controllers: [UserController],
  exports: [UsersService],
  providers: [UsersService, PermissionsGuard],
})
export class UserModule {
}
