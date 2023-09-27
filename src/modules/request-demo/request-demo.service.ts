import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResponseCode, ResponseMessage } from '../../utils/enum';
import { WhiteLabelProductService } from '../../modules/white-lable-product/white-label-product.service';
import { RequestDemo } from './request-demo.entity';
import { CacheManagerService } from '../../modules/cache-manager/cache-manager.service';
import { MailService } from '../../utils/mailer/mail.service';
import {
  EmailVerificationDto,
  HeadersDto,
  verificationCodeDto,
} from './common/request-demo.dtos';

@Injectable()
export class RequestDemoService {
  constructor(
    private readonly whiteLabelProductService: WhiteLabelProductService,
    private readonly cacheManagerService: CacheManagerService,
    private readonly mailerservice: MailService,

    @InjectRepository(RequestDemo)
    private readonly requestDemoRepository: Repository<RequestDemo>,
  ) {}

  /**
   * Send verification to Email
   *
   * @param slug
   * @param email
   * @returns token
   */
  async emailVerification(slug: string, body: EmailVerificationDto) {
    let requestDemo: RequestDemo;
    try {
      let product = await this.whiteLabelProductService.getProductBySlug(slug);
      requestDemo = await this.requestDemoRepository.findOne({
        where: { email: body.email, wlProductId: product },
      });
      if (!requestDemo) {
        requestDemo = new RequestDemo();
        requestDemo.email = body.email;
        requestDemo.name = body.name;
        requestDemo.wlProductId = product;
        requestDemo = await this.requestDemoRepository.save(requestDemo);
      }
      if (requestDemo && requestDemo.isEmailVerify) {
        throw new HttpException(
          {
            statusCode: ResponseCode.EMAIL_ALREADY_VERIFIED,
            message: ResponseMessage.EMAIL_ALREADY_VERIFIED,
          },
          ResponseCode.BAD_REQUEST,
        );
      }
      const token = await this.cacheManagerService.setOTP(
        body.email,
        product.uuid,
      );
      await this.mailerservice.sendEmailVerificationCode(body.email, token);
      return token;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Verify code for Email
   *
   * @param productId
   * @param payload
   * @returns token
   */
  async verifyEmailCode(productId: string, payload: verificationCodeDto) {
    let requestDemo: RequestDemo;
    try {
      let product = await this.whiteLabelProductService.getProductBySlug(
        productId,
      );
      const otp = await this.cacheManagerService.getOTP(
        payload.email,
        product.uuid,
      );
      if (!otp?.length) {
        throw new HttpException(
          {
            statusCode: ResponseCode.VERIFICATION_CODE_EXPIRED,
            message: ResponseMessage.EMAIL_CODE_EXPIRED,
          },
          ResponseCode.BAD_REQUEST,
        );
      }
      if (otp !== payload.code) {
        throw new HttpException(
          {
            statusCode: ResponseCode.INVALID_VERIFICATION_CODE,
            message: ResponseMessage.INVALID_VERIFICATION_CODE,
          },
          ResponseCode.BAD_REQUEST,
        );
      }
      requestDemo = await this.requestDemoRepository.findOne({
        where: { email: payload.email, wlProductId: product },
      });
      if (!requestDemo) {
        throw new HttpException(
          {
            statusCode: ResponseCode.VERIFICATION_CODE_EXPIRED,
            message: ResponseMessage.EMAIL_CODE_EXPIRED,
          },
          ResponseCode.BAD_REQUEST,
        );
      }
      let token: string;
      requestDemo.isEmailVerify = true;
      await this.requestDemoRepository.save(requestDemo);
      await this.cacheManagerService.deleteOTP(payload.email);
      token = await this.cacheManagerService.generateToken(
        requestDemo.uuid,
        payload.email,
      );
      return token;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Verify Demo Link
   *
   * @param headers
   * @param productId
   * @param email
   * @returns token
   */
  async verifyDemoLink(headers: HeadersDto, productId: string, email: string) {
    try {
      let product = await this.whiteLabelProductService.getProductBySlug(
        productId,
      );
      const requestDemo = await this.requestDemoRepository.findOne({
        where: { email: email, wlProductId: product },
      });
      if (!requestDemo) {
        throw new HttpException(
          {
            statusCode: ResponseCode.VERIFICATION_CODE_EXPIRED,
            message: ResponseMessage.EMAIL_CODE_EXPIRED,
          },
          ResponseCode.BAD_REQUEST,
        );
      }
      const token = await this.cacheManagerService.getTokenData(
        requestDemo.uuid,
        email,
      );
      if (!token?.length || token !== headers.authorization) {
        throw new HttpException(
          {
            statusCode: ResponseCode.INVALID_TOKEN,
            message: ResponseMessage.INVALID_TOKEN,
          },
          ResponseCode.BAD_REQUEST,
        );
      }
      return product.demoURL;
    } catch (err) {
      throw err;
    }
  }
}
