import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhiteLabelProduct } from './white-label-product.entity';
import { ResponseCode, ResponseMessage } from '../../utils/enum';

@Injectable()
export class WhiteLabelProductService {
  constructor(
    @InjectRepository(WhiteLabelProduct)
    private readonly whiteLabelProductRepository: Repository<WhiteLabelProduct>,
  ) {}

  /**
   * Get White-label Product by slog
   *
   * @param slog
   * @returns
   */
  async getProductBySlug(slug: string): Promise<WhiteLabelProduct> {
    const product = await this.whiteLabelProductRepository.findOne({ slug });
    if (!product) {
      throw new HttpException(
        {
          statusCode: ResponseCode.PRODUCT_ID_NOT_EXIST,
          message: ResponseMessage.PRODUCT_ID_NOT_EXIST,
        },
        ResponseCode.BAD_REQUEST,
      );
    }
    return product;
  }
}
