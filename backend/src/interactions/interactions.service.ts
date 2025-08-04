import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogView } from './entities/view.entity';
import { ReadingHistory } from './entities/reading-history.entity';
import { BlogLike } from './entities/like.entity';
import { Blog } from 'src/blogs/entities/blog.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(BlogView)
    private viewRepo: Repository<BlogView>,
    @InjectRepository(ReadingHistory)
    private readRepo: Repository<ReadingHistory>,
    @InjectRepository(BlogLike)
    private likeRepo: Repository<BlogLike>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}

  async recordView(userId: string, blogId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const blog = await this.blogRepo.findOneBy({ id: blogId });

    if (!user || !blog) return;

    const view = this.viewRepo.create({ user, blog });
    return this.viewRepo.save(view);
  }

  async recordRead(userId: string, blogId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const blog = await this.blogRepo.findOneBy({ id: blogId });

    if (!user || !blog) return;

    const alreadyExists = await this.readRepo.findOne({
      where: { user: { id: userId }, blog: { id: blogId } },
    });

    if (alreadyExists) return; 

    const history = this.readRepo.create({ user, blog });
    return this.readRepo.save(history);
  }

  async recordLike(userId: string, blogId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const blog = await this.blogRepo.findOneBy({ id: blogId });

    if (!user || !blog) return;

    const existing = await this.likeRepo.findOne({
      where: { user: { id: userId }, blog: { id: blogId } },
    });

    if (existing) return; // Already liked

    const like = this.likeRepo.create({ user, blog });
    return this.likeRepo.save(like);
  }
}
