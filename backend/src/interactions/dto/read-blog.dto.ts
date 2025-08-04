import { IsUUID } from 'class-validator';

export class ReadBlogDto {
  @IsUUID()
  blogId: string;
}
