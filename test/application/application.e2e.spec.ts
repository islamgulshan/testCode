import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Helper } from '../helper';
import request from 'supertest';
import { AppModule } from '../../src/modules/main/app.module';
import { ResponseMessage } from '../../src/utils/enum';
import { AppService } from '../../src/modules/main/app.service';
import { LoggerService } from '../../src/utils/logger/logger.service';
import { LoggerMock } from '../mocks/mocks';

describe('Application test', () => {
  let app: INestApplication;
  let helper: Helper;
  let server: any;
  let application_id: string;
  let job_id: string;

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
    helper = new Helper(app);
    server = app.getHttpServer();
    await AppService.startup();
    await helper.init();
  });

  it(`Test Job POST API`, async () => {
    await request(server)
      .post('/api/job')
      .set('Authorization', helper.getAccessToken())
      .field('job_title', 'SE')
      .field('job_type', 'Contract')
      .field('location', 'Islamabad, Pakistan')
      .field('salary_range[low]', '50000')
      .field('salary_range[high]', '100000')
      .field('experience_required', '5 years')
      .field('last_date', '1958131313')
      .field('requirement', 'xyz')
      .field('description', 'abc')
      .attach('image', `${__dirname}/testContent/cartoon.png`)
      .expect(201)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.CREATED_SUCCESSFULLY);
        job_id = body.data.uuid;
      });
  });

  it(`Test Application POST API`, async () => {
    await request(server)
      .post('/api/application')
      .set('Authorization', helper.getAccessToken())
      .field('name', 'MTalha')
      .field('email', 'mtalha@gmail.com')
      .field('phone', '+923352700381')
      .field('country', 'Pakistan')
      .field('positionId', job_id)
      .attach('cv', `${__dirname}/testContent/cv.pdf`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.CREATED_SUCCESSFULLY);
        expect(body.data.uuid).toBeDefined();
        application_id = body.data.uuid;
      });
    expect(server).toBeDefined();
  });

  it(`Test Application GET API`, async () => {
    const ExpectedResponse = {
      applications: [
        {
          name: 'MTalha',
          email: 'mtalha@gmail.com',
          phone: '+923352700381',
          uuid: application_id,
          isRead: false,
          job_title: 'SE',
        },
      ],
      total_records: 1,
      total_pages: 1,
    };
    await request(server)
      .get('/api/application')
      .set('Authorization', helper.getAccessToken())
      .expect(200)

      .expect(({ body }) => {
        const { date, ...respose } = body.data.applications[0];
        body.data.applications[0] = respose;
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
        expect(body.data).toEqual(ExpectedResponse);
      });
    expect(server).toBeDefined();
  });

  it(`Test Application /cv/:id GET API`, async () => {
    await request(server)
      .get('/api/application/cv/' + application_id)
      .set('Authorization', helper.getAccessToken())
      .expect(200);
  });

  it(`Test Application /dashboard/statistics API`, async () => {
    const expectData = {
      total_applications: 1,
      read_applications: 1,
      unread_applications: 0,
    };
    await request(server)
      .get('/api/application/dashboard/statistics')
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
