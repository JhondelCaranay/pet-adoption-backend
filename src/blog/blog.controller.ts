import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public, Roles } from 'src/common/decorators';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './dto';

@Controller('blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  getAllBlog(@Query('path') path: string) {
    return this.blogService.getAllBlog(path);
  }

  @Public()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  getBlogById(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.getBlogById(id);
  }

  @Roles('ADMIN')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createBlog(@Body() dto: CreateBlogDto) {
    return this.blogService.createBlog(dto);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @HttpCode(HttpStatus.CREATED)
  updateBlog(
    @Body() dto: UpdateBlogDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.blogService.updateBlog(dto, id);
  }

  // delete blog
  @Roles('ADMIN')
  @Patch(':id')
  @HttpCode(HttpStatus.CREATED)
  deleteBlog(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.deleteBlog(id);
  }
}
