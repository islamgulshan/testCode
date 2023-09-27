import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RolePermission } from '../role_permission.entity';
import { Role } from '../../seed/role.entity';
import { RoleEnum } from '../../seed/role.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const path = request.route.path;
    const method = request.method.toLowerCase();
    const role = await this.roleRepository.findOne({
      roleId: request.user.roleId,
    });
    if (role.roleName === RoleEnum.Super_Admin) {
      return true;
    }
    const permission = await this.rolePermissionRepository.find({
      where: { roleId: request.user.roleId },
      relations: ['permissionId'],
    });
    return this.checkIfRoleHavePermission(path, method, permission);
  }

  /**
   * check if role have necessary permission to view resource
   * @param path
   * @param method
   * @param permissionAgainst
   */
  checkIfRoleHavePermission(path, method, permissionAgainst) {
    const url = '/api/';
    const valid = permissionAgainst.findIndex(
      (c) =>
        c.permissionId.method === method &&
        `${url}${c.permissionId.path}` == path,
    );
    return valid > -1;
  }
}
