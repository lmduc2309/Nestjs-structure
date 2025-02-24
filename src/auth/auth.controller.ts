import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserDto } from './dto/signup.dto';
import { TokenInterceptor } from './interceptors/token.interceptors';
import { LocalAuthGuard } from './local-guard/local-auth.guard';
import { GoogleAuthGuard } from './google-guard/google-auth.guard';
import { FacbookAuthGuard } from './facebook-guard/facebook-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  async signUp(@Body() userDto: CreateUserDto) {
    return this.authService.createUser(userDto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Guard will handle the authentication
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async googleAuthCallback(@Request() req) {
    return this.authService.handleGoogleAuth(req.user);
  }

  @Get('facebook')
  @UseGuards(FacbookAuthGuard)
  async facebookAuth() {
    // Guard will handle the authentication
  }

  @Get('facebook/callback')
  @UseGuards(FacbookAuthGuard)
  @UseInterceptors(TokenInterceptor)
  async facebookAuthCallback(@Request() req) {
    return this.authService.handleFacebookAuth(req.user);
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
