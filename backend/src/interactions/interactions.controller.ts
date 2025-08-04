import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('interactions')
@UseGuards(JwtAuthGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post('view')
  async viewBlog(@Req() req, @Body() body: { blogId: string }) {
    return this.interactionsService.recordView(req.user.id, body.blogId);
  }

  @Post('read')
  async readBlog(@Req() req, @Body() body: { blogId: string }) {
    return this.interactionsService.recordRead(req.user.id, body.blogId);
  }

  @Post('like')
  async likeBlog(@Req() req, @Body() body: { blogId: string }) {
    return this.interactionsService.recordLike(req.user.id, body.blogId);
  }
}
