import { Inject, Injectable, CACHE_MANAGER } from '@nestjs/common';
import { Cache, CachingConfig } from 'cache-manager';
import { EXPIRES, PREFIXES } from './commons/cache-manager.enums';
import { generateOTP } from '../../utils/helper';

@Injectable()
export class CacheManagerService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  /**
   * Get value by key from cache manager
   *
   * @param key
   * @return value | undefined
   */
  async get(key: string): Promise<string | undefined> {
    return await this.cacheManager.get(key);
  }

  /**
   * Delete value by key in cache manager
   *
   * @param key
   * @return
   */
  async del(key: string): Promise<any> {
    await this.cacheManager.del(key);
  }

  /**
   * Set key value pair in cache manager
   *
   * @param  key: string,
   * @param value: string,
   * @param options?: CachingConfig,
   * @return
   */
  async set(
    key: string,
    value: string,
    options?: CachingConfig,
  ): Promise<string> {
    return await this.cacheManager.set(key, value, options);
  }

  /**
   * Set OTP against email in cache manager
   *
   * @param email
   * @param ttl time to live
   * @return otp
   */
  async setOTP(
    email: string,
    productId: string,
    ttl = EXPIRES.OTP,
  ): Promise<string> {
    const otp = generateOTP();
    await this.set(`${PREFIXES.OTP}${productId}${email}`, otp.toString(), {
      ttl,
    });
    return otp.toString();
  }

  /**
   * Generate Token in cache manager
   *
   * @param email
   * @param ttl time to live
   * @return otp
   */
  async generateToken(
    reqID: string,
    email: string,
    ttl = EXPIRES.TOKEN_24HOURS,
  ): Promise<string> {
    const otp = generateOTP();
    await this.set(`${PREFIXES.DEMO_TOKEN}${reqID}${email}`, otp.toString(), {
      ttl,
    });
    return otp.toString();
  }

  /**
   * getToken in cache manager
   *
   * @param email
   * @param ttl time to live
   * @return otp
   */
  async getTokenData(reqID: string, email: string): Promise<string> {
    return await this.get(`${PREFIXES.DEMO_TOKEN}${reqID}${email}`);
  }

  /**
   * Get OTP by email from cache manager
   *
   * @param email
   * @return email
   */
  async getOTP(email: string, productId: string): Promise<string> {
    return await this.get(`${PREFIXES.OTP}${productId}${email}`);
  }

  /**
   * Delete OTP  by email from cache manager
   *
   * @param email
   * @return void
   */
  async deleteOTP(email: string) {
    await this.del(`${PREFIXES.OTP}${email}`);
  }

  /**
   * Set token against an email in cache manager
   *
   * @returns
   * @param email
   * @param token
   * @param prefix
   */
  async setToken(email: string, token: string, prefix: PREFIXES) {
    const enumKey = Object.keys(PREFIXES).find(
      (key) => PREFIXES[key] === prefix,
    );
    const ttl = EXPIRES[enumKey];
    await this.set(`${prefix}${email}`, token, { ttl });
  }

  /**
   * Get token against by email from cache manager
   *
   * @returns
   * @param email
   * @param prefix
   */
  async getToken(email: string, prefix: PREFIXES): Promise<string> {
    return await this.get(`${prefix}${email}`);
  }

  /**
   * Delete token against by email from cache manager
   *
   * @returns
   * @param email
   * @param prefix
   */
  async delToken(email: string, prefix: PREFIXES) {
    await this.del(`${prefix}${email}`);
  }
}
