export class SuggestedBlogDto {
  id: string;
  title: string;
  content: string;
  tags: string[];
  viewCount: number;
  status: string;
  coverImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    email: string;
  };
}
