import { PostRow, PostCommentRow, PostCategory } from '@/types/community';

export interface ICommunityService {
  getFeed(courseId?: string, category?: PostCategory): Promise<PostRow[]>;
  createPost(data: Omit<PostRow, 'id' | 'upvotes_count' | 'comments_count' | 'created_at' | 'updated_at'>): Promise<PostRow>;
  toggleUpvote(postId: string, studentId: string): Promise<boolean>;
  addComment(postId: string, authorId: string, content: string): Promise<PostCommentRow>;
}

export class CommunityService implements ICommunityService {
  async getFeed(_courseId?: string, _category?: PostCategory): Promise<PostRow[]> {
    return [];
  }

  async createPost(data: Omit<PostRow, 'id' | 'upvotes_count' | 'comments_count' | 'created_at' | 'updated_at'>): Promise<PostRow> {
    return {
      ...data,
      id: `post_${Date.now()}`,
      upvotes_count: 0,
      comments_count: 0,
      has_user_upvoted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async toggleUpvote(_postId: string, _studentId: string): Promise<boolean> {
    return true;
  }

  async addComment(postId: string, authorId: string, content: string): Promise<PostCommentRow> {
    return {
      id: `cmt_${Date.now()}`,
      post_id: postId,
      author_id: authorId,
      content,
      created_at: new Date().toISOString(),
    };
  }
}

export const communityService = new CommunityService();
