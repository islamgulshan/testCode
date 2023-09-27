import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestDemo } from './request-demo.entity';
import { RequestDemoService } from './request-demo.service';
import { RequestDemoController } from './request-demo.controller';
import { LoggerModule } from '../../utils/logger/logger.module';
import { WhiteLabelModule } from '../../modules/white-lable-product/white-label-product.module';
import { CacheManagerModule } from '../../modules/cache-manager/cache-manager.module';
import { MailModule } from '../../utils/mailer/mail.module';

@Module({
  imports: [
    WhiteLabelModule,
    CacheManagerModule,
    MailModule,
    TypeOrmModule.forFeature([RequestDemo]),
    LoggerModule,
  ],
  controllers: [RequestDemoController],
  exports: [RequestDemoService],
  providers: [RequestDemoService],
})
export class RequestDemoModule {}
