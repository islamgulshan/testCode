import { BadRequestException, HttpException, Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hash } from '../../utils/Hash';
import { RegisterPayload } from './../auth/register.payload';
import { In, Repository } from 'typeorm';
import { ResponseCode, ResponseMessage } from '../../utils/enum';
import { User, UserFillableFields } from './user.entity';
import { Staff } from './staff.entity';
import { Role } from '../../modules/seed/role.entity';
import { Permission } from '../../modules/seed/permission.entity';
import { AdminDTO } from './commons/user.dtos';
import { StaffDto } from './commons/staff.dto';
import speakeasy from 'speakeasy';
import { MailService } from '../../utils/mailer/mail.service';
import { RolePermissionDto } from './commons/role_permission.dto';
import { isPositiveInteger } from '../../utils/methods';
import path, { extname } from 'path';
import { generateKey, generateToken, generateTotpUri, verifyToken } from 'authenticator';
import { isUUID } from 'class-validator';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { RolePermission } from './role_permission.entity';
import { RoleEnum } from '../seed/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    private readonly mailerservice: MailService,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
  }

  static fileFilter(req, file: Express.Multer.File, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (file.mimetype.split('/')[0] === 'image' && file.fieldname === 'image') {
      if (!ext.match(/.(jpg|png|jpeg)$/)) {
        callback(new BadRequestException('Only images are allowed'), false);
      }
      callback(null, true);
    } else if (
      file.mimetype.split('/')[0] === 'application' &&
      file.fieldname === 'cv'
    ) {
      if (!ext.match(/.(pdf)$/)) {
        callback(new BadRequestException('Only pdf are allowed'), false);
      }
      callback(null, true);
    } else {
      callback(new BadRequestException('Invalid File Format.'), false);
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

  async get(uuid: string) {
    return this.userRepository.findOne({ uuid });
  }

  async getByEmail(email: string) {
    return await this.userRepository.findOne({ email });
  }

  async getRoleById(roleId: number) {
    return await this.roleRepository.findOne({ roleId });
  }

  async create(payload: UserFillableFields) {
    const user = await this.getByEmail(payload.email);
    if (user) {
      throw new NotAcceptableException(
        `User with provided email already created.`,
      );
    }
    return await this.userRepository.save(payload);
  }

  /**
   * Create a genesis user
   * @param payload
   * @returns
   */
  async createAdmin(payload: RegisterPayload): Promise<User> {
    const user = await this.getByEmail(payload.email);
    const role = await this.getRoleById(parseInt(payload.role_id));
    if (!role) {
      throw new HttpException(
        ResponseMessage.ROLE_DOES_NOT_EXIST,
        ResponseCode.BAD_REQUEST,
      );
    }
    if (user) {
      throw new HttpException(
        ResponseMessage.USER_ALREADY_EXISTS,
        ResponseCode.BAD_REQUEST,
      );
    }
    const newUser = new User().fromDto(payload);
    newUser.password = await Hash.make(newUser.password);
    return await this.userRepository.save(newUser);
  }

  /**
   * Forget password confirmation
   * @param email
   * @param password
   * @returns
   */
  public async confirmForgotPassword(email: string, password: string) {
    const user: User = await this.userRepository.findOne({ email });
    if (user) {
      const passwordHash = await Hash.make(password);
      await this.userRepository.update({ email }, { password: passwordHash });
      return user;
    } else {
      throw new HttpException(
        ResponseMessage.USER_DOES_NOT_EXIST,
        ResponseCode.NOT_FOUND,
      );
    }
  }

  /**
   * Change Password admin
   * @param email
   * @param newPass
   * @returns
   */
  async changePassword(email: string, newPass: string, currentPassword: string): Promise<User> {
    const existingAdmin = await this.getByEmail(email);
    if ((await Hash.compare(currentPassword, existingAdmin.password)) === false) {
      throw new HttpException(
        'Current Password Does not Match',
        ResponseCode.UNAUTHORIZED,
      );
    }
    existingAdmin.password = await Hash.make(newPass);
    await this.userRepository.save(existingAdmin);
    return existingAdmin;
  }

  /**
   * Get A Admin Profile Picture
   * @param uuid
   * @returns
   */
  public async getAdminPicture(uuid: string) {
    const admin = await this.userRepository.findOne({ uuid });
    return admin.profileImage;
  }

  /**
   * Update Admin Profile
   * @params image
   * @params uuid
   * @returns
   */
  public async updateAdminPicture(image: string, uuid: string) {
    return await this.userRepository.update(
      { uuid: uuid },
      { profileImage: image },
    );
  }

  /**
   * Get A Admin Profile
   * @params uuid
   * @returns
   */
  public async getAdmin(uuid: string) {
    return this.userRepository.findOne({
      where: { uuid: uuid },
      relations: ['Role'],
    });
  }

  /**
   * Update A Admin Profile
   * @params data
   * @returns
   */
  public async updateAdmin(data: AdminDTO, uuid: string) {
    return await this.userRepository.update({ uuid: uuid }, data);
  }

  /* Generate 2FA Uri by using admin detail
   * @param admin
   * @returns
   */
  public async generateToTpURI(
    email: string,
  ): Promise<{ toTpURI: string; key: string }> {
    const admin = await this.getByEmail(email);
    if (admin.twoFA) {
      const key = admin.twoFaKey.replace(/\s/g, '').toUpperCase();
      const toTpURI = generateTotpUri(
        admin.twoFaKey,
        admin.email,
        process.env.APP_NAME,
        'SHA1',
        6,
        30,
      );
      return { toTpURI, key };
    }
    const formattedKey = generateKey();
    const toTpURI = generateTotpUri(
      formattedKey,
      admin.email,
      process.env.APP_NAME,
      'SHA1',
      6,
      30,
    );
    const formattedToken = generateToken(formattedKey);
    await this.userRepository.update(
      { email: admin.email },
      { twoFaKey: formattedKey },
    );
    const key = formattedKey.replace(/\s/g, '').toUpperCase();
    return { toTpURI, key };
  }

  /**
   * Toggle 2FA for authentication
   * @param admin
   * @param code
   */
  public async toggleTwoFactorAuthentication(
    admin: User,
    code: string,
  ): Promise<void> {
    if (admin.twoFA) {
      const result = verifyToken(admin.twoFaKey, code);
      if (result) {
        await this.userRepository.update(
          { email: admin.email },
          { twoFA: false },
        );
        return;
      } else {
        throw new HttpException(
          'Code is not correct',
          ResponseCode.BAD_REQUEST,
        );
      }
    } else {
      const result = verifyToken(admin.twoFaKey, code);
      if (result) {
        await this.userRepository.update(
          { email: admin.email },
          { twoFA: true },
        );
        return;
      } else {
        throw new HttpException(
          'Code is not correct',
          ResponseCode.BAD_REQUEST,
        );
      }
    }
  }

  /********************************************************************************************************************/

  /*
  /*                                    Staff  member sections fees
  /*
  /********************************************************************************************************************/
  /**
   * Add staff member
   * @param payload
   * @returns Staff Member
   */
  public async addStaffMember(payload: StaffDto, req) {
    const role = await this.getRoleById(payload.roleId);
    if (!role) {
      throw new HttpException(
        ResponseMessage.ROLE_DOES_NOT_EXIST,
        ResponseCode.BAD_REQUEST,
      );
    }
    const newStaffMember = new Staff().fromDto(payload);
    const userExist = await this.staffRepository.findOne({
      email: payload.email,
    });
    if (userExist) {
      throw new HttpException(
        ResponseMessage.STAFF_MEMEBER_ALREADY_EXIST,
        ResponseCode.BAD_REQUEST,
      );
    }
    const token = speakeasy.totp({
      secret: process.env.OTP_KEY,
      digits: 6,
      step: 120,
    });
    newStaffMember.profileCode = token;
    const staffMember = await this.staffRepository.save(newStaffMember);
    await this.mailerservice.sendEmailVerification(
      staffMember,
      token.toString(),
      req,
    );
    return Number(token);
  }

  /**
   *  Code Verification Staff
   * @param code
   * @returns Staff member
   */
  async verifyStaffEmail(code: number) {
    if (!code) {
      throw new HttpException(
        ResponseMessage.INVALID_VERIFICATION_CODE,
        ResponseCode.NOT_FOUND,
      );
    }
    const staffMember = await this.staffRepository.findOne({
      profileCode: code,
    });
    if (staffMember) {
      return staffMember;
    } else {
      throw new HttpException(
        `Staff member ${ResponseMessage.DOES_NOT_EXIST}`,
        ResponseCode.NOT_FOUND,
      );
    }
  }

  /**
   * Admin Staff memeber Detail Api
   * @param uuid
   * @returns staffMember
   */
  public async staffDetail(id: string): Promise<User> {
    if (id && !isUUID(id)) {
      throw new HttpException(
        ResponseMessage.INVALID_STAFF_ID,
        ResponseCode.BAD_REQUEST,
      );
    }
    const staffMember = await this.userRepository.findOne(id, {
      relations: ['Role'],
    });
    if (!staffMember) {
      throw new HttpException(
        `Staff member ${ResponseMessage.DOES_NOT_EXIST}`,
        ResponseCode.NOT_FOUND,
      );
    }
    return staffMember;
  }

  /**
   * Edit Staff member Api
   * @param payload
   * @param uuid
   * @returns Staff
   */
  public async staffEdit(payload: StaffDto, uuid: string) {
    if (uuid && !isUUID(uuid)) {
      throw new HttpException(
        ResponseMessage.INVALID_STAFF_ID,
        ResponseCode.BAD_REQUEST,
      );
    }
    const role = await this.getRoleById(payload.roleId);
    if (!role) {
      throw new HttpException(
        ResponseMessage.ROLE_DOES_NOT_EXIST,
        ResponseCode.BAD_REQUEST,
      );
    }
    const memberExist = await this.userRepository.findOne(uuid);
    if (!memberExist) {
      throw new HttpException(
        `Staff member ${ResponseMessage.DOES_NOT_EXIST}`,
        ResponseCode.NOT_FOUND,
      );
    }
    return await this.userRepository.update(
      { uuid },
      { roleId: payload.roleId },
    );
  }

  /********************************************************************************************************************/

  /*
  /*                                    Rols and Permission 
  /*
  /********************************************************************************************************************/
  /**
   * Admin Get Role
   * @param
   * @returns Roles
   */
  public async getRole() {
    return await this.roleRepository.find();
  }

  /**
   * Admin Get Permission
   * @param
   * @returns Permissions
   */
  public async getPermission() {
    const permission = await this.permissionRepository.find();
    if (!permission.length) {
      throw new HttpException(
        ResponseMessage.CONTENT_NOT_FOUND,
        ResponseCode.CONTENT_NOT_FOUND,
      );
    }
    const results = permission.reduce(function(results, org) {
      (results[org.title] = results[org.title] || []).push(org);
      return results;
    }, {});
    return results;
  }

  /**
   * Admin Get Permission
   * @param
   * @returns Permissions
   */
  public async rolePermission(
    roleId: number,
    RolePermissionDto: RolePermissionDto,
  ) {
    const validateInt = isPositiveInteger(roleId.toString());
    if (!validateInt) {
      throw new HttpException(
        `Role ${ResponseMessage.IS_INVALID}`,
        ResponseCode.BAD_REQUEST,
      );
    }
    const role = await this.roleRepository.findOne({ roleId });
    if (!role) {
      throw new HttpException(
        ResponseMessage.ROLE_DOES_NOT_EXIST,
        ResponseCode.BAD_REQUEST,
      );
    }
    if (role.roleName === RoleEnum.Super_Admin) {
      return true;
    }
    await this.rolePermissionRepository.delete({ roleId: role });
    if (RolePermissionDto.permissions.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: {
          permissionId: In(RolePermissionDto.permissions),
        },
      });
      permissions.map(async (m) => {
        const rolePermission = new RolePermission();
        rolePermission.roleId = role;
        rolePermission.permissionId = m;
        await this.rolePermissionRepository.save(rolePermission);
      });
    }
  }

  /**
   * get Role Permission
   * @param roleId
   * @returns Permissions
   */
  public async getRolePermission(
    roleId: number,
  ) {
    const validateInt = isPositiveInteger(roleId.toString());
    if (!validateInt) {
      throw new HttpException(
        `Role ${ResponseMessage.IS_INVALID}`,
        ResponseCode.BAD_REQUEST,
      );
    }
    const role = await this.roleRepository.findOne({ roleId });
    if (!role) {
      throw new HttpException(
        ResponseMessage.ROLE_DOES_NOT_EXIST,
        ResponseCode.BAD_REQUEST,
      );
    }
    if (role.roleName === RoleEnum.Super_Admin) {
      return ResponseMessage.ALL_PERMISSIONS;
    }
    const permission = await this.rolePermissionRepository.find({
      where: { roleId: roleId },
      relations: ['permissionId'],
    });
    return permission.map((obj) => obj.permissionId.permissionId);
  }

  /**
   * get User Permission List
   * @param roleId
   * @returns permissions
   */
  public async permissionList(roleId: number): Promise<any> {
    const role = await this.roleRepository.findOne({
      roleId: roleId,
    });
    let permission = [];
    if (role.roleName === RoleEnum.Super_Admin) {
      return ResponseMessage.ALL_PERMISSIONS;
    }
    permission = await this.rolePermissionRepository.find({
      where: { roleId: roleId },
      relations: ['permissionId'],
    });
    const results = permission.reduce(function(results, org) {
      (results[org.permissionId.title] =
        results[org.permissionId.title] || []).push(org);
      return results;
    }, {});
    return results;
  }

  /**
   * Admin Staff List
   * @param
   * @returns staff with pagination
   */
  public async staffsList(paginationOption: IPaginationOptions) {
    const staffMember = await this.paginate(paginationOption);
    return {
      staffMember,
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
  ): Promise<Pagination<User>> {
    return paginate<User>(this.userRepository, options, {
      order: { created_at: 'DESC' },
      where: condition,
      relations: ['Role'],
    });
  }
}
