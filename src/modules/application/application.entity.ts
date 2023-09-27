import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApplicationDto } from './commons/application.dtos';
import moment from 'moment';
import { Job } from '../job/job.entity';

@Entity({
  name: 'application',
})
export class Application {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  phone: string;

  @Column({ length: 255 })
  cv: string;

  @Column({ default: moment().unix() })
  date: number;

  @Column()
  positionId: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'positionId' })
  Job: Job;

  fromDto(payload: ApplicationDto): Application {
    this.name = payload.name;
    this.email = payload.email;
    this.phone = payload.phone;
    this.positionId = payload.positionId;
    this.date = moment().unix();
    return this;
  }
}
