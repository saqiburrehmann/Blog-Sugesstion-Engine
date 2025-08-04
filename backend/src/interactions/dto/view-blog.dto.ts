import { IsUUID } from 'class-validator';

export class ViewBlogDto {
  @IsUUID()
  blogId: string;
}
