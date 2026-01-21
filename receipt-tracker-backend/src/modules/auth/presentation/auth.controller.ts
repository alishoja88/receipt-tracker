import { Controller, Get, Post, Body, Req, Res, UseGuards, Patch } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../application/auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { RefreshTokenDto } from '../dto/login.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;

    // Create or update user in database
    const dbUser = await this.authService.findOrCreateUser(user);

    // Generate JWT tokens
    const tokens = await this.authService.generateTokens(dbUser);

    // Store refresh token
    await this.authService.saveRefreshToken(dbUser.id, tokens.refreshToken);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`,
    );
  }

  @Post('refresh')
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(dto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.revokeRefreshToken(dto.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.authService.updateUserProfile(user.userId, dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getUserProfile(user.userId);
  }
}
