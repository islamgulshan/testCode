import { IsEmail, IsNotEmpty, IsUUID, Matches } from 'class-validator';
import { IsValidPhoneNumber } from '../../../modules/common/validator/phone.validator';
import { IsValidCountry } from '../../../modules/common/validator/country.validator';

import { ResponseMessage } from '../../../utils/enum';

export class ApplicationDto {
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
  @IsValidCountry()
  country: string;

  @IsNotEmpty()
  @IsValidPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsUUID()
  positionId: string;
}
