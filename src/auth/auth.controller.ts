import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserDto } from './dto/signup.dto';
import { TokenInterceptor } from './interceptors/token.interceptors';
import { LocalAuthGuard } from './local-guard/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  async signUp(@Body() userDto: CreateUserDto) {
    return this.authService.createUser(userDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @UseInterceptors(TokenInterceptor)
  async login(@Request() req, @Body() login: LoginDto) {
    return this.authService.login(req.user);
  }

  @Post('refreshtoken')
  async refreshToken(@Body() payload: RefreshTokenDto) {
    return this.authService.refreshToken(payload);
  }
}
