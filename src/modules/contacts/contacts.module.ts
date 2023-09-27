import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../../utils/logger/logger.module';
import { Contacts } from './contacts.entity';
import { MailModule } from '../../utils/mailer/mail.module';
import { Role } from '../seed/role.entity';
import { RolePermission } from '../user/role_permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contacts, Role, RolePermission]),
    LoggerModule,
    MailModule,
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {
}
