import { deleteImage } from 'src/common/utils/cloudenary.util';
import { uploadImage } from './../common/utils/cloudenary.util';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PATH } from '@prisma/client';
import { CreateBlogDto, UpdateBlogDto } from './dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async getAllBlog(path: string = 'HOME') {
    const matchPath = PATH[path.toUpperCase() as keyof typeof PATH];
    const blogs = await this.prisma.blog.findMany({
      where: {
        path: {
          equals: matchPath || PATH.HOME,
        },
      },
      orderBy: [
        {
          createdAt: 'desc'
        }
      ],
      select: {
        id: true,
        title: true,
        content: true,
        path: true,
        createdAt: true,
        updatedAt: true,
        photos: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });
    return blogs;
  }

  async getBlogById(id: number) {
    const blog = await this.prisma.blog.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        path: true,
        createdAt: true,
        updatedAt: true,
        photos: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return blog;
  }

  async createBlog(dto: CreateBlogDto) {
    const blog = await this.prisma.blog.create({
      data: {
        title: dto.title,
        content: dto.content,
        path: dto.path.toUpperCase() as keyof typeof PATH,
      },
    });
    dto.photos.forEach(async (photo) => {
      // upload images to cloudinary
      const { secure_url, public_id } = await uploadImage(photo);
      await this.prisma.photo.create({
        data: {
          imageUrl: secure_url,
          imageId: public_id,
          blogId: blog.id,
        },
      });
    });
    return blog;
  }

  async updateBlog(dto: UpdateBlogDto, id: number) {
    // check if blog exists

    const blog = await this.prisma.blog.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        path: true,
        createdAt: true,
        updatedAt: true,
        photos: {
          select: {
            id: true,
            imageUrl: true,
            imageId: true,
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    // if has photos, delete all photos
    if (dto.photos) {
      // delete all photos in cloudinary
      blog.photos.forEach(async (photo) => {
        await deleteImage(photo.imageId);
      });

      // delete all photos in database
      await this.prisma.photo.deleteMany({
        where: {
          blogId: id,
        },
      });

      // upload new photos

      dto.photos.forEach(async (photo) => {
        // upload images to cloudinary
        const { secure_url, public_id } = await uploadImage(photo);
        await this.prisma.photo.create({
          data: {
            imageUrl: secure_url,
            imageId: public_id,
            blogId: id,
          },
        });
      });
    }

    // update blog
    const updatedBlog = await this.prisma.blog.update({
      where: {
        id,
      },
      data: {
        title: dto.title || undefined,
        content: dto.content || undefined,
        path: (dto.path.toUpperCase() as keyof typeof PATH) || undefined,
      },
      select: {
        id: true,
        title: true,
        content: true,
        path: true,
        createdAt: true,
        updatedAt: true,
        photos: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });

    return updatedBlog;
  }

  async deleteBlog(id: number) {
    // check if blog exists
    const blog = await this.prisma.blog.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        path: true,
        createdAt: true,
        updatedAt: true,
        photos: {
          select: {
            id: true,
            imageUrl: true,
            imageId: true,
          },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    // delete all photos in cloudinary
    blog.photos.forEach(async (photo) => {
      await deleteImage(photo.imageId);
    });

    // delete all photos in database
    await this.prisma.photo.deleteMany({
      where: {
        blogId: id,
      },
    });

    // delete blog
    const deletedBlog = await this.prisma.blog.delete({
      where: {
        id,
      },
    });
    return deletedBlog;
  }
}
