import { Blog } from "src/blogs/entities/blog.entity";
import { User } from "src/users/entities/user.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BlogLike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Blog)
  blog: Blog;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  likedAt: Date;
}
