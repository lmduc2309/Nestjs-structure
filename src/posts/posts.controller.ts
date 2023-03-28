import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-guard/jwt-auth.guard';
import { SessionAuthGuard } from 'src/auth/session/session-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/helpers/ResponseFormat';

@Controller('posts')
@UseInterceptors(TransformInterceptor)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard, SessionAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }
  @UseGuards(JwtAuthGuard, SessionAuthGuard)
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.postsService.findAll();
  }
  @UseGuards(JwtAuthGuard, SessionAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
  @UseGuards(JwtAuthGuard, SessionAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }
  @UseGuards(JwtAuthGuard, SessionAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}
