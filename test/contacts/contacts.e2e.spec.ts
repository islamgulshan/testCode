import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Helper } from '../helper';
import request from 'supertest';
import { AppModule } from '../../src/modules/main/app.module';
import { ResponseMessage } from '../../src/utils/enum';
import { AppService } from '../../src/modules/main/app.service';
import { MailService } from '../../src/utils/mailer/mail.service';
import { LoggerMock, MailerMock } from '../mocks/mocks';
import { LoggerService } from '../../src/utils/logger/logger.service';

describe('Admin auth test', () => {
  let app: INestApplication;
  let helper: Helper;
  let server: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LoggerService)
      .useValue(LoggerMock)
      .overrideProvider(MailService)
      .useValue(MailerMock)
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    server = app.getHttpServer();
    await AppService.startup();
    helper = new Helper(app);
    await helper.init();
  });

  it(`Test Contact /add API`, async () => {
    const data = {
      name: 'testing',
      email: 'testingsite@yopmail.com',
      phoneNumber: '+923333333333',
      country: 'Pakistan',
      message: 'test',
    };
    await request(server)
      .post('/api/contacts/add')
      .send(data)
      .expect(201)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.MESSAGE_SENT_SUCCESFULLY);
      });
  });

  it(`Test Contact /contact_list API`, async () => {
    const expectData = [
      {
        name: 'testing',
        email: 'testingsite@yopmail.com',
        phoneNumber: '+923333333333',
        country: 'Pakistan',
        isRead: false,
        message: 'test',
        contactId: 1,
      },
    ];
    await request(server)
      .get('/api/contacts/contact_list?search=testing')
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        const { date, ...respose } = body.data.contacts[0];
        body.data.contacts[0] = respose;
        expect(body.data.contacts).toEqual(expectData);
      });
  });

  it(`Test Contact /:id GET API`, async () => {
    const expectData = {
      name: 'testing',
      email: 'testingsite@yopmail.com',
      phoneNumber: '+923333333333',
      country: 'Pakistan',
      message: 'test',
      isRead: false,
      contactId: 1,
    };

    await request(server)
      .get('/api/contacts/1')
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        const { date, ...respose } = body.data;
        expect(respose).toEqual(expectData);
      });
  });

  it(`Test Contact /dashboard/statistics API`, async () => {
    const expectData = {
      total_contacts: 1,
      read_contacts: 1,
      unread_contacts: 0,
    };
    await request(server)
      .get('/api/contacts/dashboard/statistics')
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toEqual(expectData);
      });
  });

  afterAll(async () => {
    await helper.clearDB();
    await app.close();
  });
});
