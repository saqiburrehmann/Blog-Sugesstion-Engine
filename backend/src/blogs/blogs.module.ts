import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { UsersModule } from 'src/users/users.module';
import { ElasticsearchModule } from 'src/elasticsearch/elasticsearch.module';

@Module({
  imports: [TypeOrmModule.forFeature([Blog]), UsersModule, ElasticsearchModule],
  providers: [BlogsService],
  controllers: [BlogsController],
})
export class BlogsModule {}
