import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { ReadingHistory } from '../interactions/entities/reading-history.entity';
import { ElasticsearchService } from 'src/elasticsearch/elasticsearch.service';
import { BlogView } from '../interactions/entities/view.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  const userRepo = dataSource.getRepository(User);
  const blogRepo = dataSource.getRepository(Blog);
  const historyRepo = dataSource.getRepository(ReadingHistory);
  const viewRepo = dataSource.getRepository(BlogView);
  const elasticService = app.get(ElasticsearchService);

  // 🧹 Clear existing data
  await dataSource.query('SET FOREIGN_KEY_CHECKS=0');
  await viewRepo.clear();
  await historyRepo.clear();
  await blogRepo.clear();
  await userRepo.clear();
  await dataSource.query('SET FOREIGN_KEY_CHECKS=1');

  const hashedPassword = await bcrypt.hash('123456', 10);

  // 👥 Users
  const [alice, bob, charlie, dave] = await userRepo.save([
    userRepo.create({
      email: 'alice@example.com',
      password: hashedPassword,
      role: UserRole.USER,
    }),
    userRepo.create({
      email: 'bob@example.com',
      password: hashedPassword,
      role: UserRole.USER,
    }),
    userRepo.create({
      email: 'charlie@example.com',
      password: hashedPassword,
      role: UserRole.USER,
    }),
    userRepo.create({
      email: 'dave@example.com',
      password: hashedPassword,
      role: UserRole.USER,
    }),
  ]);

  // 📝 Blogs
  // 📝 Blogs
  const blogEntities = blogRepo.create([
    {
      title: 'NestJS Basics',
      content: 'Intro to NestJS',
      tags: ['nestjs', 'backend'],
      status: 'published',
      author: alice,
    },
    {
      title: 'Advanced NestJS',
      content: 'DI, Guards',
      tags: ['nestjs', 'advanced'],
      status: 'published',
      author: alice,
    },
    {
      title: 'NestJS Caching',
      content: 'Using interceptors',
      tags: ['nestjs', 'backend', 'performance'],
      status: 'published',
      author: bob,
    },
    {
      title: 'API Security',
      content: 'JWT, OAuth',
      tags: ['security', 'api'],
      status: 'published',
      author: charlie,
    },

    // ⚛️ Frontend-focused
    {
      title: 'React Basics',
      content: 'Hooks, JSX',
      tags: ['react', 'frontend'],
      status: 'published',
      author: bob,
    },
    {
      title: 'React Forms',
      content: 'Controlled & Uncontrolled',
      tags: ['react', 'frontend'],
      status: 'published',
      author: charlie,
    },
    {
      title: 'CSS Tips',
      content: 'Grid, Flexbox',
      tags: ['css', 'frontend'],
      status: 'published',
      author: bob,
    },

    // 🗄️ Database
    {
      title: 'Database Design',
      content: 'Relational models',
      tags: ['mysql', 'db'],
      status: 'published',
      author: bob,
    },
    {
      title: 'Indexing MySQL',
      content: 'BTrees, Hashing',
      tags: ['mysql', 'performance'],
      status: 'published',
      author: dave,
    },

    // 📚 JS / General
    {
      title: 'JS Tips',
      content: 'ES6 and beyond',
      tags: ['javascript'],
      status: 'published',
      author: alice,
    },
    {
      title: 'TS Basics',
      content: 'Interfaces, Types',
      tags: ['typescript', 'javascript'],
      status: 'published',
      author: dave,
    },
    {
      title: 'Design Patterns',
      content: 'OOP & FP',
      tags: ['architecture', 'design'],
      status: 'published',
      author: charlie,
    },
  ]);

  const blogs = await blogRepo.save(blogEntities);

  // 🔁 Index each blog into Elasticsearch
  await Promise.all(blogs.map((blog) => elasticService.indexBlog(blog)));

  // 📖 Reading history

  // Alice → NestJS + DB
  await historyRepo.save([
    { user: alice, blog: blogs[0] }, // NestJS Basics
    { user: alice, blog: blogs[1] }, // Advanced NestJS
    { user: alice, blog: blogs[7] }, // Database Design
  ]);

  // Bob → React + CSS
  await historyRepo.save([
    { user: bob, blog: blogs[4] }, // React Basics
    { user: bob, blog: blogs[6] }, // CSS Tips
  ]);

  // Charlie → No reading history (forces fallback to popular)

  // Dave → MySQL + Security
  await historyRepo.save([
    { user: dave, blog: blogs[7] }, // Database Design
    { user: dave, blog: blogs[3] }, // API Security
  ]);

  // 👁️ Views to simulate popularity
  await viewRepo.save([
    { user: alice, blog: blogs[0] },
    { user: bob, blog: blogs[0] },
    { user: charlie, blog: blogs[0] },
    { user: dave, blog: blogs[0] }, // NestJS Basics is most viewed

    { user: alice, blog: blogs[4] },
    { user: bob, blog: blogs[4] },

    { user: bob, blog: blogs[1] },
    { user: charlie, blog: blogs[3] },
    { user: charlie, blog: blogs[5] },
    { user: dave, blog: blogs[8] },
  ]);

  console.log('\n✅ Seed complete!');
  console.log('📌 Test cases:');
  console.log(
    '🔹 Alice should get personalized: NestJS Caching, Indexing MySQL',
  );
  console.log('🔹 Bob should get personalized: React Forms');
  console.log(
    '🔹 Charlie should fallback to popular (NestJS Basics, React Basics, etc.)',
  );
  console.log(
    '🔹 Dave should get personalized: Indexing MySQL (not Database Design)',
  );
  await app.close();
}

bootstrap();
