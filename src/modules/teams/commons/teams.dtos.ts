import { IsEmail, IsEnum, IsNotEmpty, IsNumberString, IsOptional, IsUrl, Matches } from 'class-validator';
import { IsValidPhoneNumber } from '../../../modules/common/validator/phone.validator';
import { ResponseMessage } from '../../../utils/enum';
import { IsValidCountry } from '../../../modules/common/validator/country.validator';
import { TeamGender } from './teams.enums';

export class TeamsDto {
  @IsNotEmpty()
  @Matches(/^[a-zA-Z ]{3,26}$/, {
    message: ResponseMessage.INVALID_NAME,
  })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @Matches(
    /^[a-zA-Z]+[a-zA-Z0-9_.-]*[a-zA-Z0-9]+@(([a-zA-Z0-9-]){3,30}.)+([a-zA-Z0-9]{2,5})$/,
    { message: ResponseMessage.INVALID_EMAIL },
  )
  @Matches(/^(?!.*[-_.]{2}).*$/, {
    message: ResponseMessage.INVALID_EMAIL,
  })
  email: string;

  @IsNotEmpty()
  designation: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @IsValidPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  @IsValidCountry()
  country: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{5}-[0-9]{7}-[0-9]$/, {
    message: ResponseMessage.INVALID_CNIC,
  })
  cnic: string;

  @IsNotEmpty()
  @IsEnum(TeamGender)
  gender: string;

  @IsNotEmpty()
  religion: string;

  @IsNotEmpty()
  joining_date: number;

  @IsOptional()
  @IsNumberString()
  exit_date: number;

  @IsNotEmpty()
  @IsUrl()
  linkedin: string;

  @IsOptional()
  profileImage: string;

  @IsOptional()
  admin_id: string;
}
