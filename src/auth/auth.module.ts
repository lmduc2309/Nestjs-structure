import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt-guard/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { SecurityConfig } from 'src/configs/config.interface';
import { PasswordService } from './password.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { LocalStrategy } from './local-guard/local.strategy';
import { SessionSerializer } from './session/session.serializer';
import { GoogleStrategy } from './google-guard/google.strategy';
import { FacebookStrategy } from './facebook-guard/facebook.strategy';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const securityConfig = configService.get<SecurityConfig>('security');
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: securityConfig.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    PasswordService,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
    LocalStrategy,
    SessionSerializer,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
