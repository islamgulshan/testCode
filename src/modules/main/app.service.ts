import { Injectable } from '@nestjs/common';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { SeedService } from '../../modules/seed/seed.service';
import { NodeEnv } from '../../utils/enum';

@Injectable()
export class AppService {
  /**
   * Configures The App Environment
   * @returns
   */
  static envConfiguration(): string {
    switch (process.env.NODE_ENV) {
      case NodeEnv.TEST:
        return `_${NodeEnv.TEST}.env`;

      default:
        return `.env`;
    }
  }

  /**
   * Create Connection to Database on App Start
   * @returns
   */
  static async createConnection() {
    return {
      type: process.env.DB_TYPE,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + `./../**/**.entity{.ts,.js}`],
      synchronize: process.env.DB_SYNC === `true`,
      extra: {
        connectionLimit: 5,
      },
      logging: false,
    } as TypeOrmModuleAsyncOptions;
  }

  /**
   * Insert Seed Data in Database
   * @returns
   */
  public static async startup() {
    try {
      process
        .on('unhandledRejection', (reason) => {
          console.error('Unhandled Rejection at Promise', reason);
        })
        .on('uncaughtException', (err) => {
          console.error(err, 'Uncaught Exception thrown');
          process.exit(1);
        });
      await SeedService.InsertSeed();
      return;
    } catch (err) {
      console.log(err);
    }
  }

  root(): string {
    return process.env.WEB_APP_URL;
  }
}
