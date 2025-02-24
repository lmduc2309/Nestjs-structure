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
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { PayLoadJwtDto } from './dto/payload-jwt.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(payload: CreateUserDto): Promise<Token> {
    const { username, email, password, role } = payload;
    const userValid = await this.validateEmail(email);
    if (userValid) throw new BadRequestException(`The email is exists`);
    const hashedPassword = await this.passwordService.hashPassword(password);
    try {
      const newUser = await this.userModel.create({
        email,
        username,
        hashedPassword,
      });

      return this.generateToken({
        email,
        sub: newUser._id,
        role: role ? role : 'user',
      });
    } catch (e) {
      throw new ConflictException(e);
    }
  }

  async handleGoogleAuth(profile: any): Promise<Token> {
    const { email, googleId, firstName, lastName, picture } = profile;

    let user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      // Create new user if doesn't exist
      const username = `${firstName}${lastName}`.toLowerCase();
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await this.passwordService.hashPassword(
        randomPassword,
      );

      try {
        user = await this.userModel.create({
          email,
          username,
          hashedPassword,
          googleId,
          firstName,
          lastName,
          avatar: picture,
          isEmailVerified: true, // Google accounts are verified
        });
      } catch (error) {
        throw new ConflictException('Error creating user');
      }
    } else if (!user.googleId) {
      // Link Google account to existing user
      user.googleId = googleId;
      user.isEmailVerified = true;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    return this.generateToken({
      email: user.email,
      sub: user._id,
      role: user.role,
    });
  }

  async handleFacebookAuth(profile: any): Promise<Token> {
    const { email, facebookId, firstName, lastName, picture } = profile;

    let user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      // Create new user if doesn't exist
      const username = `${firstName}${lastName}`.toLowerCase();
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await this.passwordService.hashPassword(
        randomPassword,
      );

      try {
        user = await this.userModel.create({
          email,
          username,
          hashedPassword,
          facebookId,
          firstName,
          lastName,
          avatar: picture,
          isEmailVerified: true, // Facebook accounts are verified
        });
      } catch (error) {
        throw new ConflictException('Error creating user');
      }
    } else if (!user.facebookId) {
      // Link Facebook account to existing user
      user.facebookId = facebookId;
      user.isEmailVerified = true;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    return this.generateToken({
      email: user.email,
      sub: user._id,
      role: user.role,
    });
  }

  async login(user: User): Promise<any> {
    const payload: PayLoadJwtDto = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };
    return this.generateToken({
      email: payload.email,
      sub: payload.sub,
      role: payload.role,
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

  generateToken(payload: { email: string; sub: string; role: string }): Token {
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

  refreshToken(payload: RefreshTokenDto) {
    try {
      const { email, sub, role } = this.jwtService.verify(payload.refreshToken);
      console.log(email, sub);
      if (email !== payload.email) {
        throw new UnauthorizedException('Invalid token');
      }
      return this.generateToken({
        email,
        sub,
        role,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
