export enum ResponseMessage {
  SUCCESS = `Success`,
  CREATED_SUCCESSFULLY = `Created successfully`,
  CONTENT_NOT_FOUND = `Content not found`,
  INVALID_USERNAME_OR_PASSWORD = `Invalid email or password`,
  USER_ALREADY_EXISTS = `User with the same email already exists`,
  FORGOT_PASSWORD_EMAIL = `Please Check Your Email To Reset Password`,
  EMAIL_NOT_REGISTERED = `Email not registered`,

  INVALID_EMAIL = `Invalid email address`,
  INVALID_PASSWORD = `Invalid Password. Use 8-15 characters with a mix of letters, numbers & symbols`,
  INVALID_USERNAME = `Invalid user name`,
  INVALID_NAME = `Invalid name`,
  INVALID_FIRSTNAME = `Invalid first name`,
  INVALID_LASTNAME = `Invalid last name`,
  INVALID_COUNTRY = `Invalid country name`,
  INVALID_PHONE_NUMBER = `Invalid phone number`,
  RESET_PASSWORD_LINK_EXPIRED = `This Reset Password Link Has Been Expied`,
  USER_DOES_NOT_EXIST = `User with specified email does not exists`,
  DOES_NOT_EXIST = 'Does not exist',
  ROLE_DOES_NOT_EXIST = 'Role does not exist',
  IMAGE_BASE_URL_NOT_EXSIT = 'Image base URL does not exsits',
  UNAUTHORIZED = 'Unauthorized',
  BAD_REQUEST = 'Bad Request',
  UPDATED_SUCCESSFULLY = `Updated successfully`,
  PASSWORD_CHANGE_SUCCESS = 'Password changed',

  TEAM_MEMEBER_ALREADY_EXIST = `Team member with the same email already exists`,
  INVALID_CNIC = 'Invalid cnic',
  PROFILE_IMAGE_NOT_UPLOAD = 'Profile picture not uploaded',

  MESSAGE_SENT_SUCCESFULLY = `Your message was sent successfully. Thanks`,
  ERROR_WHILE_SENDING_MESSAGE = 'There was some error in sending your message. Please try again',
  INVALID_LAST_DATE = 'Invalid last date',
  INVALID_SALARY_RANGE = 'Invalid salary range. High salary should be greater than low salary.',
  INVALID_JOB_ID = 'Invalid job id',
  INVALID_APPLICATION_ID = 'Invalid application id',
  CV_NOT_UPLOADED = 'CV not uploaded',
  IMAGE_REQUIRED = `Image is required`,
  IS_INVALID = `Is Invalid`,

  INVALID_VERIFICATION_CODE = `Invalid verification code`,

  STAFF_MEMEBER_ALREADY_EXIST = `Staff member with the same email already exists`,
  INVALID_STAFF_ID = 'Invalid staff id',
  CODE_EXPIRED = `This Link Has Been Expired`,

  PRODUCT_ID_NOT_EXIST = 'Product does not exist',
  EMAIL_ALREADY_VERIFIED = 'Email already verified',
  EMAIL_CODE_EXPIRED = 'Email verification code Has Been Expired',

  ALL_PERMISSIONS = `All permissions`,

  INVALID_TOKEN = 'Invalid token',
}

// some code enums for sending response code in api response
export enum ResponseCode {
  SUCCESS = 200,
  CREATED_SUCCESSFULLY = 201,
  INTERNAL_ERROR = 500,
  NOT_FOUND = 404,
  CONTENT_NOT_FOUND = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  ALREADY_EXIST = 409,
  PRODUCT_ID_NOT_EXIST = 410,
  EMAIL_ALREADY_VERIFIED = 411,
  VERIFICATION_CODE_EXPIRED = 412,
  INVALID_VERIFICATION_CODE = 413,
  INVALID_TOKEN = 414,
}

export enum LoggerMessages {
  API_CALLED = `Api Has Been Called.`,
}

export enum NodeEnv {
  TEST = `test`,
  DEVELOPMENT = `development`,
  PRODUCTION = `production`,
}
