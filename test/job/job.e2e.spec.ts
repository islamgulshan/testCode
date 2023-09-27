import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Helper } from '../helper';
import request from 'supertest';
import { AppModule } from '../../src/modules/main/app.module';
import { ResponseMessage } from '../../src/utils/enum';
import { AppService } from '../../src/modules/main/app.service';
import { LoggerService } from '../../src/utils/logger/logger.service';
import { LoggerMock } from '../mocks/mocks';

describe('Job test', () => {
  let app: INestApplication;
  let helper: Helper;
  let server: any;
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

  it(`Test Job GET API`, async () => {
    const ExpectedResponse = {
      items: [
        {
          description: 'abc',
          experience_required: '5 years',
          job_title: 'SE',
          job_type: 'Contract',
          last_date: 1958131313,
          location: 'Islamabad, Pakistan',
          requirement: 'xyz',
          salary_range: { high: '100000', low: '50000' },
        },
      ],
      meta: {
        currentPage: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalItems: 1,
        totalPages: 1,
      },
    };
    await request(server)
      .get('/api/job')
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        const { uuid, image, created_at, updated_at, ...items } =
          body.data.jobs.items[0];
        body.data.jobs.items[0] = items;
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
        expect(body.data.jobs).toEqual(ExpectedResponse);
      });
    expect(server).toBeDefined();
  });

  it(`Test Job /active GET API`, async () => {
    const ExpectedResponse = {
      items: [
        {
          description: 'abc',
          experience_required: '5 years',
          job_title: 'SE',
          job_type: 'Contract',
          last_date: 1958131313,
          location: 'Islamabad, Pakistan',
          requirement: 'xyz',
          salary_range: { high: '100000', low: '50000' },
        },
      ],
      meta: {
        currentPage: 1,
        itemCount: 1,
        itemsPerPage: 10,
        totalItems: 1,
        totalPages: 1,
      },
    };
    await request(server)
      .get('/api/job/active')
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        const { uuid, image, created_at, updated_at, ...items } =
          body.data.jobs.items[0];
        body.data.jobs.items[0] = items;
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
        expect(body.data.jobs).toEqual(ExpectedResponse);
      });
  });

  it(`Test Job/:id GET API`, async () => {
    const ExpectedResponse = {
      job_title: 'SE',
      job_type: 'Contract',
      location: 'Islamabad, Pakistan',
      salary_range: { high: '100000', low: '50000' },
      experience_required: '5 years',
      last_date: 1958131313,
      description: 'abc',
      requirement: 'xyz',
    };
    await request(server)
      .get('/api/job/' + job_id)
      .set('Authorization', helper.getAccessToken())
      .expect(200)
      .expect(({ body }) => {
        const { uuid, image, created_at, updated_at, ...respose } = body.data;
        expect(body.message).toEqual(ResponseMessage.SUCCESS);
        expect(respose).toEqual(ExpectedResponse);
      });
    expect(server).toBeDefined();
  });

  it(`Test Job/:id PUT API`, async () => {
    const data = {
      job_title: 'SE',
      job_type: 'Contract',
      location: 'Islamabad, Pakistan',
      salary_range: {
        low: 5000,
        high: 10000,
      },
      experience_required: '5 years',
      last_date: 1658131313,
      description: 'abc',
      requirement: 'xyz',
    };
    await request(server)
      .put('/api/job/' + job_id)
      .set('Authorization', helper.getAccessToken())
      .field('job_title', 'SE')
      .field('job_type', 'Contract')
      .field('location', 'Islamabad, Pakistan')
      .field('salary_range[low]', 50000)
      .field('salary_range[high]', 100000)
      .field('experience_required', '5 years')
      .field('last_date', '1958131313')
      .field('requirement', 'xyz')
      .field('description', 'abc')
      .attach('image', `${__dirname}/testContent/cartoon.png`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.UPDATED_SUCCESSFULLY);
      });
    expect(server).toBeDefined();
  });

  it(`Test Job /dashboard/statistics API`, async () => {
    const expectData = {
      total_jobs: 1,
      active_jobs: 1,
      inactive_jobs: 0,
    };
    await request(server)
      .get('/api/job/dashboard/statistics')
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
