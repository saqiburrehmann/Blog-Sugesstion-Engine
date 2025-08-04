import { Module } from '@nestjs/common';
import { SuggestionController } from './suggestion.controller';
import { SuggestionService } from './suggestion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from '../entities/blog.entity';
import { BlogView } from 'src/interactions/entities/view.entity';
import { ReadingHistory } from 'src/interactions/entities/reading-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, BlogView, ReadingHistory])],
  providers: [SuggestionService],
  controllers: [SuggestionController],
})
export class SuggestionModule {}
