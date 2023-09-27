import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, LoginPayload, RegisterPayload } from './';
import { CurrentUser } from '../common/decorator/current-user.decorator';
import { User } from '../user';
import { LoggerService } from '../../utils/logger/logger.service';
import { LoggerMessages, ResponseCode, ResponseMessage } from '../../utils/enum';
import { Request, Response } from 'express';
import { EmailDto, ForgotPasswordDto } from './register.payload';

@Controller('api/admin/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('AuthController');
  }

  @Post('register')
  async createAdmin(
    @Body() payload: RegisterPayload,
    @Res() res: Response,
  ): Promise<Response> {
    const user = await this.authService.registerAdmin(payload);
    return res.status(ResponseCode.CREATED_SUCCESSFULLY).send({
      statusCode: ResponseCode.CREATED_SUCCESSFULLY,
      data: user.toDto(),
      message: ResponseMessage.CREATED_SUCCESSFULLY,
    });
  }

  @Post('login')
  async login(@Body() payload: LoginPayload): Promise<any> {
    this.loggerService.log(`POST auth/login ${LoggerMessages.API_CALLED}`);
    const user = await this.authService.validateUser(payload);
    return await this.authService.createToken(user);
  }

  @Post('forgot_password')
  async forgotPassword(
    @Body() body: EmailDto,
    @Res() res: Response,
  ): Promise<Response> {
    this.loggerService.log(
      `GET auth/forgot_password ${LoggerMessages.API_CALLED}`,
    );
    await this.authService.forgotPassword(body.email);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.FORGOT_PASSWORD_EMAIL,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('verify_token')
  async checkPasswordLinkExpiry(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    this.loggerService.log(
      `GET auth/verify_token ${LoggerMessages.API_CALLED}`,
    );
    const token = req.headers.authorization.split(' ')[1];
    await this.authService.checkPasswordLinkExpiry(user.email, token);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('confirm_forgot_password')
  async forgotConfirmPassword(
    @CurrentUser() user: User,
    @Res() res: Response,
    @Body() payload: ForgotPasswordDto,
  ): Promise<Response> {
    this.loggerService.log(
      `GET auth/confirm_forgot_password ${LoggerMessages.API_CALLED}`,
    );
    await this.authService.confirmForgotPassword(user.email, payload.password);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
    });
  }

  @UseGuards(AuthGuard())
  @Get('me')
  async getLoggedInUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
