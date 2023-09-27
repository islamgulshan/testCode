import { StaffDto } from './commons/staff.dto';
import { Role } from '../seed/role.entity';
import moment from 'moment';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'staffs',
})
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ length: 255 })
  email: string;

  @Column({ nullable: true })
  roleId: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  Role: Role;

  @Column({ default: null })
  profileCode: number;

  @Column({ default: moment().unix() })
  created_at: number;

  toDto() {
    const { uuid, profileCode, ...dto } = this;
    return dto;
  }

  fromDto(payload: StaffDto): Staff {
    this.email = payload.email;
    this.roleId = payload.roleId;
    this.created_at = moment().unix();
    return this;
  }
}
