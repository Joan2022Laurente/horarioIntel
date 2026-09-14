import { NextRequest, NextResponse } from 'next/server';
import defaultCalendar from '@/data/calendario.json';
import { UTPClient } from '@/lib/utp-client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const tenantId = req.headers.get('x-tenant-id') || 'a5f469d2-3c0e-5c68-8d32-5265923a8e40';
    const dateToQuery = searchParams.get('dateToQuery') || undefined;
    const intervalMode = searchParams.get('intervalMode') || 'period';

    // Si viene token y userId activo, intentar conectar a la API en vivo de UTP
    if (token && userId) {
      const client = new UTPClient({ token, tenantId, userId });
      try {
        const liveData = await client.getCalendar({ userId, dateToQuery, intervalMode });
        return NextResponse.json(liveData);
      } catch (err: unknown) {
        console.warn('API UTP Live request failed, falling back to local dataset:', err);
      }
    }

    // Fallback a los datos locales
    return NextResponse.json(defaultCalendar);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
