import { supabase } from './client';
import { AcademicServiceRow, MarketplaceCategory, ServiceType, DeliveryMethod, StockStatus } from '@/types/economy';
import { INITIAL_MARKETPLACE_LISTINGS } from '@/lib/economy/marketplace-data';

export async function fetchAcademicServices(): Promise<AcademicServiceRow[]> {
  try {
    const { data, error } = await supabase
      .from('academic_services')
      .select('*')
      .eq('is_active', true)
      .order('rating_avg', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_MARKETPLACE_LISTINGS;
    }

    const dbServices: AcademicServiceRow[] = data.map((s) => ({
      id: s.id,
      mentor_id: s.mentor_id || 'usr-mentor',
      mentor: {
        id: s.mentor_id || 'usr-mentor',
        student_code: s.mentor_code || 'U19204910',
        full_name: s.mentor_name || 'Estudiante UTP',
        email: '',
        career: s.mentor_career || 'Ingeniería',
        campus: 'Campus San Juan',
        cycle: 8,
        reputation_score: 180,
        created_at: s.created_at,
        updated_at: s.created_at,
      },
      course_id: s.course_id,
      title: s.title,
      description: s.description,
      service_type: s.service_type as ServiceType,
      category: (s.category as MarketplaceCategory) || 'ACADEMIC',
      price_cents: s.price_cents,
      unit_label: s.unit_label || 'por unidad',
      delivery_method: (s.delivery_method as DeliveryMethod) || 'CAMPUS_MEET',
      campus_location: s.campus_location || 'Campus San Juan',
      whatsapp_phone: s.whatsapp_phone || '51987654321',
      stock_status: (s.stock_status as StockStatus) || 'AVAILABLE_NOW',
      duration_minutes: s.duration_minutes,
      rating_avg: Number(s.rating_avg) || 5.0,
      total_reviews: s.total_reviews || 0,
      tags: s.tags || [],
      is_active: s.is_active ?? true,
      created_at: s.created_at || new Date().toISOString(),
    }));

    // Merge custom DB services with seed items if desired
    return dbServices.length > 0 ? dbServices : INITIAL_MARKETPLACE_LISTINGS;
  } catch (e) {
    console.warn('[Supabase] Error in fetchAcademicServices:', e);
    return INITIAL_MARKETPLACE_LISTINGS;
  }
}

export async function createServiceInDb(params: {
  mentorName: string;
  mentorCode: string;
  mentorCareer: string;
  courseId?: string;
  title: string;
  description: string;
  serviceType: ServiceType;
  category: MarketplaceCategory;
  priceCents: number;
  unitLabel?: string;
  deliveryMethod?: DeliveryMethod;
  campusLocation?: string;
  whatsappPhone?: string;
  durationMinutes?: number;
  tags?: string[];
}): Promise<AcademicServiceRow | null> {
  const newId = `srv-${Date.now()}`;
  const newService: AcademicServiceRow = {
    id: newId,
    mentor_id: 'usr-current',
    mentor: {
      id: 'usr-current',
      student_code: params.mentorCode || 'U20202020',
      full_name: params.mentorName || 'Tú',
      email: 'alumno@utp.edu.pe',
      career: params.mentorCareer || 'Ingeniería de Software',
      campus: 'Campus San Juan',
      cycle: 8,
      reputation_score: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    course_id: params.courseId || null,
    title: params.title,
    description: params.description,
    service_type: params.serviceType,
    category: params.category,
    price_cents: params.priceCents,
    unit_label: params.unitLabel || 'por unidad',
    delivery_method: params.deliveryMethod || 'CAMPUS_MEET',
    campus_location: params.campusLocation || 'Campus San Juan',
    whatsapp_phone: params.whatsappPhone || '51987654321',
    stock_status: 'AVAILABLE_NOW',
    duration_minutes: params.durationMinutes,
    rating_avg: 5.0,
    total_reviews: 0,
    tags: params.tags || [],
    is_active: true,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('academic_services')
      .insert([
        {
          id: newId,
          mentor_name: params.mentorName,
          mentor_code: params.mentorCode,
          mentor_career: params.mentorCareer,
          course_id: params.courseId || null,
          title: params.title,
          description: params.description,
          service_type: params.serviceType,
          category: params.category,
          price_cents: params.priceCents,
          unit_label: params.unitLabel,
          delivery_method: params.deliveryMethod,
          campus_location: params.campusLocation,
          whatsapp_phone: params.whatsappPhone,
          duration_minutes: params.durationMinutes,
          rating_avg: 5.0,
          total_reviews: 0,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.warn('[Supabase] Non-fatal: falling back to memory/local listing', error);
      return newService;
    }

    return newService;
  } catch (e) {
    console.warn('[Supabase] Error in createServiceInDb, returning local object:', e);
    return newService;
  }
}

export async function createEscrowOrderInDb(params: {
  serviceId: string;
  amountCents: number;
  paymentMethod: 'YAPE' | 'PLIN' | 'WALLET' | 'CASH';
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
    return true; // Fallback success for client simulation
  }
}
