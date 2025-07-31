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
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
  }> {
    try {
      this.logger.log(`Attempting login for: ${dto.email}`);

      const user = await this.usersService.findByEmail(dto.email);
      if (!user) {
        this.logger.warn(`Login failed: user not found for email ${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(
          `Login failed: invalid password for email ${dto.email}`,
        );
        throw new UnauthorizedException('Invalid credentials');
      }

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

      this.logger.log(`Login successful for user ${user.email}`);

      // Remove password and return clean user object
      const { password, ...safeUser } = user;
      const userResponse = new UserResponseDto(safeUser);

      return { accessToken, refreshToken, user: userResponse };
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
}
