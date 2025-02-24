import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type { UserDocument } from 'src/users/schemas/user.schema';
import { AuthService } from '../auth.service';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((tokens) => {
        const response = context.switchToHttp().getResponse<Response>();
        // const payload = { email: user.email, sub: user._id };
        // console.log(user);
        // const token = this.authService.generateToken(payload);
        // console.log('token', tokens.accessToken);
        response.setHeader('Authorization', `Bearer ${tokens.accessToken}`);
        response.cookie('token', tokens.accessToken, {
          httpOnly: true,
          signed: true,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        });
        return tokens;
      }),
    );
  }
}
