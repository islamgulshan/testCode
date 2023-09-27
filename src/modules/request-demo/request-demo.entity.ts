import { WhiteLabelProduct } from '../../modules/white-lable-product/white-label-product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: `request_demos` })
export class RequestDemo {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ default: false })
  isEmailVerify: boolean;

  @Column({ length: 75, nullable: true })
  phone: string;

  @Column({ default: false })
  isPhoneVerify: boolean;

  @ManyToOne(() => WhiteLabelProduct, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wlProductId' })
  wlProductId: WhiteLabelProduct;
}
