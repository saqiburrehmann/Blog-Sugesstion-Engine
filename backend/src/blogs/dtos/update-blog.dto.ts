import { IsArray, IsOptional, IsString, IsIn } from "class-validator";

export class UpdateBlogDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'unpublished'])
  status?: 'draft' | 'published' | 'unpublished';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
