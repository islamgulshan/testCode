import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: `white_label_products` })
export class WhiteLabelProduct {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column({ length: 255 })
  demoURL: string;
}
