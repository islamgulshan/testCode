import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { Job } from './job.entity';
import { JobDTO } from './commons/job.dto';
import { ResponseCode, ResponseMessage } from '../../utils/enum';
import moment from 'moment';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

const fs = require('fs');

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
  ) {
  }

  async get(uuid: string) {
    return this.jobRepository.findOne({ uuid });
  }

  /**
   * Create job
   * @param payload
   * @param AdminUUID
   * @returns
   */
  async createJob(
    payload: JobDTO,
    image: Express.Multer.File,
    AdminUUID: string,
  ): Promise<Job> {
    if (Number(payload.salary_range.high) < Number(payload.salary_range.low)) {
      throw new HttpException(
        ResponseMessage.INVALID_SALARY_RANGE,
        ResponseCode.BAD_REQUEST,
      );
    }
    if (
      !moment(payload.last_date, 'X', true).isValid() ||
      payload.last_date < moment().unix()
    ) {
      throw new HttpException(
        ResponseMessage.INVALID_LAST_DATE,
        ResponseCode.BAD_REQUEST,
      );
    }

    const newJob = new Job().fromDto(payload);
    newJob.admin_id = AdminUUID;
    newJob.image = image.filename;
    return await this.jobRepository.save(newJob);
  }

  /**
   * Get All Jobs
   * @params query
   * @params paginationOption
   * @returns
   */
  public async getAllJobs(paginationOption: IPaginationOptions) {
    const jobs = await this.paginate(paginationOption);
    return {
      jobs,
    };
  }

  /**
   * Get Active Jobs
   * @params query
   * @params paginationOption
   * @returns
   */
  public async getActiveJobs(paginationOption: IPaginationOptions) {
    const jobs = await this.paginate(paginationOption, {
      last_date: MoreThan(moment().unix()),
    });
    return {
      jobs,
    };
  }

  /**
   * Get Job
   * @params uuid
   * @returns
   */
  public async getJob(uuid: string) {
    return this.jobRepository.findOne({ uuid });
  }

  /**
   * Update Job
   * @params data
   * @params uuid
   * @returns
   */
  public async updateJob(
    data: JobDTO,
    image: Express.Multer.File,
    uuid: string,
  ) {
    if (Number(data.salary_range.high) < Number(data.salary_range.low)) {
      throw new HttpException(
        ResponseMessage.INVALID_SALARY_RANGE,
        ResponseCode.BAD_REQUEST,
      );
    }
    if (
      !moment(data.last_date, 'X', true).isValid() ||
      data.last_date < moment().unix()
    ) {
      throw new HttpException(
        ResponseMessage.INVALID_LAST_DATE,
        ResponseCode.BAD_REQUEST,
      );
    }
    const updatedJob = new Job().fromDto(data);
    updatedJob.updated_at = moment().unix();
    if (image) {
      updatedJob.image = image.filename;
      const oldRecord = await this.getJob(uuid);
      if (oldRecord.image) {
        fs.unlinkSync(process.env.IMAGE_BASE_URL + oldRecord.image);
      }
    }
    return await this.jobRepository.update({ uuid: uuid }, updatedJob);
  }

  /**
   * Get Job Statistics
   * @returns total_jobs, active_jobs, inactive_jobs
   */
  public async getJobStatistics() {
    const total_jobs = await this.jobRepository.count();
    const inactive_jobs = await this.jobRepository.count({
      where: { last_date: LessThanOrEqual(moment().unix()) },
    });
    const active_jobs = await this.jobRepository.count({
      where: { last_date: MoreThan(moment().unix()) },
    });
    return {
      total_jobs: total_jobs,
      active_jobs: active_jobs,
      inactive_jobs: inactive_jobs,
    };
  }

  /**
   * Paginate Course
   * @param options
   * @param condition
   * @param relations
   * @returns
   */
  private async paginate(
    options: IPaginationOptions,
    condition?: Object,
    relations?: string[],
  ): Promise<Pagination<Job>> {
    return paginate<Job>(this.jobRepository, options, {
      order: { created_at: 'DESC' },
      where: condition,
      relations: relations,
    });
  }
}
