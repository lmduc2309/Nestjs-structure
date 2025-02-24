import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacbookAuthGuard extends AuthGuard('facebook') {}
