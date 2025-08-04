import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private client: Client;

  onModuleInit() {
    this.client = new Client({ node: 'http://localhost:9200' });
  }

  async indexBlog(blog: any) {
    return this.client.index({
      index: 'blogs',
      id: blog.id,
      document: {
        title: blog.title,
        content: blog.content,
        tags: blog.tags,
      },
    });
  }

  async searchBlogs(query: string) {
    const result = await this.client.search({
      index: 'blogs',
      query: {
        bool: {
          should: [
            {
              match_phrase_prefix: {
                title: query,
              },
            },
            {
              match_phrase_prefix: {
                content: query,
              },
            },
            {
              match_phrase_prefix: {
                tags: query,
              },
            },
            {
              fuzzy: {
                title: {
                  value: query,
                  fuzziness: 'AUTO',
                },
              },
            },
            {
              wildcard: {
                title: `*${query.toLowerCase()}*`,
              },
            },
            {
              wildcard: {
                content: `*${query.toLowerCase()}*`,
              },
            },
            {
              wildcard: {
                tags: `*${query.toLowerCase()}*`,
              },
            },
          ],
        },
      },
    });

    return result.hits.hits.map((hit) => hit._source);
  }
}
