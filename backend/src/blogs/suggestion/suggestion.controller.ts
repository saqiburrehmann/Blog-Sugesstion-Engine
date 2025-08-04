import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { SuggestionService } from './suggestion.service';

@Controller('suggestions')
export class SuggestionController {
  constructor(private readonly suggestionService: SuggestionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getSuggestions(@Request() req) {
    return this.suggestionService.getSuggestionsForUser(req.user.id);
  }

  @Public()
  @Get('popular')
  async getPopularBlogs() {
    const blogs = await this.suggestionService.getPopularBlogs();
    return { type: 'popular', blogs };
  }
}
