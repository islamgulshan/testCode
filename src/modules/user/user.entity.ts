import { RegisterPayload } from '../../modules/auth';
import moment from 'moment';
import { Role } from './../seed/role.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'admins',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ length: 255 })
  firstName: string;

  @Column({ length: 255 })
  lastName: string;

  @Column({ length: 255 })
  email: string;

  @Column({
    default: 0,
  })
  @Column({
    type: 'boolean',
    default: false,
  })
  twoFA: boolean;

  @Column({
    length: 255,
    nullable: true,
  })
  twoFaKey: string;

  @Column({ length: 100, nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  roleId: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'roleId' })
  Role: Role;

  @Column({ length: 255 })
  country: string;

  @Column({ length: 255 })
  phoneNumber: string;

  @Column({
    name: `password`,
    length: 255,
  })
  password: string;

  @Column({ default: moment().unix() })
  created_at: number;

  toJSON() {
    const { password, twoFA, twoFaKey, ...self } = this;
    return self;
  }

  toDto() {
    const { password, ...dto } = this;
    return dto;
  }

  fromDto(payload: RegisterPayload): User {
    this.firstName = payload.firstName;
    this.lastName = payload.lastName;
    this.email = payload.email;
    this.phoneNumber = payload.phoneNumber;
    this.country = payload.country;
    this.password = payload.password;
    this.roleId = parseInt(payload.role_id);
    this.created_at = moment().unix();
    return this;
  }
}

export class UserFillableFields {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
  password: string;
  roleId: number;
}
