import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getManager, Repository } from 'typeorm';
import { Contacts } from './contacts.entity';
import { ResponseCode, ResponseMessage } from '../../utils/enum';
import { ContactDto } from './commons/contacts.dtos';
import { MailService } from '../../utils/mailer/mail.service';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contacts)
    private readonly contactsRepository: Repository<Contacts>,
    private readonly mailerservice: MailService,
  ) {
  }

  /**
   * Admin Contact List
   * @param query
   * @returns Contact with pagination
   */
  public async contactsList(query: any, paginationOption: IPaginationOptions) {
    const limit = Number(paginationOption.limit);
    const page = Number(paginationOption.page);
    let filter = `where 1=1`;
    if (query.search) {
      filter += ` AND  
                  ( "name" like '%${query.search}%' OR 
                    "email" like '%${query.search}%' OR 
                    "phoneNumber" like '%${query.search}%' OR 
                    "country" like'%${query.search}%'  
                  )`;
    }
    const sql = `SELECT 
                  c."name",
                  c."email", 
                  c."country", 
                  c."phoneNumber", 
                  c."isRead",
                  c."message", 
                  c."date", 
                  c."contactId"
                FROM 
                  contacts c
                  ${filter} ORDER BY c."date" DESC 
                  LIMIT $1 OFFSET $2`;
    const contacts = await getManager().query(sql, [limit, limit * (page - 1)]);
    const total_sql = `SELECT  
                        COUNT(*) as total_contacts 
                      FROM 
                        contacts 
                        ${filter}`;
    const totalContacts = await getManager().query(total_sql);
    if (!contacts.length) {
      throw new HttpException(
        ResponseMessage.CONTENT_NOT_FOUND,
        ResponseCode.CONTENT_NOT_FOUND,
      );
    }
    return {
      contacts,
      totalContacts: Number(totalContacts[0].total_contacts),
    };
  }

  /**
   * Post Contact Api
   * @param payload
   * @returns contact
   */
  public async contactsAdd(payload: ContactDto): Promise<Contacts> {
    const newContacts = new Contacts().fromDto(payload);
    const contact = await this.contactsRepository.save(newContacts);
    await this.mailerservice.sendMailContact(payload, contact);
    return contact;
  }

  /**
   * Contact Detail Api
   * @param contactId
   * @returns contact
   */
  public async contactsDetail(id: number) {
    const contact = await this.contactsRepository.findOne(id);
    await this.contactsRepository.update({ contactId: id }, { isRead: true });
    if (!contact) {
      throw new HttpException(
        `Contact ${ResponseMessage.DOES_NOT_EXIST}`,
        ResponseCode.NOT_FOUND,
      );
    }
    return contact;
  }

  /**
   * Get Contact Statistics
   * @returns total_contacts, read_contacts, unread_contacts
   */
  public async getContactStatistics() {
    const total_contacts = await this.contactsRepository.count();
    const unread_contacts = await this.contactsRepository.count({
      where: { isRead: false },
    });
    const read_contacts = await this.contactsRepository.count({
      where: { isRead: true },
    });

    return {
      total_contacts: total_contacts,
      read_contacts: read_contacts,
      unread_contacts: unread_contacts,
    };
  }
}
