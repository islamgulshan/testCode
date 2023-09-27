import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './../auth';
import { CommonModule } from './../common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedModule } from '../../modules/seed/seed.module';
import { ContactsModule } from '../contacts/contacts.module';
import { JobModule } from '../job/job.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from '../../modules/user';
import { ApplicationModule } from '../application/application.module';
import { TeamsModule } from '../teams/teams.module';
import { WhiteLabelModule } from '../white-lable-product/white-label-product.module';
import { RequestDemoModule } from '../../modules/request-demo/request-demo.module';
import { CacheManagerModule } from '../../modules/cache-manager/cache-manager.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => {
        return await AppService.createConnection();
      },
    }),
    ConfigModule.forRoot({
      envFilePath: [AppService.envConfiguration()],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      exclude: ['/api*'],
    }),
    TeamsModule,
    AuthModule,
    CacheManagerModule,
    RequestDemoModule,
    UserModule,
    ContactsModule,
    JobModule,
    WhiteLabelModule,
    ApplicationModule,
    CommonModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
