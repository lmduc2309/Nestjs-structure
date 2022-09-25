import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export type UserDocument = User & Document;
@Schema()
export class User {
  @Transform(({ value }) => value.toString())
  _id: string;

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
