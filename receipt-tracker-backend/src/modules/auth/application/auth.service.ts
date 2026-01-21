import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import { JwtPayload } from '../infrastructure/strategies/jwt.strategy';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async findOrCreateUser(googleUser: any): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      // Check if user exists with same email
      user = await this.userRepository.findOne({
        where: { email: googleUser.email },
      });

      if (user) {
        // Link Google account to existing user
        user.googleId = googleUser.googleId;
        user.avatarUrl = googleUser.avatar;
      } else {
        // Create new user
        user = this.userRepository.create({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.googleId,
          avatarUrl: googleUser.avatar,
        });
      }

      user = await this.userRepository.save(user);
    } else {
      // Update user info
      user.name = googleUser.name;
      user.avatarUrl = googleUser.avatar;
      await this.userRepository.save(user);
    }

    return user;
  }

  async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = this.refreshTokenRepository.create({
      userId,
      token,
      expiresAt,
    });

    await this.refreshTokenRepository.save(refreshToken);
  }

  async refreshAccessToken(refreshTokenString: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify<JwtPayload>(refreshTokenString);

      // Check if token exists in DB
      const tokenRecord = await this.refreshTokenRepository.findOne({
        where: { token: refreshTokenString },
        relations: ['user'],
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Refresh token not found');
      }

      if (tokenRecord.expiresAt < new Date()) {
        await this.refreshTokenRepository.delete({ id: tokenRecord.id });
        throw new UnauthorizedException('Refresh token expired');
      }

      // Generate new access token
      const newPayload: JwtPayload = {
        sub: tokenRecord.user.id,
        email: tokenRecord.user.email,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token });
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async updateUserProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    return this.userRepository.save(user);
  }

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
