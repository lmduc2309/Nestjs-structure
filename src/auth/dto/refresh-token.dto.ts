import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
export class RefreshTokenDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  refreshToken: string;
}
