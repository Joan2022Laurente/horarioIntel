import { NextRequest, NextResponse } from 'next/server';
import { getOfficialHomeworkResume } from '@/lib/tasks/homework-resumes';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get('sectionId');
    const homeworkId = searchParams.get('homeworkId') || searchParams.get('activityId');

    if (!sectionId || !homeworkId) {
      return NextResponse.json(
        { success: false, message: 'Faltan parámetros requeridos: sectionId y homeworkId' },
        { status: 400 }
      );
    }

    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const userId = req.headers.get('user-id') || '4e535263-79a0-5890-ae33-72a7aa0629ab';
    const tenantId = req.headers.get('x-tenant-id') || 'a5f469d2-3c0e-5c68-8d32-5265923a8e40';

    // 1. Si el usuario cuenta con token en vivo, intentar consultar API oficial UTP
    if (token) {
      try {
        const liveUrl = `https://api-pao.utpxpedition.com/course/student/sections/${sectionId}/homeworks/${homeworkId}/resume`;
        const res = await fetch(liveUrl, {
          headers: {
            'accept': '*/*',
            'authorization': `Bearer ${token}`,
            'user-id': userId,
            'user-role': 'STUDENT',
            'x-tenant-id': tenantId,
            'Referer': 'https://class.utp.edu.pe/'
          }
        });

        if (res.ok) {
          const json = await res.json();
          return NextResponse.json(json);
        }
      } catch (err) {
        console.warn('Fallo al consultar API oficial UTP homework resume, recurriendo a cache:', err);
      }
    }

    // 2. Fallback a registros oficiales verificados
    const cached = getOfficialHomeworkResume(homeworkId);
    if (cached) {
      return NextResponse.json({
        success: true,
        code: 200,
        message: 'Resumen obtenido del registro oficial verificado',
        data: cached
      });
    }

    return NextResponse.json(
      { success: false, message: 'No se encontraron indicaciones para esta tarea.' },
      { status: 404 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
