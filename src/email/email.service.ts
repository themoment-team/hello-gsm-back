import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { google } from 'googleapis';

@Injectable()
export class EmailService {
  private transporter: Mail;
  private Google = new google.auth.OAuth2(
    this.configService.get('OAUTH_CLIENT_ID'),
    this.configService.get('OAUTH_CLIENT_SECRET'),
    'https://developers.google.com/oauthplayground',
  );

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.google.com',
      port: 587,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: configService.get('OAUTH_USER'),
        clientId: configService.get('OAUTH_CLIENT_ID'),
        clientSecret: configService.get('OAUTH_CLIENT_SECRET'),
        refreshToken: configService.get('OAUTH_REFRESH_TOKEN'),
        accessToken: configService.get('OAUTH_ACCESS_TOKEN'),
      },
    });
  }

  async userVerify(emailAddress: string, code: string) {
    const mailOptions = {
      from: this.configService.get('OAUTH_USER'),
      to: emailAddress,
      subject: 'Hello, GSM test 메일',
      html: `${code}`,
    };

    const result: { accepted: string[] } = await this.transporter.sendMail(
      mailOptions,
    );
    Logger.log(`Send mail to ${result.accepted[0]}`);
  }

  async getToken() {
    const { tokens } = await this.Google.getToken(
      this.configService.get('AUTH_CODE'),
    );
    return tokens;
  }
}
