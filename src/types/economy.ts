import { StudentProfileRow } from './profile';

export type ServiceType = 'TUTORING_1ON1' | 'CODE_REVIEW' | 'MOCK_DEFENSE' | 'STUDY_GUIDE';
export type OrderStatus = 'ESCROW_HELD' | 'COMPLETED' | 'DISPUTED' | 'REFUNDED' | 'CANCELLED';

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
