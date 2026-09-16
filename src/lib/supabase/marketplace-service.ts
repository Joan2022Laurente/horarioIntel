import { supabase } from './client';
import { AcademicServiceRow } from '@/types/economy';

export async function fetchAcademicServices(): Promise<AcademicServiceRow[]> {
  try {
    const { data, error } = await supabase
      .from('academic_services')
      .select('*')
      .eq('is_active', true)
      .order('rating_avg', { ascending: false });

    if (error) {
      console.warn('[Supabase] Error fetching marketplace services:', error);
      return [];
    }

    return (data || []).map((s) => ({
      id: s.id,
      mentor_id: s.mentor_id || 'usr-mentor',
      mentor: {
        id: s.mentor_id || 'usr-mentor',
        student_code: s.mentor_code || 'U19204910',
        full_name: s.mentor_name,
        email: '',
        career: s.mentor_career || 'Ingeniería',
        campus: 'Campus Digital',
        cycle: 10,
        reputation_score: 200,
        created_at: s.created_at,
        updated_at: s.created_at,
      },
      course_id: s.course_id,
      title: s.title,
      description: s.description,
      service_type: s.service_type as any,
      price_cents: s.price_cents,
      duration_minutes: s.duration_minutes,
      rating_avg: Number(s.rating_avg),
      total_reviews: s.total_reviews,
      is_active: s.is_active,
      created_at: s.created_at,
    }));
  } catch (e) {
    console.warn('[Supabase] Error in fetchAcademicServices:', e);
    return [];
  }
}

export async function createServiceInDb(params: {
  mentorName: string;
  mentorCode: string;
  mentorCareer: string;
  courseId: string;
  title: string;
  description: string;
  serviceType: 'MOCK_DEFENSE' | 'TUTORING_1ON1' | 'CODE_REVIEW';
  priceCents: number;
  durationMinutes: number;
}): Promise<AcademicServiceRow | null> {
  try {
    const { data, error } = await supabase
      .from('academic_services')
      .insert([
        {
          mentor_name: params.mentorName,
          mentor_code: params.mentorCode,
          mentor_career: params.mentorCareer,
          course_id: params.courseId,
          title: params.title,
          description: params.description,
          service_type: params.serviceType,
          price_cents: params.priceCents,
          duration_minutes: params.durationMinutes,
          rating_avg: 5.0,
          total_reviews: 0,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.warn('[Supabase] Error creating academic service:', error);
      return null;
    }

    return {
      id: data.id,
      mentor_id: data.mentor_id || 'me',
      mentor: {
        id: data.mentor_id || 'me',
        student_code: data.mentor_code || params.mentorCode,
        full_name: data.mentor_name,
        email: '',
        career: data.mentor_career || params.mentorCareer,
        campus: 'Campus Digital',
        cycle: 8,
        reputation_score: 100,
        created_at: data.created_at,
        updated_at: data.created_at,
      },
      course_id: data.course_id,
      title: data.title,
      description: data.description,
      service_type: data.service_type as any,
      price_cents: data.price_cents,
      duration_minutes: data.duration_minutes,
      rating_avg: Number(data.rating_avg),
      total_reviews: data.total_reviews,
      is_active: data.is_active,
      created_at: data.created_at,
    };
  } catch (e) {
    console.warn('[Supabase] Error in createServiceInDb:', e);
    return null;
  }
}

export async function createEscrowOrderInDb(params: {
  serviceId: string;
  amountCents: number;
  paymentMethod: 'YAPE' | 'PLIN' | 'WALLET';
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('escrow_transactions').insert([
      {
        service_id: params.serviceId,
        amount_cents: params.amountCents,
        status: 'HELD_IN_ESCROW',
        payment_method: params.paymentMethod,
      },
    ]);

    return !error;
  } catch (e) {
    console.warn('[Supabase] Error in createEscrowOrderInDb:', e);
    return false;
  }
}
