import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { Application } from './application.entity';
import { ResponseCode, ResponseMessage } from '../../utils/enum';
import { ApplicationDto } from './commons/application.dtos';
import { JobService } from '../../modules/job/job.service';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import moment from 'moment';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly jobService: JobService,
  ) {
  }

  /**
   * Post Application Api
   * @param payload
   * @param cv
   * @returns application
   */
  public async addApplication(
    payload: ApplicationDto,
    cv: string,
  ): Promise<Application> {
    const job = await this.jobService.getJob(payload.positionId);
    if (!job) {
      throw new HttpException(
        ResponseMessage.INVALID_JOB_ID,
        ResponseCode.NOT_FOUND,
      );
    }
    const newApplication = new Application().fromDto(payload);
    newApplication.cv = cv;
    return await this.applicationRepository.save(newApplication);
  }

  /**
   * Get All Applications
   * @params query
   * @returns
   */
  public async getAllApplications(
    query: any,
    paginationOption: IPaginationOptions,
  ) {
    const limit = Number(paginationOption.limit);
    const page = Number(paginationOption.page);
    let filter = `where 1=1`;
    if (query.value && query.search_by && query.search_by === 'job_title') {
      filter += ` AND  ( LOWER("job_title") like LOWER('%${query.value}%') ) `;
    }
    if (query.value && query.search_by && query.search_by === 'date') {
      filter += ` AND  ( "date" >=  ${moment
        .unix(query.value)
        .startOf('day')
        .unix()} AND date <= ${moment
        .unix(query.value)
        .endOf('day')
        .unix()} ) `;
    }
    const sql = `SELECT 
                  name, 
                  email, 
                  date, 
                  phone,
                  "isRead", 
                  application.uuid, 
                  jobs.job_title
                FROM 
                application  
                INNER JOIN
                  jobs
                ON
                  application."positionId" = jobs.uuid 
                ${filter} ORDER BY application.date DESC
                LIMIT $1 OFFSET $2`;
    const applications = await getManager().query(sql, [
      limit,
      limit * (page - 1),
    ]);
    const total_sql = `SELECT  
                        COUNT(*) as total_applications 
                      FROM 
                      application  
                      INNER JOIN
                        jobs
                      ON
                        application."positionId" = jobs.uuid
                      ${filter} `;
    const total_records = await getManager().query(total_sql);
    const total_pages = Math.ceil(total_records[0].total_applications / limit);
    return {
      applications,
      total_records: Number(total_records[0].total_applications),
      total_pages: Number(total_pages),
    };
  }

  /**
   * Get Application cv
   * @param uuid
   * @returns cv
   */
  public async getApplicationCv(uuid: string) {
    const application = await this.applicationRepository.findOne({ uuid });
    await this.applicationRepository.update({ uuid: uuid }, { isRead: true });
    if (application) {
      return application.cv;
    } else {
      throw new HttpException(
        ResponseMessage.CONTENT_NOT_FOUND,
        ResponseCode.NOT_FOUND,
      );
    }
  }

  /**
   * Get Application Statistics
   * @returns total_applications, read_applications, unread_applications
   */
  public async getApplicationStatistics() {
    const total_applications = await this.applicationRepository.count();
    const unread_applications = await this.applicationRepository.count({
      where: { isRead: false },
    });
    const read_applications = await this.applicationRepository.count({
      where: { isRead: true },
    });
    return {
      total_applications: total_applications,
      read_applications: read_applications,
      unread_applications: unread_applications,
    };
  }
}
