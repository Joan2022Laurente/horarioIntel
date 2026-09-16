export type OrderStatus = 'ESCROW_HELD' | 'COMPLETED' | 'DISPUTED' | 'REFUNDED' | 'CANCELLED';
export type ServiceType = 'TUTORING_1ON1' | 'CODE_REVIEW' | 'MOCK_DEFENSE' | 'STUDY_GUIDE';
export type PostCategory = 'ACADEMIC_QUESTION' | 'PROJECT_RECRUITMENT' | 'STUDY_TIPS' | 'CAMPUS_LIFE' | 'GENERAL';
export type MatchIntent = 'PROJECT_TEAM' | 'STUDY_BUDDY' | 'COFFEE_CHAT';
export type BeaconStatus = 'ACTIVE' | 'FULL' | 'EXPIRED' | 'CANCELLED';
export type SquadRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface StudentProfileRow {
  id: string;
  student_code: string;
  full_name: string;
  email: string;
  career: string;
  campus: string;
  cycle: number;
  avatar_url?: string | null;
  bio?: string | null;
  reputation_score: number;
  created_at: string;
  updated_at: string;
}

export interface StudentWalletRow {
  student_id: string;
  balance_cents: number;
  locked_balance_cents: number;
  phone_yape_plin?: string | null;
  updated_at: string;
}

export interface AcademicServiceRow {
  id: string;
  mentor_id: string;
  mentor?: StudentProfileRow;
  course_id?: string | null;
  title: string;
  description: string;
  service_type: ServiceType;
  price_cents: number;
  duration_minutes: number;
  is_active: boolean;
  rating_avg: number;
  total_reviews: number;
  created_at: string;
}

export interface ServiceOrderRow {
  id: string;
  service_id: string;
  service?: AcademicServiceRow;
  buyer_id: string;
  buyer?: StudentProfileRow;
  mentor_id: string;
  mentor?: StudentProfileRow;
  amount_cents: number;
  platform_fee_cents: number;
  status: OrderStatus;
  verification_code?: string | null;
  meeting_link?: string | null;
  created_at: string;
  completed_at?: string | null;
}

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

export interface StudyBeaconRow {
  id: string;
  host_id: string;
  host?: StudentProfileRow;
  course_id?: string | null;
  location_name: string;
  objective: string;
  max_collaborators: number;
  current_collaborators: number;
  status: BeaconStatus;
  expires_at: string;
  created_at: string;
}

export interface SquadRequestRow {
  id: string;
  sender_id: string;
  sender?: StudentProfileRow;
  receiver_id: string;
  receiver?: StudentProfileRow;
  course_id?: string | null;
  message?: string | null;
  status: SquadRequestStatus;
  created_at: string;
}
