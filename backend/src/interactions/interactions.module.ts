import { Module } from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import { InteractionsController } from './interactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingHistory } from './entities/reading-history.entity';
import { BlogView } from './entities/view.entity';
import { Blog } from 'src/blogs/entities/blog.entity';
import { User } from 'src/users/entities/user.entity';
import { BlogLike } from './entities/like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReadingHistory, BlogView, Blog, User, BlogLike]),
  ],
  providers: [InteractionsService],
  controllers: [InteractionsController],
})
export class InteractionsModule {}
