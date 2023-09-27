import { Injectable } from '@nestjs/common';
import { Connection, getConnection, Repository } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
import { default as role } from '../../utils/seed/role.json';
import { default as permission } from '../../utils/seed/permission.json';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Role)
    private readonly RoleRepository: Repository<Role>,
  ) {
  }

  /**
   * Insert seed data to the database
   * @returns
   */
  public static InsertSeed(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const connection = getConnection();
      const queryRunner = connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await this.insertRole(connection);
        await this.insertPermission(connection);
        await queryRunner.commitTransaction();
        queryRunner.release();
        resolve();
      } catch (err) {
        await queryRunner.rollbackTransaction();
        queryRunner.release();
        reject(err);
      }
    });
  }

  /**
   * Insert role seed data to the database
   * @param conn
   * @returns
   */
  public static insertRole(conn: Connection) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const RoleRepositrory = conn.getRepository(Role);
        await RoleRepositrory.createQueryBuilder()
          .insert()
          .values(role)
          .orIgnore()
          .execute();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Insert Permission seed data to the database
   * @param conn
   * @returns
   */
  public static insertPermission(conn: Connection) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const PermissionRepositrory = conn.getRepository(Permission);
        await PermissionRepositrory.createQueryBuilder()
          .insert()
          .values(permission)
          .orIgnore()
          .execute();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }
}
