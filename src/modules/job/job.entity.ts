import moment from 'moment';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './../user/user.entity';
import { JobDTO } from './commons/job.dto';
import { ISalaryRange } from './commons/job.type';

@Entity({
  name: 'jobs',
})
export class Job {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ length: 255 })
  job_title: string;

  @Column({ length: 255 })
  job_type: string;

  @Column({ length: 255 })
  image: string;

  @Column({ length: 255 })
  location: string;

  @Column({ type: 'jsonb' })
  salary_range: ISalaryRange;

  @Column({ length: 255 })
  experience_required: string;

  @Column({
    nullable: false,
  })
  last_date: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  requirement: string;

  @Column()
  admin_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  User: User;

  @Column({ default: moment().unix() })
  created_at: number;

  @Column({ default: moment().unix() })
  updated_at: number;

  toJSON() {
    const { admin_id, ...self } = this;
    return self;
  }

  toDto() {
    const { ...dto } = this;
    return dto;
  }

  fromDto(payload: JobDTO): Job {
    const salary_range: ISalaryRange = {
      low: payload.salary_range.low,
      high: payload.salary_range.high,
    };
    this.job_title = payload.job_title;
    this.job_type = payload.job_type;
    this.location = payload.location;
    this.salary_range = salary_range;
    this.experience_required = payload.experience_required;
    this.last_date = payload.last_date;
    this.description = payload.description;
    this.requirement = payload.requirement;
    this.created_at = moment().unix();
    this.updated_at = moment().unix();
    return this;
  }
}
