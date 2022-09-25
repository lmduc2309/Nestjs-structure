import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, SchemaType } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { Transform, Type } from 'class-transformer';

export type UserDocument = Post & Document;
@Schema()
export class Post {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  @ApiProperty()
  title: string;

  @Prop()
  @ApiProperty()
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  @Type(() => User)
  @ApiProperty()
  author: User;
}

export const UserSchema = SchemaFactory.createForClass(Post);
