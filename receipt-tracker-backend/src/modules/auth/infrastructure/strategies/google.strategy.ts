import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID') || 'dummy-client-id';
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET') || 'dummy-client-secret';
    const callbackURL =
      configService.get<string>('GOOGLE_CALLBACK_URL') ||
      'http://localhost:3000/api/auth/google/callback';

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
    });

    // Check credentials after super() call
    if (
      !configService.get<string>('GOOGLE_CLIENT_ID') ||
      !configService.get<string>('GOOGLE_CLIENT_SECRET') ||
      !configService.get<string>('GOOGLE_CALLBACK_URL')
    ) {
      this.logger.warn(
        'Google OAuth credentials are not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL in your .env file',
      );
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    const user = {
      googleId: id,
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      avatar: photos[0]?.value || null,
      accessToken,
    };
    done(null, user);
  }
}
