import { StudentProfileRow } from './profile';

export type PostCategory = 'ACADEMIC_QUESTION' | 'PROJECT_RECRUITMENT' | 'STUDY_TIPS' | 'CAMPUS_LIFE' | 'GENERAL';

export interface PostRow {
  id: string;
  author_id: string;
  author?: StudentProfileRow;
  course_id?: string | null;
  section_id?: string | null;
  category: PostCategory;
  title: string;
  content: string;
  media_urls: string[];
  upvotes_count: number;
  comments_count: number;
  has_user_upvoted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostCommentRow {
  id: string;
  post_id: string;
  author_id: string;
  author?: StudentProfileRow;
  content: string;
  created_at: string;
}
