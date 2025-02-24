import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from '../../auth/dto/signup.dto';
import { UserRole } from '../schemas/user.schema';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  @IsOptional()
  role?: UserRole;

  @ApiProperty()
  @IsOptional()
  isEmailVerified?: boolean;

  @ApiProperty()
  @IsOptional()
  avatar?: string;
}
