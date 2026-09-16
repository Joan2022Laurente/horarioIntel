import { AcademicServiceRow, ServiceOrderRow, ServiceType, OrderStatus } from '@/types/economy';

export interface IEconomyService {
  getServicesByCourse(courseId?: string): Promise<AcademicServiceRow[]>;
  createService(data: Omit<AcademicServiceRow, 'id' | 'created_at' | 'rating_avg' | 'total_reviews'>): Promise<AcademicServiceRow>;
  createOrder(serviceId: string, buyerId: string, mentorId: string, amountCents: number): Promise<ServiceOrderRow>;
  completeOrder(orderId: string, verificationCode: string): Promise<boolean>;
}

export class EconomyService implements IEconomyService {
  async getServicesByCourse(courseId?: string): Promise<AcademicServiceRow[]> {
    // Implementación extensible con Supabase / REST
    return [];
  }

  async createService(data: Omit<AcademicServiceRow, 'id' | 'created_at' | 'rating_avg' | 'total_reviews'>): Promise<AcademicServiceRow> {
    return {
      ...data,
      id: `srv_${Date.now()}`,
      rating_avg: 5.0,
      total_reviews: 0,
      created_at: new Date().toISOString(),
    };
  }

  async createOrder(serviceId: string, buyerId: string, mentorId: string, amountCents: number): Promise<ServiceOrderRow> {
    return {
      id: `ord_${Date.now()}`,
      service_id: serviceId,
      buyer_id: buyerId,
      mentor_id: mentorId,
      amount_cents: amountCents,
      platform_fee_cents: Math.round(amountCents * 0.1),
      status: 'ESCROW_HELD' as OrderStatus,
      verification_code: Math.floor(100000 + Math.random() * 900000).toString(),
      created_at: new Date().toISOString(),
    };
  }

  async completeOrder(_orderId: string, _verificationCode: string): Promise<boolean> {
    return true;
  }
}

export const economyService = new EconomyService();
