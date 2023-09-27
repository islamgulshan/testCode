import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Helper } from '../helper';
import request from 'supertest';
import { AppModule } from '../../src/modules/main/app.module';
import { AppService } from '../../src/modules/main/app.service';
import { MailService } from '../../src/utils/mailer/mail.service';
import { LoggerMock, MailerMock } from '../mocks/mocks';
import { LoggerService } from '../../src/utils/logger/logger.service';
import { ResponseMessage } from '../../src/utils/enum';

describe('Admin Staff test', () => {
  let app: INestApplication;
  let helper: Helper;
  let server: any;
  let verifyCode: number;
  let staffUUid: string;

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

  it(`Test Admin /add_staff_member API`, async () => {
    const data = {
      email: 'testingsite@yopmail.com',
      roleId: '1',
    };
    await request(server)
      .post('/api/admin/add_staff_member')
      .set('Authorization', helper.getAccessToken())
      .send(data)
      .expect(201)
      .expect(({ body }) => {
        verifyCode = body.data.code;
        expect(body.message).toEqual(ResponseMessage.CREATED_SUCCESSFULLY);
      });
  });

  it(`Test GET Admin /verify_staff_email API`, async () => {
    const data = {
      email: 'testingsite@yopmail.com',
      roleId: 1,
    };
    await request(server)
      .get(`/api/admin/verify_staff_email?role=1&code=${verifyCode}`)
      .expect(200)
      .expect(({ body }) => {
        const values = {
          created_at: body.data.created_at,
          ...data,
        };
        expect(body.data).toEqual(values);
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
      });
  });

  it(`Test POST Admin /register API`, async () => {
    const data = {
      firstName: 'test',
      lastName: 'user',
      email: 'testsfff@yopmail.com',
      country: 'Pakistan',
      phoneNumber: '+923333333333',
      password: 'aPass12d@',
      passwordConfirmation: 'aPass12d@',
      role_id: '2',
    };
    const expected = {
      firstName: 'test',
      lastName: 'user',
      email: 'testsfff@yopmail.com',
      phoneNumber: '+923333333333',
      country: 'Pakistan',
      roleId: 2,
      profileImage: null,
      twoFA: false,
      twoFaKey: null,
    };
    await request(server)
      .post('/api/admin/auth/register')
      .send(data)
      .expect(201)
      .expect(({ body }) => {
        staffUUid = body.data.uuid;
        const values = {
          uuid: body.data.uuid,
          created_at: body.data.created_at,
          ...expected,
        };
        expect(body.data).toEqual(values);
        expect(body.message).toEqual(ResponseMessage.CREATED_SUCCESSFULLY);
      });
  });

  it(`Test GET Admin /staff_list API`, async () => {
    await request(server)
      .get('/api/admin/staff_list')
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
      });
  });

  it(`Test GET Admin /detail/:id API`, async () => {
    const expected = {
      firstName: 'test',
      lastName: 'user',
      email: 'testsfff@yopmail.com',
      roleId: 2,
      country: 'Pakistan',
      phoneNumber: '+923333333333',
      twoFA: false,
      twoFaKey: null,
      Role: {
        roleId: 2,
        roleName: 'Admin',
      },
    };
    await request(server)
      .get(`/api/admin/detail/${staffUUid}`)
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        const values = {
          created_at: body.data.created_at,
          uuid: body.data.uuid,
          profileImage: body.data.profileImage,
          ...expected,
        };
        expect(body.data).toEqual(values);
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
      });
  });

  it(`Test PATCH Admin /:id API`, async () => {
    const data = {
      roleId: '1',
      email: 'testsfff@yopmail.com',
    };
    await request(server)
      .patch(`/api/admin/${staffUUid}`)
      .set('Authorization', helper.getAccessToken())
      .send(data)
      .expect(200)
      .expect(({ body }) => {
        expect(1).toEqual(body.data.affected);
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
      });
  });

  it(`Test GET Admin /permissions API`, async () => {
    await request(server)
      .get(`/api/admin/permissions`)
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
      });
  });

  it(`Test GET Admin /permission_list/:roleId API`, async () => {
    await request(server)
      .get(`/api/admin/permission_list`)
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
      });
  });

  it(`Test GET Admin /role_permission/:roleId API`, async () => {
    await request(server)
      .get(`/api/admin/role_permission/1`)
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
        expect(body.data).toEqual(ResponseMessage.ALL_PERMISSIONS);
      });
  });

  afterAll(async () => {
    await helper.clearDB();
    await app.close();
  });
});
