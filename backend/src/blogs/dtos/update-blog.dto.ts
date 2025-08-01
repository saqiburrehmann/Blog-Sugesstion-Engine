export class UpdateBlogDto {
  title?: string;
  content?: string;
  status?: 'draft' | 'published' | 'unpublished'; 
}