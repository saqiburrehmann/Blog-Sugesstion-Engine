import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
  ) {}

  // Create a new blog post
  async create(dto: CreateBlogDto, author: User): Promise<Blog> {
    try {
      console.log('Blog Create DTO:', dto);
      console.log('Blog Author:', author);

      const blog = this.blogRepository.create({ ...dto, author });
      const savedBlog = await this.blogRepository.save(blog);

      console.log('Blog created successfully:', savedBlog);
      return savedBlog;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  // Get all published blogs
  async findAll(): Promise<Blog[]> {
    try {
      const blogs = await this.blogRepository.find({
        where: { status: 'published' },
        order: { createdAt: 'DESC' },
      });
      console.log('[FIND ALL BLOGS]', blogs.length);
      return blogs;
    } catch (error) {
      console.error('[FIND ALL BLOGS ERROR]', error);
      throw new InternalServerErrorException('Failed to retrieve blogs');
    }
  }

  // Get a single blog by ID
  async findOne(id: string): Promise<Blog> {
    try {
      const blog = await this.blogRepository.findOne({ where: { id } });
      if (!blog) {
        console.warn('[BLOG NOT FOUND]', id);
        throw new NotFoundException('Blog not found');
      }
      console.log('[FIND ONE BLOG]', blog);
      return blog;
    } catch (error) {
      console.error('[FIND ONE BLOG ERROR]', error);
      throw error;
    }
  }

  // Update a blog post by its author or admin
  async update(id: string, dto: UpdateBlogDto, user: User): Promise<Blog> {
    try {
      const blog = await this.findOne(id);
      if (blog.author.id !== user.id && user.role !== 'admin') {
        console.warn('[FORBIDDEN UPDATE]', user.id);
        throw new ForbiddenException('You can only update your own blog');
      }

      Object.assign(blog, dto);
      const updated = await this.blogRepository.save(blog);
      console.log('[BLOG UPDATED]', updated);
      return updated;
    } catch (error) {
      console.error('[UPDATE BLOG ERROR]', error);
      throw error;
    }
  }

  // Delete a blog post by its author or admin
  async delete(id: string, user: User): Promise<void> {
    try {
      const blog = await this.findOne(id);
      if (blog.author.id !== user.id && user.role !== 'admin') {
        console.warn('[FORBIDDEN DELETE]', user.id);
        throw new ForbiddenException('You can only delete your own blog');
      }

      await this.blogRepository.delete(id);
      console.log('[BLOG DELETED]', id);
    } catch (error) {
      console.error('[DELETE BLOG ERROR]', error);
      throw error;
    }
  }

  // Update blog status (admin only)
  async updateStatus(
    id: string,
    status: 'draft' | 'published' | 'unpublished',
  ): Promise<Blog> {
    try {
      const blog = await this.findOne(id);
      blog.status = status;
      const updated = await this.blogRepository.save(blog);
      console.log('[STATUS UPDATED]', updated);
      return updated;
    } catch (error) {
      console.error('[UPDATE STATUS ERROR]', error);
      throw error;
    }
  }
}
