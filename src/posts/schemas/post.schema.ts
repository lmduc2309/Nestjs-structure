// src/posts/schemas/post.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  slug: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String })
  category: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  videos: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: User | string;

  @Prop({ type: String, enum: PostStatus, default: PostStatus.DRAFT })
  status: PostStatus;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ type: [{ type: String }], default: [] })
  likes: string[];

  @Prop({ type: [{ type: String }], default: [] })
  bookmarks: string[];

  @Prop({ type: Object })
  seoMetadata: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
  };

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop()
  publishedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Add text index for search functionality
PostSchema.index({ title: 'text', content: 'text', tags: 'text' });
