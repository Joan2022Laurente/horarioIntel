import { extractText } from 'unpdf';
import { parseSyllabusMarkdown, ParsedSyllabus, OFFICIAL_SYLLABUS_REGISTRY } from './syllabus-parser';

export interface SyllabusDownloadResult {
  success: boolean;
  syllabusUrl?: string;
  courseCode?: string;
  courseName?: string;
  markdown?: string;
  parsedSyllabus?: ParsedSyllabus;
  error?: string;
}

/**
 * Servicio de extracción inteligente de sílabos UTP:
 * 1. Consulta la URL oficial del PDF en S3 vía API UTP+class.
 * 2. Descarga el binario PDF directamente de AWS S3.
 * 3. Extrae el texto con unpdf (soporte nativo para Serverless / Next.js sin workers).
 * 4. Parsea unidades, logros, fórmulas y cronograma, registrándolo dinámicamente en memoria.
 */
export async function autoDownloadAndConvertSyllabus(
  sectionId: string,
  gatewayHeaders?: Record<string, string>
): Promise<SyllabusDownloadResult> {
  try {
    // 1. Obtener la URL oficial del sílabo en AWS S3
    const apiUrl = `https://api-pao.utpxpedition.com/course/student/sections/${sectionId}/syllabus`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        'accept': 'application/json, text/plain, */*',
        ...(gatewayHeaders || {})
      }
    });

    if (!apiRes.ok) {
      return {
        success: false,
        error: `Error al consultar API UTP (${apiRes.status}): ${apiRes.statusText}`
      };
    }

    const apiJson = await apiRes.json();
    const syllabusUrl: string | undefined = apiJson.data?.syllabusUrl;

    if (!syllabusUrl) {
      return {
        success: false,
        error: 'El endpoint de UTP no retornó syllabusUrl para esta sección.'
      };
    }

    // 2. Descargar binario PDF desde AWS S3
    const pdfRes = await fetch(syllabusUrl);
    if (!pdfRes.ok) {
      return {
        success: false,
        syllabusUrl,
        error: `Error al descargar PDF de S3 (${pdfRes.status})`
      };
    }

    const arrayBuffer = await pdfRes.arrayBuffer();

    // 3. Extracción de texto estructurado con unpdf
    const { text } = await extractText(new Uint8Array(arrayBuffer));
    const fullText = Array.isArray(text) ? text.join('\n\n') : (text || '');

    if (!fullText || fullText.trim().length === 0) {
      return {
        success: false,
        syllabusUrl,
        error: 'El PDF descargado no contiene texto legible.'
      };
    }

    // 4. Formateo a Markdown
    const markdown = `# SÍLABO OFICIAL UTP\n\n${fullText}`;

    // 5. Ingesta inteligente mediante syllabus-parser
    const parsed = parseSyllabusMarkdown(markdown);

    // 6. Registro dinámico en memoria
    if (parsed.generalInfo.courseCode) {
      OFFICIAL_SYLLABUS_REGISTRY[parsed.generalInfo.courseCode] = parsed;
    }

    return {
      success: true,
      syllabusUrl,
      courseCode: parsed.generalInfo.courseCode,
      courseName: parsed.generalInfo.courseName,
      markdown,
      parsedSyllabus: parsed
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Falla en el proceso de auto-descarga: ${message}`
    };
  }
}
