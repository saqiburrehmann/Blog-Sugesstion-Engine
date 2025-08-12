import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadingHistory } from 'src/interactions/entities/reading-history.entity';
import { BlogView } from 'src/interactions/entities/view.entity';
import { Repository } from 'typeorm';
import { Blog } from '../entities/blog.entity';
import { SuggestedBlogDto } from 'src/auth/dto/suggested-blog.dto';

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

  // suggestion.service.ts
  async getSuggestionsForUser(
    userId: string,
  ): Promise<{ type: string; suggestions: SuggestedBlogDto[] }> {
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

    console.log('🧾 Reading history count:', recentHistory.length);
    console.log('🔖 Tags extracted:', tagArray);
    console.log('🛑 Already read blog IDs:', alreadyReadIds);

    const qb = this.blogRepo
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.author', 'author')
      .where('blog.status = :status', { status: 'published' });

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

    qb.orderBy('blog.createdAt', 'DESC').take(20);
    const suggestions = await qb.getMany();

    // ❌ No fallback — just return empty if no history
    if (suggestions.length === 0) {
      return {
        type: 'personalized',
        suggestions: [],
      };
    }

    return {
      type: 'personalized',
      suggestions: suggestions.map((blog) => this.toDto(blog)),
    };
  }

  private toDto(blog: Blog): SuggestedBlogDto {
    return {
      id: blog.id,
      title: blog.title,
      content: blog.content,
      tags: blog.tags,
      viewCount: blog.viewCount,
      status: blog.status,
      coverImageUrl: blog.coverImageUrl,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: {
        email: blog.author?.email || '',
      },
    };
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
      .addOrderBy('blog.createdAt', 'DESC')
      .take(20)
      .getMany();
  }
}
