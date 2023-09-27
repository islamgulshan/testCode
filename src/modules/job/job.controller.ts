import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JobService } from './job.service';
import { AuthGuard } from '@nestjs/passport';
import { LoggerService } from '../../utils/logger/logger.service';
import { User, UsersService } from '../user';
import { Request, Response } from 'express';
import { LoggerMessages, ResponseCode, ResponseMessage } from '../../utils/enum';
import { CurrentUser } from '../common/decorator/current-user.decorator';
import { JobDTO } from './commons/job.dto';
import { isUUID } from 'class-validator';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { Pagination } from '../../utils/paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { PermissionsGuard } from '../user/guards/permissions.guard';

@Controller('api/job')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('JobController');
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: UsersService.editFileName,
      }),
      fileFilter: UsersService.fileFilter,
    }),
  )
  public async createJob(
    @CurrentUser() admin: User,
    @Res() res: Response,
    @Body() body: JobDTO,
    @UploadedFile() image: Express.Multer.File,
  ) {
    this.loggerService.log(`POST job/ ${LoggerMessages.API_CALLED}`);
    if (!image) {
      throw new HttpException(
        ResponseMessage.IMAGE_REQUIRED,
        ResponseCode.BAD_REQUEST,
      );
    }
    const data = await this.jobService.createJob(body, image, admin.uuid);
    return res.status(ResponseCode.CREATED_SUCCESSFULLY).send({
      statusCode: ResponseCode.CREATED_SUCCESSFULLY,
      data: data,
      message: ResponseMessage.CREATED_SUCCESSFULLY,
    });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  public async getJobs(@Req() req: Request, @Res() res: Response) {
    this.loggerService.log(`GET job ${LoggerMessages.API_CALLED}`);

    const pagination: IPaginationOptions = await Pagination.paginate(req, res);
    const data = await this.jobService.getAllJobs(pagination);
    data.jobs.items.map((m) => {
      m.image = `${req.protocol}://${req.get('host')}/${m.image}`;
    });
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: data,
      message: ResponseMessage.SUCCESS,
    });
  }

  @Get('/active')
  public async getActiveJobs(@Req() req: Request, @Res() res: Response) {
    this.loggerService.log(`GET job /active ${LoggerMessages.API_CALLED}`);
    const pagination: IPaginationOptions = await Pagination.paginate(req, res);
    const data = await this.jobService.getActiveJobs(pagination);
    data.jobs.items.map((m) => {
      m.image = `${req.protocol}://${req.get('host')}/${m.image}`;
    });
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: data,
      message: ResponseMessage.SUCCESS,
    });
  }

  @Get('/:id')
  public async getJob(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    this.loggerService.log(`GET job/:id ${LoggerMessages.API_CALLED}`);
    if (id && !isUUID(id)) {
      return res.status(ResponseCode.BAD_REQUEST).send({
        statusCode: ResponseCode.BAD_REQUEST,
        error: ResponseMessage.INVALID_JOB_ID,
      });
    }
    const data = await this.jobService.getJob(id);
    if (data) {
      data.image = `${req.protocol}://${req.get('host')}/${data.image}`;
      return res.status(ResponseCode.SUCCESS).send({
        statusCode: ResponseCode.SUCCESS,
        data: data,
        message: ResponseMessage.SUCCESS,
      });
    } else {
      return res.status(ResponseCode.NOT_FOUND).send({
        statusCode: ResponseCode.NOT_FOUND,
        error: ResponseMessage.CONTENT_NOT_FOUND,
      });
    }
  }

  @Put('/:id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: UsersService.editFileName,
      }),
      fileFilter: UsersService.fileFilter,
    }),
  )
  public async updateJob(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() body: JobDTO,
    @UploadedFile() image: Express.Multer.File,
  ) {
    this.loggerService.log(`PUT job/:id ${LoggerMessages.API_CALLED}`);
    if (id && !isUUID(id)) {
      return res.status(ResponseCode.BAD_REQUEST).send({
        statusCode: ResponseCode.BAD_REQUEST,
        error: ResponseMessage.INVALID_JOB_ID,
      });
    }
    const data = await this.jobService.updateJob(body, image, id);
    if (data.affected) {
      return res.status(ResponseCode.SUCCESS).send({
        statusCode: ResponseCode.SUCCESS,
        message: ResponseMessage.UPDATED_SUCCESSFULLY,
      });
    } else {
      return res.status(ResponseCode.NOT_FOUND).send({
        statusCode: ResponseCode.NOT_FOUND,
        error: ResponseMessage.CONTENT_NOT_FOUND,
      });
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/dashboard/statistics')
  public async getJobStatistics(@Req() req: Request, @Res() res: Response) {
    this.loggerService.log(
      `GET Job /dashboard/statistics ${LoggerMessages.API_CALLED}`,
    );
    const data = await this.jobService.getJobStatistics();
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: data,
      message: ResponseMessage.SUCCESS,
    });
  }
}
