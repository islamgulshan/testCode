import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TeamsDto } from './commons/teams.dtos';
import { TeamGender } from './commons/teams.enums';
import { IsEnum } from 'class-validator';
import { User } from './../user/user.entity';

@Entity({
  name: 'teams',
})
export class Teams {
  @PrimaryGeneratedColumn()
  teamId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  designation: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 255 })
  country: string;

  @Column({ length: 255 })
  phoneNumber: string;

  @Column({ length: 255 })
  cnic: string;

  @Column({ length: 255 })
  @IsEnum(TeamGender)
  gender: string;

  @Column({ length: 255 })
  religion: string;

  @Column()
  joining_date: number;

  @Column({ nullable: true })
  exit_date: number;

  @Column({ length: 255 })
  linkedin: string;

  @Column({ length: 255, nullable: true })
  profileImage: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin_id: User;

  fromDto(payload: TeamsDto): Teams {
    this.name = payload.name;
    this.email = payload.email;
    this.designation = payload.designation;
    this.address = payload.address;
    this.country = payload.country;
    this.phoneNumber = payload.phoneNumber;
    this.cnic = payload.cnic;
    this.gender = payload.gender;
    this.religion = payload.religion;
    this.joining_date = payload.joining_date;
    this.exit_date = payload.exit_date;
    this.linkedin = payload.linkedin;
    this.profileImage = payload.profileImage;
    return this;
  }
}
