import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, Injectable } from '@nestjs/common';
import { ResponseCode, ResponseMessage } from '../../utils/enum';
import { getManager } from 'typeorm';
import { Staff } from '../../modules/user/staff.entity';

const currentYear = new Date().getFullYear();

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  static configureSendGrid() {
    return {
      transport: {
        service: 'sendgrid',
        host: 'smtp.sendgrid.net',
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      },
      defaults: {
        from: process.env.SENDGRID_EMAIL,
      },
    };
  }

  /**
   * Send Contact Email
   * @param payload
   * @param contact
   */
  async sendMailContact(payload: any, contact: any) {
    await this.mailerService
      .sendMail({
        to: process.env.EMAIL_ADDRESS_RECIPENT,
        subject: 'Contact Us | GenesisLab',
        html: `<html lang="en">
<head>
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Rubik:400,700&display=swap" rel="stylesheet" type="text/css">
</head>
<body style="background-color: #111111;">
<table bgcolor="#111111" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" height="100%" align="center">
<tbody><tr>
<td bgcolor="#111111" style="background-color:#111111;padding-top:0px" valign="top" align="center" class="m_6069702506707232563pd_10">

<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
<tbody><tr>
<td align="center" valign="top" bgcolor="#111111">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" class="m_6069702506707232563table" style="width:100%;max-width:600px">

<tbody><tr>
<td align="center" valign="top" class="m_6069702506707232563table" style="padding-top:25px">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center">

<tbody><tr>
<td aria-hidden="true" align="center" valign="top" style="padding:20px 0">
<a href="#m_6069702506707232563_" style="text-decoration:none;display:inline-block">
<img style="width:100%;display:block" src="https://i.imgur.com/743hBqw.png" width="592" border="0">
</a>
</td>
</tr><tr>
<td align="center" valign="top">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center">
<tbody><tr>
<td align="center" valign="top">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #e5e7e8;border-right:1px solid #e5e7e8;border-top:1px solid #eff1f2;border-bottom:1px solid #e5e7e8;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #e0e2e3;border-right:1px solid #e0e2e3;border-top:1px solid #eefof1;border-bottom:1px solid #e0e2e3;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #dbdddd;border-right:1px solid #dbdddd;border-top:1px solid #eceeef;border-bottom:1px solid #dbdddd;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #d5d7d8;border-right:1px solid #d5d7d8;border-top:1px solid #e9ebec;border-bottom:1px solid #d5d7d8;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-radius: 8px;border-collapse:collapse" width="100%" bgcolor="#ffffff">
<table role="presentation" border="0" cellpadding="0" cellspacing="0">

<tbody>
<tr>
<td align="left" valign="top" style="padding:40px">
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width: 600px;">
<tbody><tr>
<td align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:15px;text-align: center;">
<h2>Contact Us</h2>
</td>
</tr>
<tr>
<td class="m_6069702506707232563pd_r0" align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:15px;padding-right:0px">
<p>You have received a message from ${payload.email}</p>
</td>
</tr>
<tr>
  <td align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:15px">
  <strong>Details:</strong>
  </td>
  </tr>
  <tr>
    <td align="left" valign="top" style="padding-left:20px">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tbody><tr>
    <td align="left" valign="top">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tbody><tr>
    <td aria-hidden="true" align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:5px;font-weight:500" width="20">•</td>
    <td align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:5px">
    <strong>Name:</strong> ${payload.name}
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>
    <tr>
    <td align="left" valign="top">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tbody><tr>
    <td aria-hidden="true" align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:5px;font-weight:500" width="20">•</td>
    <td align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:5px">
    <strong>Email:</strong> ${payload.email}
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>
    <tr>
      <td align="left" valign="top">
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tbody><tr>
      <td aria-hidden="true" align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:5px;font-weight:500" width="20">•</td>
      <td align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:5px">
      <strong>Country:</strong> ${payload.country}
      </td>
      </tr>
      </tbody></table>
      </td>
      </tr>
      <tr>
        <td align="left" valign="top">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tbody><tr>
        <td aria-hidden="true" align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:5px;font-weight:500" width="20">•</td>
        <td align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:5px">
        <strong>Phone:</strong> ${payload.phoneNumber}
        </td>
        </tr>
        </tbody></table>
        </td>
        </tr>
    <tr>
    <td align="left" valign="top">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tbody><tr>
    <td aria-hidden="true" align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:0px;font-weight:500" width="20">•</td>
    <td align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:0px">
    <strong>Message:</strong> <br>${payload.message}
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>
    </tbody></table>
    </td>
    </tr>
</tbody></table>
</td>
</tr>

</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
<tr>
<td aria-hidden="true" align="center" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding:10px">
Copyright © ${currentYear} GenesisLab. All rights reserved.
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>

</td>
</tr>
</tbody></table>
</body>
</html>`,
      })
      .catch(async (err) => {
        const total_sql = `DELETE FROM contacts
                WHERE "contactId"=${contact.contactId}`;
        await getManager().query(total_sql);
        throw new HttpException(
          ResponseMessage.ERROR_WHILE_SENDING_MESSAGE,
          ResponseCode.BAD_REQUEST,
        );
      });
  }

  /**
   * Send Password Recovery Email To User on Forgot Password
   * @param email
   * @param token
   */
  async sendForgotPasswordMail(email: string, token: string) {
    const url = process.env.WEB_APP_URL;
    const subRoute = 'changepassword';
    await this.mailerService.sendMail({
      to: email,
      subject: 'Forgot Password | GenesisLab Admin',
      html: `
      <html lang="en">
<head>
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Rubik:400,700&display=swap" rel="stylesheet" type="text/css">
</head>
<body style="background-color: #111111;">
<table bgcolor="#111111" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" height="100%" align="center">
<tbody><tr>
<td bgcolor="#111111" style="background-color:#111111;padding-top:0px" valign="top" align="center" class="m_6069702506707232563pd_10">

<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
<tbody><tr>
<td align="center" valign="top" bgcolor="#111111">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" class="m_6069702506707232563table" style="width:100%;max-width:600px">

<tbody><tr>
<td align="center" valign="top" class="m_6069702506707232563table" style="padding-top:25px">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center">

<tbody><tr>
<td aria-hidden="true" align="center" valign="top" style="padding:20px 0">
<a href="#m_6069702506707232563_" style="text-decoration:none;display:inline-block">
<img style="width:100%;display:block" src="https://i.imgur.com/743hBqw.png" width="592" border="0">
</a>
</td>
</tr><tr>
<td align="center" valign="top">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center">
<tbody><tr>
<td align="center" valign="top">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #e5e7e8;border-right:1px solid #e5e7e8;border-top:1px solid #eff1f2;border-bottom:1px solid #e5e7e8;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #e0e2e3;border-right:1px solid #e0e2e3;border-top:1px solid #eefof1;border-bottom:1px solid #e0e2e3;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #dbdddd;border-right:1px solid #dbdddd;border-top:1px solid #eceeef;border-bottom:1px solid #dbdddd;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #d5d7d8;border-right:1px solid #d5d7d8;border-top:1px solid #e9ebec;border-bottom:1px solid #d5d7d8;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-radius: 8px;border-collapse:collapse" width="100%" bgcolor="#ffffff">
<table role="presentation" border="0" cellpadding="0" cellspacing="0">

<tbody>
<tr>
<td align="left" valign="top" style="padding:40px">
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width: 600px;">
<tbody><tr>
<td align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:15px;text-align: center;">
<h2>Forgot Password</h2>
</td>
</tr>
<tr>
<td class="m_6069702506707232563pd_r0" align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:15px;padding-right:0px">
<p>Dear Admin </p>
<p>Please click the "Reset Password" button to reset your password.</p>
</td>
</tr>
<tr>
  <td align="center" valign="middle" style="border-radius:4px;background-color:#111111;color:#ffffff;text-align:center;vertical-align:middle">
  <a href="${url}${subRoute}?token=${token}" style="border-radius:4px;color:#ffffff;font-size:16px;line-height:24px;font-family:Google Sans,Roboto,Arial,Helvetica,sans-serif;font-weight:500;border-top:12px solid #111;border-right:24px solid #111;border-bottom:12px solid #111;border-left:24px solid #111;text-decoration:none;display:block" target="_blank">
    Reset Password
  </a>
  </td>
  </tr>
<tr>
<td style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-top:15px;padding-right:0px">
  Regards,
</td>
</tr>
<tr>
<td style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-top:5px;padding-right:0px">
GenesisLab Team
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
<tr>
<td aria-hidden="true" align="center" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding:10px">
Copyright © ${currentYear} GenesisLab. All rights reserved.
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>

</td>
</tr>
</tbody></table>
</body>
</html>`,
    });
  }

  /**
   * Send verification code email to user on signup
   *
   * @param email
   * @param verificationCode
   */
  public async sendEmailVerificationCode(
    email: string,
    verificationCode: string,
  ): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const currentYear = new Date().getFullYear();
      try {
        await this.mailerService.sendMail({
          to: email,
          subject: 'Email Verification',
          html: `<html lang="en">
            <head>
              <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap" rel="stylesheet" type="text/css">
              <link href="https://fonts.googleapis.com/css?family=Rubik:400,700&display=swap" rel="stylesheet" type="text/css">
            </head>
            <body style="background-color: #111111;">
            <table bgcolor="#111111" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" height="100%" align="center">
            <tbody><tr>
            <td bgcolor="#111111" style="background-color:#111111;padding-top:0px" valign="top" align="center" class="m_6069702506707232563pd_10">
            
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
            <tbody><tr>
            <td align="center" valign="top" bgcolor="#111111">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" class="m_6069702506707232563table" style="width:100%;max-width:600px">
            
            <tbody><tr>
            <td align="center" valign="top" class="m_6069702506707232563table" style="padding-top:25px">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center">
            
            <tbody><tr>
            <td aria-hidden="true" align="center" valign="top" style="padding:20px 0">
            <a href="#m_6069702506707232563_" style="text-decoration:none;display:inline-block">
            <img style="width:100%;display:block" src="https://i.imgur.com/743hBqw.png" width="592" border="0">
            </a>
            </td>
            </tr><tr>
            <td align="center" valign="top">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center">
            <tbody><tr>
            <td align="center" valign="top">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tbody><tr>
            <td style="border-left:1px solid #e5e7e8;border-right:1px solid #e5e7e8;border-top:1px solid #eff1f2;border-bottom:1px solid #e5e7e8;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tbody><tr>
            <td style="border-left:1px solid #e0e2e3;border-right:1px solid #e0e2e3;border-top:1px solid #eefof1;border-bottom:1px solid #e0e2e3;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tbody><tr>
            <td style="border-left:1px solid #dbdddd;border-right:1px solid #dbdddd;border-top:1px solid #eceeef;border-bottom:1px solid #dbdddd;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tbody><tr>
            <td style="border-left:1px solid #d5d7d8;border-right:1px solid #d5d7d8;border-top:1px solid #e9ebec;border-bottom:1px solid #d5d7d8;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tbody><tr>
            <td style="border-radius: 8px;border-collapse:collapse" width="100%" bgcolor="#ffffff">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            
            <tbody>
            <tr>
            <td align="left" valign="top" style="padding:40px">
            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width: 600px;">
            <tbody> 

            <tr>
<td class="m_6069702506707232563pd_r0" align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#1f1f1f;padding-bottom:15px;padding-right:0px">
<p>
This code remains valid for 3 minutes. Please do not disclose it to anyone
  </p>
</td>
</tr>

            <tr>
            <td align="center" valign="middle" style="background-color:#000;border-radius:4px;color:#ffffff;font-size:16px;line-height:24px;font-family:Google Sans,Roboto,Arial,Helvetica,sans-serif;font-weight:500;border-top:12px solid #000;border-right:24px solid #000;border-bottom:12px solid #000;border-left:24px solid #000;text-decoration:none;display:block">
${verificationCode}
</td>
            </tr>
           
            </tbody></table>
            </td>
            </tr>
            
            </tbody></table>
            </td>
            </tr>
            </tbody></table>
            </td>
            </tr>
            </tbody></table>
            </td>
            </tr>
            </tbody></table>
            </td>
            </tr>
            </tbody></table>
            </td>
            </tr>
            </tbody></table>
            </td>
            </tr>
            </tbody></table>
            </td>
            </tr>
            <tr>
            <td aria-hidden="true" align="center" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding:10px">
            Copyright © ${currentYear} GenesisLab. All rights reserved.
            </td>
            </tr>
            </tbody></table>
            </td>
            </tr>
            </tbody></table>
            </td>
            </tr>
            </tbody></table>
            
            </td>
            </tr>
            </tbody></table>
            </body>
            </html>`,
        });
        resolve();
      } catch (err) {
        console.log(err);

        // reject(
        //   new HttpException(
        //     {
        //       statusCode: ResponseCode.EMAIL_SENDING_ERROR,
        //       message: ResponseMessage.EMAIL_SENDING_ERROR,
        //     },
        //     ResponseCode.BAD_REQUEST,
        //   ),
        // );
      }
    });
  }
 
  /**
   * Latest Send Verfication Code Email To Staff Member
   * @param staff
   * @param verificationCode
   * @param req
   */
  public async sendEmailVerification(
    staff: Staff,
    verificationCode: string,
    req,
  ): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      const url = process.env.WEB_APP_URL;
      const subRoute = 'register';
      try {
        await this.mailerService.sendMail({
          to: staff.email,
          subject: 'Welcome to GenesisLab | Email Verification ',
          html: `<html lang="en">
<head>
  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,700&display=swap" rel="stylesheet" type="text/css">
  <link href="https://fonts.googleapis.com/css?family=Rubik:400,700&display=swap" rel="stylesheet" type="text/css">
</head>
<body style="background-color: #111111;">
<table bgcolor="#111111" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" height="100%" align="center">
<tbody><tr>
<td bgcolor="#111111" style="background-color:#111111;padding-top:0px" valign="top" align="center" class="m_6069702506707232563pd_10">

<table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center">
<tbody><tr>
<td align="center" valign="top" bgcolor="#111111">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" align="center" class="m_6069702506707232563table" style="width:100%;max-width:600px">

<tbody><tr>
<td align="center" valign="top" class="m_6069702506707232563table" style="padding-top:25px">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center">

<tbody><tr>
<td aria-hidden="true" align="center" valign="top" style="padding:20px 0">
<a href="#m_6069702506707232563_" style="text-decoration:none;display:inline-block">
<img style="width:100%;display:block" src="https://i.imgur.com/743hBqw.png" width="592" border="0">
</a>
</td>
</tr><tr>
<td align="center" valign="top">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" align="center">
<tbody><tr>
<td align="center" valign="top">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #e5e7e8;border-right:1px solid #e5e7e8;border-top:1px solid #eff1f2;border-bottom:1px solid #e5e7e8;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #e0e2e3;border-right:1px solid #e0e2e3;border-top:1px solid #eefof1;border-bottom:1px solid #e0e2e3;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #dbdddd;border-right:1px solid #dbdddd;border-top:1px solid #eceeef;border-bottom:1px solid #dbdddd;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-left:1px solid #d5d7d8;border-right:1px solid #d5d7d8;border-top:1px solid #e9ebec;border-bottom:1px solid #d5d7d8;border-collapse:collapse;border-radius:8px" align="center" bgcolor="#F8F9FA" valign="top" width="100%">
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
<tbody><tr>
<td style="border-radius: 8px;border-collapse:collapse" width="100%" bgcolor="#ffffff">
<table role="presentation" border="0" cellpadding="0" cellspacing="0">

<tbody>
<tr>
<td align="left" valign="top" style="padding:40px">
<table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width: 600px;">
<tbody><tr>
<td align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:15px;text-align: center;">
<h2>Email Verification</h2>
</td>
</tr>
<tr>
<td class="m_6069702506707232563pd_r0" align="left" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-bottom:15px;padding-right:0px">
<p>Dear Admin </p>
<p>Please click the "Verify Email" button to confirm your email verification.</p>
</td>
</tr>
<tr>
  <td align="center" valign="middle" style="border-radius:4px;background-color:#111111;color:#ffffff;text-align:center;vertical-align:middle">
  <a href="${url}${subRoute}?role=${staff.roleId}&code=${verificationCode}" style="border-radius:4px;color:#ffffff;font-size:16px;line-height:24px;font-family:Google Sans,Roboto,Arial,Helvetica,sans-serif;font-weight:500;border-top:12px solid #111;border-right:24px solid #111;border-bottom:12px solid #111;border-left:24px solid #111;text-decoration:none;display:block" target="_blank">
  Verify Email
  </a>
  </td>
  </tr>
<tr>
<td style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-top:15px;padding-right:0px">
  Regards,
</td>
</tr>
<tr>
<td style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding-top:5px;padding-right:0px">
GenesisLab Team
</td>
</tr>
</tbody></table>
</td>
</tr>

</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
<tr>
<td aria-hidden="true" align="center" valign="top" style="font-size:14px;line-height:24px;font-family:Rubik,Open Sans,Arial,sans-serif;color:#4a4a4a;padding:10px">
Copyright © ${currentYear} GenesisLab. All rights reserved.
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>
</td>
</tr>
</tbody></table>

</td>
</tr>
</tbody></table>
</body>
</html>`,
        });
        resolve();
      } catch (err) {
        const total_sql = `DELETE FROM staffs
          WHERE "uuid"=${staff.uuid}`;
        await getManager().query(total_sql);
        throw new HttpException(
          ResponseMessage.ERROR_WHILE_SENDING_MESSAGE,
          ResponseCode.BAD_REQUEST,
        );
      }
    });
  }
}
