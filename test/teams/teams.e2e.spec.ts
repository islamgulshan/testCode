import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Helper } from '../helper';
import request from 'supertest';
import { AppModule } from '../../src/modules/main/app.module';
import { AppService } from '../../src/modules/main/app.service';
import { MailService } from '../../src/utils/mailer/mail.service';
import { LoggerMock, MailerMock } from '../mocks/mocks';
import { LoggerService } from '../../src/utils/logger/logger.service';
import moment from 'moment';
import { ResponseMessage } from '../../src/utils/enum';

describe('Admin team test', () => {
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

  it(`Test Team /add API`, async () => {
    const data = { permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
    await request(server)
      .put('/api/admin/role_permission/2')
      .set('Authorization', helper.getAccessToken())
      .send(data)
      .expect(200);
  });

  it(`Test Team /add API`, async () => {
    const data = {
      name: 'testing',
      email: 'testingsite@yopmail.com',
      designation: 'web',
      address: 'Pakistan',
      country: 'Pakistan',
      phoneNumber: '+923333333333',
      cnic: '22401-8809734-4',
      gender: 'male',
      religion: 'islam',
      linkedin: 'https://www.linkedin.com/',
      teamId: 1,
      exit_date: null,
    };
    await request(server)
      .post('/api/teams/add')
      .set('Authorization', helper.getAccessToken())
      .field('name', 'testing')
      .field('email', 'testingsite@yopmail.com')
      .field('phoneNumber', '+923333333333')
      .field('country', 'Pakistan')
      .field('designation', 'web')
      .field('address', 'Pakistan')
      .field('cnic', '22401-8809734-4')
      .field('gender', 'male')
      .field('religion', 'islam')
      .field('linkedin', 'https://www.linkedin.com/')
      .field('joining_date', moment().unix())
      .attach('profileImage', `${__dirname}/testContent/cartoon.png`)
      .expect(201)
      .expect(({ body }) => {
        const profileImage = body.data.profileImage;
        const joining_date = body.data.joining_date;
        const values = {
          profileImage: profileImage,
          joining_date: joining_date,
          admin_id: body.data.admin_id,
          ...data,
        };
        expect(body.message).toEqual(ResponseMessage.CREATED_SUCCESSFULLY);
        expect(body.data).toEqual(values);
      });
  });

  it(`Test Team /teams_list API`, async () => {
    const expectTeams = [
      {
        name: 'testing',
        email: 'testingsite@yopmail.com',
        designation: 'web',
        phoneNumber: '+923333333333',
        profileImage: '',
        teamId: 1,
      },
    ];
    await request(server)
      .get('/api/teams/teams_list?search=test')
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        expectTeams[0].profileImage = body.data.teams[0].profileImage;
        expect(body.data.teams).toEqual(expectTeams);
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
      });
  });

  it(`Test Team /:id PATCH API`, async () => {
    await request(server)
      .patch('/api/teams/1')
      .set('Authorization', helper.getAccessToken())
      .field('name', 'test')
      .field('email', 'testingsite@yopmail.com')
      .field('phoneNumber', '+923333333333')
      .field('country', 'Pakistan')
      .field('designation', 'web')
      .field('address', 'Pakistan')
      .field('cnic', '22401-8809734-0')
      .field('gender', 'male')
      .field('religion', 'islam')
      .field('linkedin', 'https://www.linkedin.com/login')
      .field('joining_date', moment().unix())
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
      });
  });

  it(`Test Team /:id GET API`, async () => {
    const data = {
      email: 'testingsite@yopmail.com',
      designation: 'web',
      address: 'Pakistan',
      country: 'Pakistan',
      phoneNumber: '+923333333333',
      gender: 'male',
      religion: 'islam',
      exit_date: null,
    };
    await request(server)
      .get('/api/teams/1')
      .set('Authorization', helper.getAccessToken())
      .expect(({ body }) => {
        const values = {
          profileImage: body.data.profileImage,
          joining_date: body.data.joining_date,
          teamId: body.data.teamId,
          linkedin: body.data.linkedin,
          name: body.data.name,
          cnic: body.data.cnic,
          admin_id: body.data.admin_id,
          ...data,
        };
        expect(body.data).toEqual(values);
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
      });
  });

  it(`Test Teams /dashboard/statistics API`, async () => {
    const expectData = {
      totalMembers: 1,
      activeMembers: 1,
      inactiveMembers: 0,
    };
    await request(server)
      .get('/api/teams/dashboard/statistics')
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
