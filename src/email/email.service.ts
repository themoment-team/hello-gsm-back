import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { ENV } from 'src/lib/env';

@Injectable()
export class EmailService {
  private Google = new google.auth.OAuth2(
    this.configService.get(ENV.OAUTH_CLIENT_ID),
    this.configService.get(ENV.OAUTH_CLIENT_SECRET),
  );

  constructor(private configService: ConfigService) {
    this.Google.setCredentials({
      refresh_token: this.configService.get(ENV.OAUTH_REFRESH_TOKEN),
    });
  }

  async userVerify(emailAddress: string, code: string) {
    const accessToken = await this.Google.getAccessToken();
    const transporter = this.getTransporter(accessToken);
    const mailOptions = {
      from: this.configService.get(ENV.OAUTH_USER),
      to: emailAddress,
      subject: 'Hello, GSM test 메일',
      html: `${code}`,
    };

    const result = await transporter.sendMail(mailOptions);
    Logger.log(`Send mail to ${result.accepted[0]}`);
  }

  private getTransporter(accessToken: any) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.configService.get(ENV.OAUTH_USER),
        clientId: this.configService.get(ENV.OAUTH_CLIENT_ID),
        clientSecret: this.configService.get(ENV.OAUTH_CLIENT_SECRET),
        refreshToken: this.configService.get(ENV.OAUTH_REFRESH_TOKEN),
        accessToken,
      },
    });
  }
}
