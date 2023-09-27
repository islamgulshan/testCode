import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhiteLabelProduct } from './white-label-product.entity';
import { WhiteLabelProductService } from './white-label-product.service';

@Module({
  imports: [TypeOrmModule.forFeature([WhiteLabelProduct])],
  exports: [WhiteLabelProductService],
  providers: [WhiteLabelProductService],
})
export class WhiteLabelModule {}
