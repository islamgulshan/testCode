import { IsArray, IsInt } from 'class-validator';

export class RolePermissionDto {
  @IsInt({ each: true })
  @IsArray()
  permissions: number[];
}
