import { Role } from './../../modules/seed/role.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Permission } from './../seed/permission.entity';

@Entity({ name: `role_permissions` })
export class RolePermission {
  @PrimaryColumn()
  @ManyToOne(() => Permission, (permission) => permission.permissionId)
  @JoinColumn({ name: 'permissionId' })
  permissionId: Permission;

  @PrimaryColumn()
  @ManyToOne(() => Role, (role) => role.roleId)
  @JoinColumn({ name: 'roleId' })
  roleId: Role;
}
