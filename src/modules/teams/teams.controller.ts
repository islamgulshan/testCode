import { TeamsService } from './teams.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Patch,
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
import { AuthGuard } from '@nestjs/passport';
import { LoggerService } from '../../utils/logger/logger.service';
import { TeamsDto } from './commons/teams.dtos';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { Pagination } from '../../utils/paginate';
import { User } from '../user';
import { CurrentUser } from '../common/decorator/current-user.decorator';
import { isPositiveInteger } from '../../utils/methods';
import { PermissionsGuard } from './../user/guards/permissions.guard';

@Controller('api/teams')
export class TeamsController {
  constructor(
    private readonly TeamsService: TeamsService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('TeamsController');
  }

  @Get('teams_list')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  public async teamsList(
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.loggerService.log(
      `GET teams /teams_list ${LoggerMessages.API_CALLED}`,
    );
    const pagination: IPaginationOptions = await Pagination.paginate(req, res);
    const teamsList = await this.TeamsService.teamsList(query, pagination);
    teamsList.teams.map((m) => {
      m.profileImage = `${req.protocol}://${req.get('host')}/${m.profileImage}`;
    });
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: teamsList,
    });
  }

  @Get('teams_list_aggregate')
  public async teamListAggregate(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.loggerService.log(
      `GET teams /teams_list ${LoggerMessages.API_CALLED}`,
    );
    const pagination: IPaginationOptions = await Pagination.paginate(req, res);
    const teamsList = await this.TeamsService.teamListAggregate(pagination);
    teamsList.items.map((m) => {
      m.profileImage = `${req.protocol}://${req.get('host')}/${m.profileImage}`;
    });
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: teamsList,
    });
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post('add')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: TeamsService.editFileName,
      }),
      fileFilter: TeamsService.fileFilter,
      limits: {
        files: 1,
        fileSize: 1e7,
      },
    }),
  )
  public async teamAdd(
    @Body() payload: TeamsDto,
    @Res() res: Response,
    @CurrentUser() admin: User,
    @UploadedFile() profileImage,
    @Req() req: Request,
  ) {
    this.loggerService.log(`POST Teams /add ${LoggerMessages.API_CALLED}`);
    if (!profileImage)
      throw new HttpException(
        `${ResponseMessage.PROFILE_IMAGE_NOT_UPLOAD}`,
        ResponseCode.BAD_REQUEST,
      );
    const member = await this.TeamsService.teamAdd(
      payload,
      profileImage,
      admin.uuid,
    );
    return res.status(ResponseCode.CREATED_SUCCESSFULLY).send({
      statusCode: ResponseCode.CREATED_SUCCESSFULLY,
      message: ResponseMessage.CREATED_SUCCESSFULLY,
      data: member,
    });
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: diskStorage({
        destination: './uploads',
        filename: TeamsService.editFileName,
      }),
      fileFilter: TeamsService.fileFilter,
      limits: {
        files: 1,
        fileSize: 1e7,
      },
    }),
  )
  public async teamEdit(
    @Body() payload: TeamsDto,
    @Res() res: Response,
    @CurrentUser() admin: User,
    @Param('id') teamId: number,
    @UploadedFile() profileImage,
    @Req() req: Request,
  ) {
    this.loggerService.log(`PATCH Teams /:id ${LoggerMessages.API_CALLED}`);
    const isPosInt = isPositiveInteger(teamId.toString());
    if (!isPosInt)
      throw new HttpException(
        `Parameter id ${ResponseMessage.IS_INVALID}`,
        ResponseCode.BAD_REQUEST,
      );
    const member = await this.TeamsService.teamEdit(
      payload,
      profileImage,
      admin.uuid,
      teamId,
    );
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: member,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  public async teamsDetail(
    @Param('id') teamId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.loggerService.log(`GET Teams /:id ${LoggerMessages.API_CALLED}`);
    const teamMember = await this.TeamsService.teamsDetail(teamId);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: {
        ...teamMember,
        profileImage: `${req.protocol}://${req.get('host')}/${
          teamMember.profileImage
        }`,
      },
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/dashboard/statistics')
  public async getJobStatistics(@Req() req: Request, @Res() res: Response) {
    this.loggerService.log(
      `GET Teams /dashboard/statistics ${LoggerMessages.API_CALLED}`,
    );
    const data = await this.TeamsService.getTeamsStatistics();
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: data,
      message: ResponseMessage.SUCCESS,
    });
  }
}
