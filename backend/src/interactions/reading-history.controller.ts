// reading-history.controller.ts
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadingHistory } from './entities/reading-history.entity';
import { Repository } from 'typeorm';
import { Blog } from 'src/blogs/entities/blog.entity';
import { User } from 'src/users/entities/user.entity';

@Controller('interactions/history')
export class ReadingHistoryController {
  constructor(
    @InjectRepository(ReadingHistory)
    private readonly historyRepo: Repository<ReadingHistory>,
    @InjectRepository(Blog)
    private readonly blogRepo: Repository<Blog>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async logReading(
    @Request() req,
    @Body('blogId') blogId: string,
  ): Promise<{ success: boolean }> {
    const userId = req.user.id;
    const user = await this.userRepo.findOneByOrFail({ id: userId });
    const blog = await this.blogRepo.findOneByOrFail({ id: blogId });

    await this.historyRepo.save(
      this.historyRepo.create({
        user,
        blog,
        readAt: new Date(),
      }),
    );

    return { success: true };
  }
}
