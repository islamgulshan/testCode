import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ResponseMessage } from '../../../utils/enum';
import { SameAs } from './../../common/validator/same-as.validator';
import { IsValidPhoneNumber } from '../../../modules/common/validator/phone.validator';
import { IsValidCountry } from '../../../modules/common/validator/country.validator';

export class ChangePasswordPayload {

  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()_%!-])[A-Za-z\d$&+,:;=?@#|'<>.^*()_%!-]{8,}$/,
    {
      message: ResponseMessage.INVALID_PASSWORD,
    },
  )
  currentPassword: string;

  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()_%!-])[A-Za-z\d$&+,:;=?@#|'<>.^*()_%!-]{8,}$/,
    {
      message: ResponseMessage.INVALID_PASSWORD,
    },
  )
  password: string;

  @SameAs(`password`)
  passwordConfirmation: string;
}

export class ToggleTwoFaDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class AdminDTO {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsValidCountry()
  country: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsValidPhoneNumber()
  phoneNumber: string;
}
