import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { LoggerService } from '../../utils/logger/logger.service';
import { User } from '../user';
import { Request, Response } from 'express';
import { LoggerMessages, ResponseCode, ResponseMessage } from '../../utils/enum';
import { CurrentUser } from './../common/decorator/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminDTO, ChangePasswordPayload, ToggleTwoFaDto } from './commons/user.dtos';
import { StaffDto } from './commons/staff.dto';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { Pagination } from '../../utils/paginate';
import { diskStorage } from 'multer';
import { RolePermissionDto } from './commons/role_permission.dto';
import { PermissionsGuard } from './guards/permissions.guard';

const fs = require('fs');

@Controller('api/admin')
export class UserController {
  constructor(
    private readonly userService: UsersService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('UserController');
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change_password')
  public async changePassword(
    @CurrentUser() admin: User,
    @Body() payload: ChangePasswordPayload,
    @Res() res: Response,
  ) {
    this.loggerService.log(
      `Post admin /change_password ${LoggerMessages.API_CALLED}`,
    );
    await this.userService.changePassword(admin.email, payload.password, payload.currentPassword);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.PASSWORD_CHANGE_SUCCESS,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('get_2fa_authentication')
  async getTpAuthentication(
    @CurrentUser() admin: User,
    @Res() res: Response,
  ): Promise<Response> {
    this.loggerService.log(`GET admin/getToTpURI ${LoggerMessages.API_CALLED}`);
    const toTpURI = await this.userService.generateToTpURI(admin.email);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: toTpURI,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('toggle_2fa')
  async toggleTwoFA(
    @CurrentUser() user: User,
    @Res() res: Response,
    @Body() payload: ToggleTwoFaDto,
  ): Promise<Response> {
    this.loggerService.log(
      `POST admin /toggle_2fa ${LoggerMessages.API_CALLED}`,
    );
    await this.userService.toggleTwoFactorAuthentication(user, payload.code);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/profile_picture')
  public async getAdminProfilePicture(
    @CurrentUser() admin: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.loggerService.log(
      `GET admin/profile_picture/ ${LoggerMessages.API_CALLED}`,
    );
    const data = await this.userService.getAdminPicture(admin.uuid);
    if (data) {
      return res.status(ResponseCode.SUCCESS).send({
        statusCode: ResponseCode.SUCCESS,
        url: `${req.protocol}://${req.get('host')}/${data}`,
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
  @Put('/update_profile_picture')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: UsersService.editFileName,
      }),
      fileFilter: UsersService.fileFilter,
    }),
  )
  public async updateAdminProfilePicture(
    @CurrentUser() admin: User,
    @Res() res: Response,
    @UploadedFile() image: Express.Multer.File,
  ) {
    this.loggerService.log(
      `PUT admin/update_profile_picture/ ${LoggerMessages.API_CALLED}`,
    );
    if (!image) {
      return res.status(ResponseCode.BAD_REQUEST).send({
        statusCode: ResponseCode.BAD_REQUEST,
        error: ResponseMessage.BAD_REQUEST,
      });
    }
    if (admin.profileImage != '' && admin.profileImage != null) {
      fs.unlinkSync(`uploads/${admin.profileImage}`);
    }
    await this.userService.updateAdminPicture(image.filename, admin.uuid);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.UPDATED_SUCCESSFULLY,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/profile')
  public async getAdminProfile(
    @CurrentUser() admin: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.loggerService.log(`GET admin/profile/ ${LoggerMessages.API_CALLED}`);
    const data = await this.userService.getAdmin(admin.uuid);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: data,
      message: ResponseMessage.SUCCESS,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('/update_profile')
  public async updateAdminProfile(
    @CurrentUser() admin: User,
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: AdminDTO,
  ) {
    this.loggerService.log(
      `PUT admin/updateProfile/ ${LoggerMessages.API_CALLED}`,
    );
    await this.userService.updateAdmin(body, admin.uuid);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.UPDATED_SUCCESSFULLY,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  public async getCurrentUserDetails(
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<Response> {
    this.loggerService.log(`GET user/me ${LoggerMessages.API_CALLED}`);

    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: { user: user.toDto() },
      message: ResponseMessage.SUCCESS,
    });
  }

  /********************************************************************************************************************/

  /*
  /*                                    Staff  member sections fees
  /*
  /********************************************************************************************************************/
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post('add_staff_member')
  async addStaffMember(
    @Body() payload: StaffDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    this.loggerService.log(
      `POST admin /add_staff_member ${LoggerMessages.API_CALLED}`,
    );
    const user = await this.userService.addStaffMember(payload, req);
    return res.status(ResponseCode.CREATED_SUCCESSFULLY).send({
      statusCode: ResponseCode.CREATED_SUCCESSFULLY,
      data: { code: user },
      message: ResponseMessage.CREATED_SUCCESSFULLY,
    });
  }

  @Get('verify_staff_email')
  async verifyStaffEmail(
    @Query('code') code: number,
    @Res() res: Response,
  ): Promise<Response> {
    this.loggerService.log(
      `GET admin /verify_staff_email ${LoggerMessages.API_CALLED}`,
    );
    const staffMember = await this.userService.verifyStaffEmail(code);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: staffMember.toDto(),
      message: ResponseMessage.SUCCESS,
    });
  }

  @Get('staff_list')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  public async staffList(@Req() req: Request, @Res() res: Response) {
    this.loggerService.log(
      `GET admin /staff_list ${LoggerMessages.API_CALLED}`,
    );
    const pagination: IPaginationOptions = await Pagination.paginate(req, res);
    const staffList = await this.userService.staffsList(pagination);
    staffList.staffMember.items.map((m) => {
      m.profileImage = `${req.protocol}://${req.get('host')}/${m.profileImage}`;
    });
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: staffList,
    });
  }

  @Get('detail/:id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  public async staffDetail(@Param('id') uuid: string, @Res() res: Response, @Req() req: Request) {
    this.loggerService.log(`GET Admin detail/:id ${LoggerMessages.API_CALLED}`);
    const staffMember = await this.userService.staffDetail(uuid);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: {
        ...staffMember.toDto(),
        profileImage: `${req.protocol}://${req.get('host')}/${
          staffMember.profileImage
        }`,
      },
    });
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Patch(':id')
  public async staffEdit(
    @Body() payload: StaffDto,
    @Res() res: Response,
    @Param('id') uuid: string,
  ) {
    this.loggerService.log(`PATCH Admin /:id ${LoggerMessages.API_CALLED}`);
    const member = await this.userService.staffEdit(payload, uuid);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: member,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('roles')
  public async getRole(@Res() res: Response) {
    this.loggerService.log(`PATCH Admin /roles ${LoggerMessages.API_CALLED}`);
    const member = await this.userService.getRole();
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: member,
    });
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get('permissions')
  public async getPermission(@Res() res: Response) {
    this.loggerService.log(
      `GET admin /permissions ${LoggerMessages.API_CALLED}`,
    );
    const member = await this.userService.getPermission();
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: member,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('role_permission/:roleId')
  public async getRolePermission(
    @Res() res: Response,
    @Param('roleId') roleId: number,
  ) {
    this.loggerService.log(
      `GET admin /role_permission:roleId ${LoggerMessages.API_CALLED}`,
    );
    const permission = await this.userService.getRolePermission(roleId);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: permission,
    });
  }

  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Put('role_permission/:roleId')
  public async rolePermission(
    @Res() res: Response,
    @Param('roleId') roleId: number,
    @Body() RolePermissionDto: RolePermissionDto,
  ) {
    this.loggerService.log(
      `PUT admin /role_permission:roleId ${LoggerMessages.API_CALLED}`,
    );
    await this.userService.rolePermission(roleId, RolePermissionDto);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('permission_list')
  async getLoggedInUser(@CurrentUser() user: User, @Res() res: Response) {
    this.loggerService.log(
      `GET admin /permission_list ${LoggerMessages.API_CALLED}`,
    );
    const permissionList = await this.userService.permissionList(user.roleId);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: permissionList,
    });
  }
}
