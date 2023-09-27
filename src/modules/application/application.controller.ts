import { ApplicationService } from './application.service';
import { UsersService } from './../user/user.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerMessages, ResponseCode, ResponseMessage } from '../../utils/enum';
import { LoggerService } from '../../utils/logger/logger.service';
import { ApplicationDto } from './commons/application.dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { isUUID } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { Pagination } from '../../utils/paginate';
import { diskStorage } from 'multer';
import { PermissionsGuard } from '../user/guards/permissions.guard';

@Controller('api/application')
export class ApplicationController {
  constructor(
    private readonly ApplicationService: ApplicationService,
    private readonly UserService: UsersService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('applicationController');
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('cv', {
      storage: diskStorage({
        destination: './uploads/cv',
        filename: UsersService.editFileName,
      }),
      fileFilter: UsersService.fileFilter,
      limits: { fileSize: 5242880 },
    }),
  )
  public async addApplication(
    @Body() payload: ApplicationDto,
    @Res() res: Response,
    @UploadedFile() cv: Express.Multer.File,
  ) {
    this.loggerService.log(`POST Application ${LoggerMessages.API_CALLED}`);
    if (!cv) {
      return res.status(ResponseCode.BAD_REQUEST).send({
        statusCode: ResponseCode.BAD_REQUEST,
        error: ResponseMessage.CV_NOT_UPLOADED,
      });
    }
    const application = await this.ApplicationService.addApplication(
      payload,
      cv.filename,
    );
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.CREATED_SUCCESSFULLY,
      data: application,
    });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  public async getApplications(
    @Req() req: Request,
    @Query() query: any,
    @Res() res: Response,
  ) {
    this.loggerService.log(`GET Application ${LoggerMessages.API_CALLED}`);
    const pagination: IPaginationOptions = await Pagination.paginate(req, res);
    const data = await this.ApplicationService.getAllApplications(
      query,
      pagination,
    );
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: data,
      message: ResponseMessage.SUCCESS,
    });
  }

  @Get('/cv/:id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  public async getApplicationCv(
    @Res() res: Response,
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    this.loggerService.log(
      `GET Application /cv/:id ${LoggerMessages.API_CALLED}`,
    );
    if (id && !isUUID(id)) {
      return res.status(ResponseCode.BAD_REQUEST).send({
        statusCode: ResponseCode.BAD_REQUEST,
        error: ResponseMessage.INVALID_APPLICATION_ID,
      });
    }
    const data = await this.ApplicationService.getApplicationCv(id);
    if (data) {
      return res.status(ResponseCode.SUCCESS).send({
        statusCode: ResponseCode.SUCCESS,
        url: `${req.protocol}://${req.get('host')}/cv/${data}`,
        message: ResponseMessage.SUCCESS,
      });
    } else {
      return res.status(ResponseCode.SUCCESS).send({
        statusCode: ResponseCode.SUCCESS,
        message: ResponseMessage.CONTENT_NOT_FOUND,
      });
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/dashboard/statistics')
  public async getApplicationStatistics(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.loggerService.log(
      `GET Application /dashboard/statistics ${LoggerMessages.API_CALLED}`,
    );
    const data = await this.ApplicationService.getApplicationStatistics();
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: data,
      message: ResponseMessage.SUCCESS,
    });
  }
}
