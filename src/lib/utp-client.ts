import { UTPCalendarResponse, UTPSyllabusResponse } from '@/types/utp';

export interface UTPRequestOptions {
  token: string;
  tenantId: string;
  userId: string;
  userRole?: string;
}

export class UTPClient {
  private baseUrl = 'https://api-pao.utpxpedition.com';

  constructor(private defaultOptions?: Partial<UTPRequestOptions>) {}

  private getHeaders(options?: Partial<UTPRequestOptions>): HeadersInit {
    const opts = { ...this.defaultOptions, ...options };
    return {
      'Authorization': `Bearer ${opts.token || ''}`,
      'x-tenant-id': opts.tenantId || 'a5f469d2-3c0e-5c68-8d32-5265923a8e40',
      'user-id': opts.userId || '',
      'user-role': opts.userRole || 'STUDENT',
      'origin': 'https://class.utp.edu.pe',
      'referer': 'https://class.utp.edu.pe/',
      'Accept': 'application/json, text/plain, */*',
    };
  }

  async getCalendar(
    params: {
      userId: string;
      dateToQuery?: string;
      intervalMode?: string;
    },
    options?: Partial<UTPRequestOptions>
  ): Promise<UTPCalendarResponse> {
    const query = new URLSearchParams({
      userId: params.userId,
      dateToQuery: params.dateToQuery || new Date().toISOString().slice(0, 10) + ' 00:00:00',
      intervalMode: params.intervalMode || 'period',
    });

    const response = await fetch(`${this.baseUrl}/course/student/calendar?${query.toString()}`, {
      method: 'GET',
      headers: this.getHeaders({ ...options, userId: params.userId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en API UTP (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async getSyllabus(
    courseId: string,
    sectionId: string,
    options?: Partial<UTPRequestOptions>
  ): Promise<UTPSyllabusResponse> {
    const response = await fetch(
      `${this.baseUrl}/course/student/courses/${courseId}/sections/${sectionId}/syllabus`,
      {
        method: 'GET',
        headers: this.getHeaders(options),
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener sílabo (${response.status})`);
    }

    return response.json();
  }
}
