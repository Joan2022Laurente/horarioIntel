import { NextRequest, NextResponse } from 'next/server';
import { queryAssistant } from '@/lib/ai-assistant';
import { EMPTY_CALENDAR_RESPONSE } from '@/lib/mock-data';
import { getProcessedCourses } from '@/lib/schedule-parser';
import { UTPCalendarResponse } from '@/types/utp';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = body.message || '';
    const rawData = (body.calendarData || EMPTY_CALENDAR_RESPONSE) as unknown as UTPCalendarResponse;
    const interval = rawData.data?.current_interval;

    if (!interval) {
      return NextResponse.json(
        { error: 'Datos de calendario no disponibles' },
        { status: 400 }
      );
    }

    const courses = getProcessedCourses(interval.events || []);
    const aiResponse = queryAssistant(message, {
      interval,
      courses,
    });

    return NextResponse.json({
      success: true,
      data: aiResponse,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error procesando solicitud IA';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
