import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { BlogView } from 'src/interactions/entities/view.entity';

@Entity('blog')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 'draft' })
  status: string;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @ManyToOne(() => User, (user) => user.blogs, { eager: true })
  author: User;

  @OneToMany(() => BlogView, (view) => view.blog)
  views: BlogView[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
