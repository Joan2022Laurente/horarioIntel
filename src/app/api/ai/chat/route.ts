import { NextRequest, NextResponse } from 'next/server';
import { queryOpenRouterWithFallback } from '@/lib/openrouter/client';
import { queryAssistant } from '@/lib/ai-assistant';
import { EMPTY_CALENDAR_RESPONSE } from '@/lib/mock-data';
import { getProcessedCourses } from '@/lib/schedule-parser';
import { UTPCalendarResponse } from '@/types/utp';
import { ParsedSyllabus } from '@/lib/syllabus/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = body.message || '';
    const rawData = (body.calendarData || EMPTY_CALENDAR_RESPONSE) as unknown as UTPCalendarResponse;
    const interval = rawData.data?.current_interval;
    const syllabiData = (body.syllabiData || {}) as Record<string, ParsedSyllabus>;

    if (!interval) {
      return NextResponse.json(
        { error: 'Datos de calendario no disponibles' },
        { status: 400 }
      );
    }

    const courses = getProcessedCourses(interval.events || []);

    // 1. Intentar responder mediante OpenRouter con fallback de claves y modelos dinámicos
    try {
      const openRouterResult = await queryOpenRouterWithFallback(message, {
        interval,
        courses,
        syllabiData,
      });

      return NextResponse.json({
        success: true,
        data: {
          answer: openRouterResult.answer,
          suggestedActions: openRouterResult.suggestedActions,
          modelUsed: openRouterResult.modelUsed,
          keyIndexUsed: openRouterResult.keyIndexUsed,
        },
      });
    } catch (openRouterErr) {
      console.warn('[AI Chat Route] OpenRouter no disponible, recurriendo al motor local de respaldo:', openRouterErr);

      // 2. Fallback al motor local
      const localResponse = queryAssistant(message, {
        interval,
        courses,
      });

      return NextResponse.json({
        success: true,
        data: {
          ...localResponse,
          modelUsed: 'local-utp-engine',
        },
      });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error procesando solicitud IA';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}


