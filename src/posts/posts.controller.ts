// src/posts/posts.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  HttpCode,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-guard/jwt-auth.guard';
import { PostStatus } from './schemas/post.schema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.sub);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.postsService.findAll(query);
  }

  @Get('user/:userId')
  getUserPosts(
    @Param('userId') userId: string,
    @Query('status') status?: PostStatus,
  ) {
    return this.postsService.getUserPosts(userId, status);
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.postsService.findOne(idOrSlug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.postsService.update(id, updatePostDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.postsService.remove(id, req.user.sub);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  likePost(@Param('id') id: string, @Request() req) {
    return this.postsService.likePost(id, req.user.sub);
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  bookmarkPost(@Param('id') id: string, @Request() req) {
    return this.postsService.bookmarkPost(id, req.user.sub);
  }

  @Post(':id/view')
  @HttpCode(200)
  incrementViewCount(@Param('id') id: string) {
    return this.postsService.incrementViewCount(id);
  }

  @Post(':id/featured')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  toggleFeatured(@Param('id') id: string, @Request() req) {
    return this.postsService.toggleFeatured(id, req.user.sub);
  }
}
