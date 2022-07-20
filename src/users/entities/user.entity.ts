import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;
@Schema()
export class User {
  @Prop()
  @ApiProperty()
  email: string;

  @Prop()
  @ApiProperty()
  hashedPassword: string;

  @Prop()
  @ApiProperty()
  userName: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
