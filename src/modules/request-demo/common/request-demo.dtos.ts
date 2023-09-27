import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ResponseMessage } from '../../../utils/enum';

export class EmailDto {
  @IsEmail({}, { message: ResponseMessage.INVALID_EMAIL })
  @IsNotEmpty()
  @Matches(
    /^[a-zA-Z0-9_\.\-]*[a-zA-Z0-9]+\@(([a-zA-Z0-9\-]){3,30}\.)+([a-zA-Z0-9]{2,5})$/,
    { message: ResponseMessage.INVALID_EMAIL },
  )
  @Matches(/^(?!.*[\-\_\.]{2}).*$/, { message: ResponseMessage.INVALID_EMAIL })
  email: string;
}

export class EmailVerificationDto extends EmailDto {
  @IsNotEmpty()
  name: string;
}
export class slugDto {
  @IsNotEmpty()
  slug: string;
}

export class verificationCodeDto extends EmailDto {
  @IsNumberString({}, { message: ResponseMessage.INVALID_VERIFICATION_CODE })
  @MaxLength(6)
  @MinLength(6)
  code: string;
}

export class HeadersDto {
  @IsNotEmpty()
  @IsString()
  authorization: string;
}
