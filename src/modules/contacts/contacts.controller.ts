import { ContactsService } from './contacts.service';
import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { LoggerMessages, ResponseCode, ResponseMessage } from '../../utils/enum';
import { LoggerService } from '../../utils/logger/logger.service';
import { ContactDto } from './commons/contacts.dtos';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { Pagination } from '../../utils/paginate';
import { PermissionsGuard } from './../user/guards/permissions.guard';

@Controller('api/contacts')
export class ContactsController {
  constructor(
    private readonly ContactsService: ContactsService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('ContactsController');
  }

  @Post('add')
  public async contactsAdd(
    @Body() payload: ContactDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    this.loggerService.log(`POST Contacts /add ${LoggerMessages.API_CALLED}`);
    const contact = await this.ContactsService.contactsAdd(payload);
    return res.status(ResponseCode.CREATED_SUCCESSFULLY).send({
      statusCode: ResponseCode.CREATED_SUCCESSFULLY,
      message: ResponseMessage.MESSAGE_SENT_SUCCESFULLY,
      data: contact,
    });
  }

  @Get('contact_list')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  public async contactsList(
    @Query() query: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.loggerService.log(
      `GET contacts /contact_list ${LoggerMessages.API_CALLED}`,
    );
    const pagination: IPaginationOptions = await Pagination.paginate(req, res);
    const contactsList = await this.ContactsService.contactsList(
      query,
      pagination,
    );
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: contactsList,
    });
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  public async contactsDetail(
    @Param('id') contactId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.loggerService.log(`GET Contacts /:id ${LoggerMessages.API_CALLED}`);
    const contact = await this.ContactsService.contactsDetail(contactId);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: contact,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/dashboard/statistics')
  public async getContactStatistics(@Req() req: Request, @Res() res: Response) {
    this.loggerService.log(
      `GET Contact /dashboard/statistics ${LoggerMessages.API_CALLED}`,
    );
    const data = await this.ContactsService.getContactStatistics();
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      data: data,
      message: ResponseMessage.SUCCESS,
    });
  }
}
