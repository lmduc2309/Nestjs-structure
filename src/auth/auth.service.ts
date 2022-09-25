import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from './password.service';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Token } from './dto/token.dto';
import { SecurityConfig } from 'src/configs/config.interface';
import { CreateUserDto } from './dto/signup.dto';
import { User, UserDocument } from 'src/users/entities/user.entity';
import { PayLoadJwtDto } from './dto/payload-jwt.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(payload: CreateUserDto): Promise<Token> {
    const { userName, email, password } = payload;
    const userValid = await this.validateEmail(email);
    if (userValid) throw new BadRequestException(`The email is exists`);
    const hashedPassword = await this.passwordService.hashPassword(password);
    try {
      const newUser = await this.userModel.create({
        email,
        userName,
        hashedPassword,
      });

      return this.generateToken({
        email,
        sub: newUser._id,
      });
    } catch (e) {
      throw new ConflictException(e);
    }
  }

  async login(user: User): Promise<any> {
    const payload: PayLoadJwtDto = { email: user.email, sub: user._id };
    return this.generateToken({
      email: payload.email,
      sub: payload.sub,
    });
  }

  async validateEmail(email: string): Promise<User> {
    return await this.userModel.findOne({ email });
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`No user found for email: ${email}`);
    }
    const paswordValid = await this.passwordService.validatePassword(
      password,
      user.hashedPassword,
    );

    if (!paswordValid) {
      throw new BadRequestException('Invalid password');
    }

    return user;
  }

  getUserFromToken(token: string): Promise<User> {
    const email = this.jwtService.decode(token)['email'];
    return this.userModel.findOne({ email }).exec();
  }

  generateToken(payload: { email: string; sub: string }): Token {
    const accessToken = this.jwtService.sign(payload);
    const securityConfig = this.configService.get<SecurityConfig>('security');
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: securityConfig.refreshIn,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  refreshToken(token: string) {
    try {
      const { email, sub } = this.jwtService.verify(token);

      return this.generateToken({
        email,
        sub,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
