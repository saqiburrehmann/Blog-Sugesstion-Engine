import {
  Controller,
  Post,
  Body,
  Res,
  UnauthorizedException,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, res); // pass res
  }

  @Public()
  @Post('logout')
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }

  @Public()
  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    return this.authService.signup(dto);
  }

  @Get('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    console.log('Incoming cookies:', req.cookies); // 👈 Add this
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      console.warn('No refresh token found');
      throw new UnauthorizedException('Refresh token missing');
    }

    return this.authService.refreshAccessToken(refreshToken, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    console.log('[📥] getProfile called by user ID:', req.user?.id);
    return this.authService.getUserProfile(req.user.id);
  }
}
