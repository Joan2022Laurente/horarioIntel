import { NextRequest, NextResponse } from 'next/server';
import { queryOpenRouterWithFallback } from '@/lib/openrouter/client';
import { queryAssistant } from '@/lib/ai-assistant';
import { EMPTY_CALENDAR_RESPONSE } from '@/lib/mock-data';
import { getProcessedCourses } from '@/lib/schedule-parser';
import { UTPCalendarResponse } from '@/types/utp';
import { ParsedSyllabus } from '@/lib/syllabus/types';
import { AgentLiveContext } from '@/types/agent';
import { checkAndConsumeServerDailyQuota } from '@/lib/rate-limit/daily-limiter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message: string = body.message || '';
    const rawData = (body.calendarData || EMPTY_CALENDAR_RESPONSE) as unknown as UTPCalendarResponse;
    const interval = rawData.data?.current_interval;
    const syllabiData = (body.syllabiData || {}) as Record<string, ParsedSyllabus>;
    const liveContext = body.liveContext as AgentLiveContext | undefined;
    const userIdentifier: string =
      body.userId ||
      body.studentCode ||
      body.studentProfile?.userId ||
      body.studentProfile?.email ||
      req.headers.get('x-user-id') ||
      'anonymous_user';

    // 0. Verificación estricta de Cuota Diaria (6 consultas / día salvo cuenta ilimitada)
    const quota = checkAndConsumeServerDailyQuota(userIdentifier);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          success: false,
          rateLimitReached: true,
          error: 'Has alcanzado el límite de 6 consultas diarias durante la fase de pruebas. Tu cuota se reiniciará automáticamente a las 00:00.',
          quota: quota.status,
        },
        { status: 429 }
      );
    }

    if (!interval) {
      return NextResponse.json(
        { error: 'Datos de calendario no disponibles' },
        { status: 400 }
      );
    }

    const courses = getProcessedCourses(interval.events || []);

    // 1. Responder mediante OpenRouter con soporte para herramientas y Live Context
    try {
      const openRouterResult = await queryOpenRouterWithFallback(message, {
        interval,
        courses,
        syllabiData,
        liveContext,
      });

      return NextResponse.json({
        success: true,
        data: {
          answer: openRouterResult.answer,
          suggestedActions: openRouterResult.suggestedActions,
          action: openRouterResult.action,
          contextInfo: openRouterResult.contextInfo,
          modelUsed: openRouterResult.modelUsed,
          keyIndexUsed: openRouterResult.keyIndexUsed,
        },
      });
    } catch (openRouterErr) {
      console.warn('[AI Chat Route] Fallback a motor local:', openRouterErr);

      // 2. Fallback al motor local dinámico
      const localResponse = queryAssistant(message, {
        interval,
        courses,
        syllabiData,
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
