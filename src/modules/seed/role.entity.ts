import { Column, Entity, PrimaryColumn } from 'typeorm';
import { RoleEnum } from './../seed/role.enum';
import { IsEnum } from 'class-validator';

@Entity({ name: `roles` })
export class Role {
  @PrimaryColumn()
  roleId: number;

  @Column()
  @IsEnum(RoleEnum)
  roleName: string;
}
