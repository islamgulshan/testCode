import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Helper } from '../helper';
import request from 'supertest';
import { AppModule } from '../../src/modules/main/app.module';
import { ResponseMessage } from '../../src/utils/enum';
import { AppService } from '../../src/modules/main/app.service';
import { generateToken } from 'authenticator';
import { LoggerService } from '../../src/utils/logger/logger.service';
import { LoggerMock } from '../mocks/mocks';

describe('Admin auth test', () => {
  let app: INestApplication;
  let helper: Helper;
  let server: any;
  let code: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LoggerService)
      .useValue(LoggerMock)
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    server = app.getHttpServer();
    await AppService.startup();
    helper = new Helper(app);
    await helper.init();
  });

  it(`Test Admin /change_password API`, async () => {
    const data = {
      currentPassword: 'aPass12d@',
      password: 'aPass12d@ssAd',
      passwordConfirmation: 'aPass12d@ssAd',
    };

    await request(server)
      .post('/api/admin/change_password')
      .set('Authorization', helper.getAccessToken())
      .send(data)
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.PASSWORD_CHANGE_SUCCESS);
      });
  });

  it(`Test Admin /get_2fa_authentication API`, async () => {
    await request(server)
      .get('/api/admin/get_2fa_authentication')
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        code = generateToken(body.data.key);
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
      });
  });

  it(`Test Admin /toggle_2fa API`, async () => {
    const data = {
      code: `${code}`,
    };
    await request(server)
      .post('/api/admin/toggle_2fa')
      .send(data)
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
      });
    expect(server).toBeDefined();
  });

  it(`Test Admin /profile API`, async () => {
    const ExpectedResponse = {
      firstName: 'test',
      lastName: 'user',
      email: 'testuser@yopmail.com',
      country: 'Pakistan',
      phoneNumber: '+923333333333',
      roleId: 1,
      profileImage: null,
      Role: {
        roleId: 1,
        roleName: 'Super Admin',
      },
    };
    await request(server)
      .get('/api/admin/profile')
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        const values = {
          created_at: body.data.created_at,
          uuid: body.data.uuid,
          ...ExpectedResponse,
        };
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
        expect(body.data).toEqual(values);
      });
  });

  it(`Test admin /roles `, async () => {
    await request(server)
      .get('/api/admin/roles')
      .set('Authorization', helper.getAccessToken())
      .expect(({ body }) => {
        expect(body.statusCode).toEqual(200);
      });
  });

  it(`Test Admin /profile_picture API`, async () => {
    await request(server)
      .get('/api/admin/profile_picture')
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.CONTENT_NOT_FOUND);
      });
    expect(server).toBeDefined();
  });

  it(`Test Admin /update_profile API`, async () => {
    const data = {
      firstName: 'test',
      lastName: 'user',
      email: 'testuser@yopmail.com',
      country: 'Pakistan',
      phoneNumber: '+923333333333',
    };

    await request(server)
      .put('/api/admin/update_profile')
      .set('Authorization', helper.getAccessToken())
      .send(data)
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.UPDATED_SUCCESSFULLY);
      });
    expect(server).toBeDefined();
  });

  it(`Test Admin /update_profile_picture API`, async () => {
    await request(server)
      .put('/api/admin/update_profile_picture')
      .set('Authorization', helper.getAccessToken())
      .attach('image', `${__dirname}/testContent/cartoon.png`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.UPDATED_SUCCESSFULLY);
      });
  });

  it(`Test /me user info`, async () => {
    await request(server)
      .get('/api/admin/me')
      .set('Authorization', helper.getAccessToken())
      .expect(({ body }) => {
        expect(body.statusCode).toEqual(200);
        expect(body.data).toBeDefined();
      });
  });

  afterAll(async () => {
    await helper.clearDB();
    await app.close();
  });
});
