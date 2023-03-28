import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post, PostDocument } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<PostDocument>,
  ) {}
  async create(createPostDto: CreatePostDto): Promise<Post> {
    try {
      const newPost = await this.postModel.create(createPostDto);
      return await newPost.save();
    } catch (e) {
      throw new HttpException('Error creating post', HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(): Promise<Post[]> {
    try {
      const allPost = await this.postModel.find();
      return allPost;
    } catch (e) {
      throw new HttpException('Error get all post', HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string): Promise<Post> {
    try {
      const post = await this.postModel.findOne({ _id: id });
      return post;
    } catch (e) {
      throw new HttpException('Error get this post', HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const postUpdate = await this.postModel.findOneAndReplace(
      { _id: id },
      updatePostDto,
      { new: true },
    );
    if (!updatePostDto) {
      throw new NotFoundException();
    }
    return postUpdate;
  }

  async remove(id: string): Promise<any> {
    return await this.postModel.findByIdAndRemove(id);
  }
}
