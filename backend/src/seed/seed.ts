import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { ReadingHistory } from '../interactions/entities/reading-history.entity';
import { BlogView } from '../interactions/entities/view.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

let ElasticsearchService: any;
const enableElastic = process.env.ENABLE_ELASTIC === 'true';
if (enableElastic) {
  ElasticsearchService =
    require('src/elasticsearch/elasticsearch.service').ElasticsearchService;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepo = dataSource.getRepository(User);
  const blogRepo = dataSource.getRepository(Blog);
  const historyRepo = dataSource.getRepository(ReadingHistory);
  const viewRepo = dataSource.getRepository(BlogView);
  const elasticService = enableElastic ? app.get(ElasticsearchService) : null;

  await dataSource.query('SET FOREIGN_KEY_CHECKS=0');
  await viewRepo.clear();
  await historyRepo.clear();
  await blogRepo.clear();
  await userRepo.clear();
  await dataSource.query('SET FOREIGN_KEY_CHECKS=1');

  const hashedPassword = await bcrypt.hash('123456', 10);

  const [alice, bob, charlie, dave] = await userRepo.save([
    userRepo.create({
      name: 'Alice',
      email: 'alice@example.com',
      password: hashedPassword,
      role: UserRole.USER,
    }),
    userRepo.create({
      name: 'Bob',
      email: 'bob@example.com',
      password: hashedPassword,
      role: UserRole.USER,
    }),
    userRepo.create({
      name: 'Charlie',
      email: 'charlie@example.com',
      password: hashedPassword,
      role: UserRole.USER,
    }),
    userRepo.create({
      name: 'Dave',
      email: 'dave@example.com',
      password: hashedPassword,
      role: UserRole.USER,
    }),
  ]);

  const tagsList = [
    ['nestjs', 'backend'],
    ['nestjs', 'advanced'],
    ['nestjs', 'performance'],
    ['security', 'api'],
    ['react', 'frontend'],
    ['react', 'forms'],
    ['css', 'frontend'],
    ['mysql', 'db'],
    ['mysql', 'performance'],
    ['javascript'],
    ['typescript', 'javascript'],
    ['architecture', 'design'],
    ['testing', 'jest'],
    ['docker', 'devops'],
    ['kubernetes'],
    ['graphql', 'api'],
    ['websockets', 'real-time'],
    ['ui', 'ux'],
    ['tailwind', 'css'],
    ['react-native'],
    ['nextjs', 'react'],
    ['prisma', 'orm'],
    ['authentication', 'security'],
    ['oauth2', 'auth'],
    ['caching', 'redis'],
  ];

  const blogEntities = tagsList.map((tags, i) =>
    blogRepo.create({
      title: `Blog #${i + 1}: ${tags.join(' & ')}`,
      content: `This blog covers topics on ${tags.join(', ')}.`,
      tags,
      status: 'published',
      author: [alice, bob, charlie, dave][i % 4], // rotate authors
    }),
  );

  const blogs = await blogRepo.save(blogEntities);

  if (enableElastic && elasticService) {
    await Promise.all(blogs.map((blog) => elasticService.indexBlog(blog)));
  }

  // Reading history — simulate reading for personalization
  await historyRepo.save([
    // Alice reads nestjs-related blogs
    { user: alice, blog: blogs[0] },
    { user: alice, blog: blogs[1] },
    { user: alice, blog: blogs[2] },

    // Bob reads frontend/react
    { user: bob, blog: blogs[4] },
    { user: bob, blog: blogs[5] },
    { user: bob, blog: blogs[6] },

    // Dave reads MySQL and performance
    { user: dave, blog: blogs[7] },
    { user: dave, blog: blogs[8] },
    { user: dave, blog: blogs[24] }, // caching

    // Charlie reads nothing — new user
  ]);

  // Views — simulate popularity
  await viewRepo.save([
    ...blogs.map((blog, idx) => ({
      user: [alice, bob, charlie, dave][idx % 4],
      blog,
    })),
    // popular boost
    { user: alice, blog: blogs[0] },
    { user: bob, blog: blogs[0] },
    { user: charlie, blog: blogs[0] },
    { user: dave, blog: blogs[0] },
  ]);

  console.log('\n✅ Seed complete!');
  console.log('📌 Test cases:');
  console.log('🔹 Alice → personalized: nestjs-related blogs');
  console.log('🔹 Bob → personalized: react/frontend blogs');
  console.log('🔹 Charlie → fallback to popular (has no reads)');
  console.log('🔹 Dave → personalized: mysql/performance/caching');

  await app.close();
}
bootstrap();
