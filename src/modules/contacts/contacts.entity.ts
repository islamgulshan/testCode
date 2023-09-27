import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ContactDto } from './commons/contacts.dtos';
import moment from 'moment';

@Entity({
  name: 'contacts',
})
export class Contacts {
  @PrimaryGeneratedColumn()
  contactId: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  country: string;

  @Column({ length: 255 })
  phoneNumber: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: moment().unix() })
  date: number;

  @Column({ default: false })
  isRead: boolean;

  fromDto(payload: ContactDto): Contacts {
    this.name = payload.name;
    this.email = payload.email;
    this.country = payload.country;
    this.phoneNumber = payload.phoneNumber;
    this.message = payload.message;
    this.date = moment().unix();
    return this;
  }
}
