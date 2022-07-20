import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/signup.dto';
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
  login(@Request() req, @Body() login: LoginDto): any {
    return this.authService.login(req.user);
  }
}
