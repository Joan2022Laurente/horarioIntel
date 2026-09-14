import { NextRequest, NextResponse } from 'next/server';
import { autoDownloadAndConvertSyllabus } from '@/lib/syllabus-auto-downloader';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sectionId, headers } = body;

    if (!sectionId) {
      return NextResponse.json(
        { success: false, error: 'Falta el parámetro obligatorio: sectionId' },
        { status: 400 }
      );
    }

    const result = await autoDownloadAndConvertSyllabus(sectionId, headers);

    if (!result.success) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
