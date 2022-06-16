import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV } from 'apps/hello-gsm-back/src/lib/env';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    const configService = new ConfigService();
    super({
      clientID: configService.get(ENV.KAKAO_CLIENT_ID),
      clientSecret: configService.get(ENV.KAKAO_CLIENT_PW),
      callbackURL: configService.get(ENV.CALLBACK_URL),
    });
  }
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any, info?: any) => void,
  ) {
    done(null, profile);
  }
}
