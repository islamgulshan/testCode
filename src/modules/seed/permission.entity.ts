import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: `permissions` })
export class Permission {
  @PrimaryColumn()
  permissionId: number;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255 })
  accessName: string;

  @Column({ length: 255 })
  path: string;

  @Column({ length: 255 })
  method: string;
}
