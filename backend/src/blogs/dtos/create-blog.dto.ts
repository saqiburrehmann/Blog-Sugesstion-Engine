import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsArray()
  tags: string[];
}
