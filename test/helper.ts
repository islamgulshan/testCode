import { INestApplication } from '@nestjs/common';
import { getConnection } from 'typeorm';
import request from 'supertest';
import { User } from '../src/modules/user';
import { WhiteLabelProduct } from '../src/modules/white-lable-product/white-label-product.entity';

export class Helper {
  private app: INestApplication;
  private token: string;

  constructor(app: INestApplication) {
    this.app = app;
  }

  /**
   * Initialize testsuite
   * @returns accessToken
   */
  public async init() {
    const email = `testuser@yopmail.com`;
    const repository = getConnection().getRepository(User);
    const exists = await repository.findOne({ email });
    if (!exists) {
      await this.register();
    }
    await this.login(email, 'aPass12d@');
    return this.token;
  }

  /**
   * addProduct
   */
  public async addProduct(): Promise<WhiteLabelProduct> {
    let whiteLabelProduct = new WhiteLabelProduct();
    whiteLabelProduct.name = 'product 1';
    whiteLabelProduct.demoURL = 'test 1';
    let whiteLabelProductReposity =
      getConnection().getRepository(WhiteLabelProduct);
    return await whiteLabelProductReposity.save(whiteLabelProduct);
  }

  /**
   * Register a test user
   * @returns
   */
  public async register() {
    const testUserDto = {
      firstName: 'test',
      lastName: 'user',
      email: 'testuser@yopmail.com',
      country: 'Pakistan',
      phoneNumber: '+923333333333',
      password: 'aPass12d@',
      passwordConfirmation: 'aPass12d@',
      role_id: '1',
    };

    await request(this.app.getHttpServer())
      .post('/api/admin/auth/register')
      .send(testUserDto)
      .expect(201);
    return;
  }

  /**
   * Get Jwt Token of User
   * @returns JwtToken
   */
  public getAccessToken() {
    return `Bearer ${this.token}`;
  }

  /**
   * Login a test user
   * @returns
   */
  public async login(mail: string, pass: string) {
    const testUserDto = {
      email: mail,
      password: pass,
    };
    await request(this.app.getHttpServer())
      .post('/api/admin/auth/login')
      .send(testUserDto)
      .expect(201)
      .expect(({ body }) => {
        expect(body.accessToken).toBeDefined();
        this.token = body.accessToken;
      });
  }

  /**
   * clear `test` database
   */
  public async clearDB() {
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = getConnection().getRepository(entity.name);
      await repository.query(
        `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
      );
    }
  }
}
