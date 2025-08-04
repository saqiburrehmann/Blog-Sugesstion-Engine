import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadingHistory } from 'src/interactions/entities/reading-history.entity';
import { BlogView } from 'src/interactions/entities/view.entity';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';

@Injectable()
export class SuggestionService {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
    @InjectRepository(BlogView)
    private viewRepo: Repository<BlogView>,
    @InjectRepository(ReadingHistory)
    private historyRepo: Repository<ReadingHistory>,
  ) {}

  async getSuggestionsForUser(
    userId: string,
  ): Promise<{ type: string; suggestions: Blog[] }> {
    const recentHistory = await this.historyRepo.find({
      where: { user: { id: userId } },
      relations: ['blog'],
      order: { readAt: 'DESC' },
      take: 5,
    });

    const tagSet = new Set<string>();
    const readBlogIds = new Set<string>();

    recentHistory.forEach((entry) => {
      readBlogIds.add(entry.blog.id);
      entry.blog.tags?.forEach((tag) => tagSet.add(tag.trim()));
    });

    const tagArray = Array.from(tagSet);
    const alreadyReadIds = Array.from(readBlogIds);

    // Debug logs
    console.log('🧾 Reading history count:', recentHistory.length);
    console.log('🔖 Tags extracted:', tagArray);
    console.log('🛑 Already read blog IDs:', alreadyReadIds);

    const qb = this.blogRepo
      .createQueryBuilder('blog')
      .where('blog.status = :status', { status: 'published' });

    if (tagArray.length === 0) {
      console.log('🚫 No personalization criteria – fallback to popular');
      const fallback = await this.getPopularBlogs();
      return { type: 'popular', suggestions: fallback };
    }

    if (tagArray.length > 0) {
      const tagConditions = tagArray
        .map((_, i) => `JSON_CONTAINS(blog.tags, :tag${i}, '$')`)
        .join(' OR ');
      qb.andWhere(`(${tagConditions})`);

      tagArray.forEach((tag, i) => {
        qb.setParameter(`tag${i}`, JSON.stringify(tag)); 
      });
    }

    if (alreadyReadIds.length > 0) {
      qb.andWhere('blog.id NOT IN (:...readIds)', { readIds: alreadyReadIds });
    }

    qb.orderBy('blog.createdAt', 'DESC').take(5);
    const suggestions = await qb.getMany();

    if (suggestions.length === 0) {
      console.log('🔁 No personalized suggestions – fallback to popular');
      const fallback = await this.getPopularBlogs();
      return { type: 'popular', suggestions: fallback };
    }

    return { type: 'personalized', suggestions };
  }

  async getPopularBlogs(): Promise<Blog[]> {
    return this.blogRepo
      .createQueryBuilder('blog')
      .leftJoin('blog.views', 'view')
      .leftJoinAndSelect('blog.author', 'author')
      .where('blog.status = :status', { status: 'published' })
      .groupBy('blog.id')
      .addGroupBy('author.id')
      .addSelect('COUNT(view.id)', 'viewCount')
      .orderBy('viewCount', 'DESC')
      .take(5)
      .getMany();
  }
}
