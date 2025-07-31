import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UserResponseDto } from 'src/users/dto/response.user.dto';
import { CreateUserDto } from 'src/users/dto/create.user.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('signup')
  signup(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.authService.signup(dto);
  }
}
