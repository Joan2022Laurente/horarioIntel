import { NextRequest, NextResponse } from 'next/server';
import { autoDownloadAndConvertSyllabus, SyllabusDownloadOptions } from '@/lib/syllabus-auto-downloader';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sectionId, pdfUrl, courseCode, courseName, headers } = body;

    if (!sectionId && !pdfUrl && !courseCode) {
      return NextResponse.json(
        { success: false, error: 'Debe especificar sectionId, pdfUrl o courseCode.' },
        { status: 400 }
      );
    }

    const options: SyllabusDownloadOptions = {
      sectionId,
      pdfUrl,
      courseCode,
      courseName,
      gatewayHeaders: headers
    };

    const result = await autoDownloadAndConvertSyllabus(options);

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

