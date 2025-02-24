// src/posts/posts.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostStatus } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import slugify from 'slugify';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
    const slug = slugify(createPostDto.title, { lower: true });

    const post = new this.postModel({
      ...createPostDto,
      author: userId,
      slug,
      publishedAt:
        createPostDto.status === PostStatus.PUBLISHED ? new Date() : null,
    });

    return post.save();
  }

  async findAll(query: any = {}) {
    const {
      page = 1,
      limit = 10,
      status = PostStatus.PUBLISHED,
      category,
      tag,
      search,
      author,
      featured,
    } = query;

    const filter: any = { status };

    if (category) {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (author) {
      filter.author = author;
    }

    if (featured) {
      filter.isFeatured = featured === 'true';
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate('author', 'username avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    return {
      posts,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async findOne(idOrSlug: string) {
    const post = await this.postModel
      .findOne({
        $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
      })
      .populate('author', 'username avatar')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, userId: string) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.toString() !== userId) {
      throw new UnauthorizedException('Not authorized to update this post');
    }

    // If status is being changed to published, set publishedAt
    if (
      updatePostDto.status === PostStatus.PUBLISHED &&
      post.status === PostStatus.DRAFT
    ) {
      updatePostDto['publishedAt'] = new Date();
    }

    // Update slug if title is changed
    if (updatePostDto.title) {
      updatePostDto['slug'] = slugify(updatePostDto.title, { lower: true });
    }

    return this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .populate('author', 'username avatar');
  }

  async remove(id: string, userId: string) {
    const post = await this.postModel.findById(id);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.toString() !== userId) {
      throw new UnauthorizedException('Not authorized to delete this post');
    }

    await post.deleteOne();
    return { message: 'Post deleted successfully' };
  }

  async likePost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    return { liked: !isLiked };
  }

  async bookmarkPost(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const isBookmarked = post.bookmarks.includes(userId);

    if (isBookmarked) {
      post.bookmarks = post.bookmarks.filter((id) => id.toString() !== userId);
    } else {
      post.bookmarks.push(userId);
    }

    await post.save();
    return { bookmarked: !isBookmarked };
  }

  async incrementViewCount(postId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.viewCount += 1;
    await post.save();
    return post.viewCount;
  }

  async toggleFeatured(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.isFeatured = !post.isFeatured;
    await post.save();
    return { featured: post.isFeatured };
  }

  async getUserPosts(userId: string, status?: PostStatus) {
    const filter: any = { author: userId };
    if (status) {
      filter.status = status;
    }

    return this.postModel
      .find(filter)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
  }
}
