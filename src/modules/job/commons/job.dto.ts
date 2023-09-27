import { IsEnum, IsNotEmpty } from 'class-validator';
import { job_type, locations } from './job.enum';

export class SalaryRangeDTO {
  @IsNotEmpty()
  low: string;

  @IsNotEmpty()
  high: string;
}

export class JobDTO {
  @IsNotEmpty()
  job_title: string;

  @IsNotEmpty()
  @IsEnum(job_type)
  job_type: string;

  @IsNotEmpty()
  @IsEnum(locations)
  location: string;

  @IsNotEmpty()
  salary_range: SalaryRangeDTO;

  @IsNotEmpty()
  experience_required: string;

  @IsNotEmpty()
  last_date: number;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  requirement: string;
}
