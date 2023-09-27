import { Body, Controller, Headers, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { RequestDemoService } from './request-demo.service';
import { LoggerService } from '../../utils/logger/logger.service';
import {
  LoggerMessages,
  ResponseCode,
  ResponseMessage,
} from '../../utils/enum';
import {
  // ProductIdDto,
  EmailDto,
  verificationCodeDto,
  HeadersDto,
  slugDto,
  EmailVerificationDto,
} from './common/request-demo.dtos';

@Controller('api/request-demo')
export class RequestDemoController {
  constructor(
    private readonly requestDemoService: RequestDemoService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('RequestDemoController');
  }

  @Post('email_verification/:slug')
  async emailVerification(
    @Param() params: slugDto,
    @Body() body: EmailVerificationDto,
    @Res() res: Response,
  ): Promise<Response> {
    this.loggerService.log(
      `POST request-demo/email_verification/ ${params.slug} ${LoggerMessages.API_CALLED}`,
    );
    const code = await this.requestDemoService.emailVerification(
      params.slug,
      body,
    );
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: code,
      message: ResponseMessage.SUCCESS,
    });
  }

  @Post('verify_email/:slug')
  async verifyEmailCode(
    @Param() params: slugDto,
    @Body() body: verificationCodeDto,
    @Res() res: Response,
  ): Promise<Response> {
    this.loggerService.log(
      `POST request-demo/verify_email/:${params.slug} ${LoggerMessages.API_CALLED}`,
    );
    const token = await this.requestDemoService.verifyEmailCode(
      params.slug,
      body,
    );
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: token,
      message: ResponseMessage.SUCCESS,
    });
  }

  @Post('verify_demo_link/:slug')
  async verifyDemoLink(
    @Param() params: slugDto,
    @Body() body: EmailDto,
    @Headers() headers: HeadersDto,
    @Res() res: Response,
  ): Promise<Response> {
    this.loggerService.log(
      `POST verify_demo_link/:slug ${LoggerMessages.API_CALLED}`,
    );
    const demoURL = await this.requestDemoService.verifyDemoLink(
      headers,
      params.slug,
      body.email,
    );
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: demoURL,
      message: ResponseMessage.SUCCESS,
    });
  }
}
