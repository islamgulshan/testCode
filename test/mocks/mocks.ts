export const MailerMock = {
  sendMailContact: jest.fn(() => {
    return;
  }),
  sendEmailVerification: jest.fn(() => {
    return;
  }),
};

export const LoggerMock = {
  log: jest.fn((value: string) => {
    return;
  }),
  error: jest.fn((value: string) => {
    return;
  }),
  setContext: jest.fn((value: string) => {
    return;
  }),
  debug: jest.fn(() => {
    return;
  }),
};
