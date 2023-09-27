import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, getManager, IsNull, Not, Repository } from 'typeorm';
import { Teams } from './teams.entity';
import { TeamsDto } from './commons/teams.dtos';
import { ResponseCode, ResponseMessage } from '../../utils/enum';
import path, { extname } from 'path';
import { isPositiveInteger } from '../../utils/methods';
import * as fs from 'fs';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Teams)
    private readonly teamsRepository: Repository<Teams>,
  ) {
  }

  static fileFilter(req, file: Express.Multer.File, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.split('/')[0] === 'image') {
      if (!ext.match(/.(jpg|png|jpeg)$/)) {
        callback(new BadRequestException('Only images are allowed'), false);
      }
      callback(null, true);
    } else {
      callback(
        new BadRequestException(
          'Invalid File Format. Please select image file for relevant fields.',
        ),
        false,
      );
    }
  }

  static editFileName(req, file: Express.Multer.File, callback) {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = Array(4)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    callback(null, `${name}-${randomName}${fileExtName}`);
  }

  /**
   * Admin Teams List
   * @param query
   * @returns teams with pagination
   */
  public async teamsList(query: any, paginationOption: IPaginationOptions) {
    const limit = Number(paginationOption.limit);
    const page = Number(paginationOption.page);
    let filter = `where 1=1`;
    if (query.search) {
      filter += ` AND  
                  ( "name" like '%${query.search}%' OR 
                    "email" like '%${query.search}%' OR 
                    "phoneNumber" like '%${query.search}%' OR 
                    "designation" like'%${query.search}%'  
                  )`;
    }
    const sql = `SELECT 
                  t."name",
                  t."email", 
                  t."designation", 
                  t."phoneNumber", 
                  t."teamId",
                  t."profileImage"
                FROM 
                  teams t
                  ${filter} 
                ORDER BY t."teamId" DESC LIMIT $1 OFFSET $2`;
    const teams = await getManager().query(sql, [limit, limit * (page - 1)]);
    const total_sql = `SELECT  
                        COUNT(*) as total_teams 
                      FROM 
                        teams 
                        ${filter}`;
    const totalTeams = await getManager().query(total_sql);
    if (!teams.length) {
      throw new HttpException(
        ResponseMessage.CONTENT_NOT_FOUND,
        ResponseCode.CONTENT_NOT_FOUND,
      );
    }
    return {
      teams,
      totalTeams: Number(totalTeams[0].total_teams),
    };
  }

  public async teamListAggregate(paginationOption: IPaginationOptions) {
    const condition = { exit_date: IsNull() };
    return await this.paginate(paginationOption, condition);
  }

  /**
   * Add Team Api
   * @param payload
   * @returns Team
   */
  public async teamAdd(
    payload: TeamsDto,
    profileImage: Express.Multer.File,
    adminUUID: string,
  ): Promise<Teams> {
    payload.profileImage = profileImage.filename;
    payload.admin_id = adminUUID;
    const newMember = new Teams().fromDto(payload);
    const teamExist = await this.teamsRepository.findOne({
      email: payload.email,
    });
    if (teamExist) {
      throw new HttpException(
        ResponseMessage.TEAM_MEMEBER_ALREADY_EXIST,
        ResponseCode.BAD_REQUEST,
      );
    }
    const member = await this.teamsRepository.save(newMember);
    return member;
  }

  /**
   * Team memeber Detail Api
   * @param teamId
   * @returns teamMember
   */
  public async teamsDetail(id: number): Promise<Teams> {
    const validateInt = isPositiveInteger(id.toString());
    if (!validateInt) {
      throw new HttpException(
        `Query Param id ${ResponseMessage.IS_INVALID}`,
        ResponseCode.BAD_REQUEST,
      );
    }
    const teamMember = await this.teamsRepository.findOne(id);
    if (!teamMember) {
      throw new HttpException(
        `Team member ${ResponseMessage.DOES_NOT_EXIST}`,
        ResponseCode.NOT_FOUND,
      );
    }
    return teamMember;
  }

  /**
   * Edit Team member Api
   * @param payload
   * @returns Team
   */
  public async teamEdit(
    payload: TeamsDto,
    profileImage: Express.Multer.File,
    adminUUID: string,
    teamId: number,
  ) {
    const memberExist = await this.teamsRepository.findOne(teamId);
    if (!memberExist) {
      throw new HttpException(
        `Team member ${ResponseMessage.DOES_NOT_EXIST}`,
        ResponseCode.NOT_FOUND,
      );
    }
    const duplicate = await this.teamsRepository.findOne({
      teamId: Not(teamId),
      email: Equal(payload.email),
    });
    if (duplicate) {
      throw new HttpException(
        `Team member ${ResponseMessage.TEAM_MEMEBER_ALREADY_EXIST}`,
        ResponseCode.BAD_REQUEST,
      );
    }
    payload.admin_id = adminUUID;
    payload.profileImage = memberExist.profileImage;
    if (profileImage) {
      try {
        payload.profileImage = profileImage.filename;
        fs.unlinkSync('uploads/' + memberExist.profileImage);
      } catch (err) {
        console.error(err);
      }
    }
    const memberEdit = new Teams().fromDto(payload);
    return await this.teamsRepository.update({ teamId }, memberEdit);
  }

  /**
   * Get Team Statistics
   * @returns totalMembers, activeMembers, inactiveMembers
   */
  public async getTeamsStatistics() {
    const totalMembers = await this.teamsRepository.count();
    const activeMembers = await this.teamsRepository.count({
      where: { exit_date: null },
    });
    const inactiveMembers = await this.teamsRepository.count({
      where: { exit_date: Not(IsNull()) },
    });
    return {
      totalMembers: totalMembers,
      activeMembers: activeMembers,
      inactiveMembers: inactiveMembers,
    };
  }

  /**
   * Paginate Staff list
   * @param options
   * @param condition
   * @param relations
   * @returns
   */
  private async paginate(
    options: IPaginationOptions,
    condition?: Object,
    relations?: string[],
  ): Promise<Pagination<Teams>> {
    return paginate<Teams>(this.teamsRepository, options, {
      where: condition,
    });
  }
}
