import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Patch,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Public()
  @Get()
  getAllBlogs() {
    return this.blogsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  getAllBlogsAdmin() {
    return this.blogsService.findAllAdmin();
  }

  @Public()
  @Get(':id')
  async getBlog(@Param('id') id: string) {
    const blog = await this.blogsService.findOne(id);
    await this.blogsService.incrementViewCount(id);
    return blog;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
  createBlog(@Body() dto: CreateBlogDto, @Request() req) {
    console.log('Creating blog by:', req.user);
    return this.blogsService.create(dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  updateBlog(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @Request() req,
  ) {
    return this.blogsService.update(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  @Roles(UserRole.USER, UserRole.ADMIN)
  deleteBlog(@Param('id') id: string, @Request() req) {
    return this.blogsService.delete(id, req.user);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: { status: string }) {
    return this.blogsService.updateStatus(id, dto.status as any);
  }
}
