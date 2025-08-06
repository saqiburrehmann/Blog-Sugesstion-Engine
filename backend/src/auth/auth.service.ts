import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { UserResponseDto } from 'src/users/dto/response.user.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Login a user with email and password
   */
  async login(
    dto: LoginDto,
    res: Response,
  ): Promise<{
    accessToken: string;
    user: UserResponseDto;
  }> {
    try {
      const user = await this.usersService.findByEmail(dto.email);
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid)
        throw new UnauthorizedException('Invalid credentials');

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
      });

      const refreshToken = this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      });

      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
      });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const { password, ...safeUser } = user;
      const userResponse = new UserResponseDto(safeUser);

      return { accessToken, user: userResponse };
    } catch (error) {
      this.logger.error(`Login error for email ${dto.email}`, error.stack);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async signup(dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      this.logger.log(`Attempting signup for: ${dto.email}`);

      const existingUser = await this.usersService.findByEmail(dto.email);
      if (existingUser) {
        this.logger.warn(`Signup failed: Email already exists (${dto.email})`);
        throw new BadRequestException('Email already exists');
      }

      const newUser = await this.usersService.register(dto);
      this.logger.log(`Signup successful for: ${dto.email}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Signup error for email ${dto.email}`, error.stack);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string, res: Response) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findByEmail(payload.email);
      if (!user) throw new UnauthorizedException('User not found');

      const newAccessToken = this.jwtService.sign(
        { sub: user.id, email: user.email, role: user.role },
        {
          secret: this.configService.get('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION'),
        },
      );

      return res.json({ accessToken: newAccessToken });
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: 'lax',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: 'lax',
    });

    return res.status(200).json({ message: 'Logged out successfully' });
  }

  async getUserProfile(userId: string): Promise<UserResponseDto> {
    console.log('[🧠] Fetching user profile for ID:', userId);

    const user = await this.usersService.findById(userId);
    if (!user) {
      console.error('[❌] User not found for ID:', userId);
      throw new UnauthorizedException('User not found');
    }

    const { password, ...safeUser } = user;
    console.log('[✅] Returning profile for:', safeUser.email);

    return new UserResponseDto(safeUser);
  }
}
