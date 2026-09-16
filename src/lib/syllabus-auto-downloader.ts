import { extractText } from 'unpdf';
import { parseSyllabusMarkdown, ParsedSyllabus, OFFICIAL_SYLLABUS_REGISTRY, getSyllabusForCourse } from './syllabus-parser';

export interface SyllabusDownloadOptions {
  sectionId?: string;
  pdfUrl?: string;
  courseCode?: string;
  courseName?: string;
  gatewayHeaders?: Record<string, string>;
}

export interface SyllabusDownloadResult {
  success: boolean;
  syllabusUrl?: string;
  courseCode?: string;
  courseName?: string;
  markdown?: string;
  parsedSyllabus?: ParsedSyllabus;
  fallback?: boolean;
  error?: string;
}

/**
 * Servicio de extracción inteligente de sílabos UTP en tiempo real:
 * 1. Si se provee pdfUrl, intenta descarga directa desde AWS S3.
 * 2. Si se requiere autorización o solo se provee sectionId, consulta la API oficial UTP PAO.
 * 3. Extrae texto binario con unpdf sin dependencias de workers externos.
 * 4. Parsea en vivo datos generales, logros, fórmulas, rúbricas y cronograma (semanas 1-18).
 * 5. Si la red externa de UTP bloquea por 403/Auth, utiliza el respaldo verificado como fallback seguro.
 */
export async function autoDownloadAndConvertSyllabus(
  optionsOrSectionId: string | SyllabusDownloadOptions,
  legacyGatewayHeaders?: Record<string, string>
): Promise<SyllabusDownloadResult> {
  const options: SyllabusDownloadOptions = typeof optionsOrSectionId === 'string'
    ? { sectionId: optionsOrSectionId, gatewayHeaders: legacyGatewayHeaders }
    : optionsOrSectionId;

  const { sectionId, pdfUrl: directPdfUrl, courseCode, courseName, gatewayHeaders } = options;

  let targetPdfUrl = directPdfUrl;

  try {
    // 1. Si no hay directPdfUrl o si necesitamos resolver la URL firmada por sectionId
    if (!targetPdfUrl && sectionId) {
      const apiUrl = `https://api-pao.utpxpedition.com/course/student/sections/${sectionId}/syllabus`;
      const apiRes = await fetch(apiUrl, {
        headers: {
          'accept': 'application/json, text/plain, */*',
          ...(gatewayHeaders || {})
        }
      });

      if (apiRes.ok) {
        const apiJson = await apiRes.json();
        targetPdfUrl = apiJson.data?.syllabusUrl;
      }
    }

    // 2. Si tenemos URL de PDF, intentar descarga y extracción en vivo
    if (targetPdfUrl) {
      const pdfRes = await fetch(targetPdfUrl);
      
      if (pdfRes.ok) {
        const arrayBuffer = await pdfRes.arrayBuffer();
        const { text } = await extractText(new Uint8Array(arrayBuffer));
        const fullText = Array.isArray(text) ? text.join('\n\n') : (text || '');

        if (fullText && fullText.trim().length > 50) {
          const markdown = `# SÍLABO OFICIAL UTP\n\n${fullText}`;
          const parsed = parseSyllabusMarkdown(fullText);

          // Si el parser no detectó código del texto pero lo teníamos en opciones
          if (!parsed.generalInfo.courseCode && courseCode) {
            parsed.generalInfo.courseCode = courseCode;
          }
          if ((!parsed.generalInfo.courseName || parsed.generalInfo.courseName.includes('CURSO')) && courseName) {
            parsed.generalInfo.courseName = courseName;
          }

          // Registrar en memoria viva
          const finalCode = parsed.generalInfo.courseCode || courseCode || '100000';
          OFFICIAL_SYLLABUS_REGISTRY[finalCode] = parsed;

          return {
            success: true,
            syllabusUrl: targetPdfUrl,
            courseCode: finalCode,
            courseName: parsed.generalInfo.courseName,
            markdown,
            parsedSyllabus: parsed
          };
        }
      }
    }

    // 3. Fallback de contingencia (si S3 requiere VPN / token firmado que expiró)
    const fallbackCourseKey = courseCode || courseName || sectionId || '';
    const fallbackSyllabus = getSyllabusForCourse(fallbackCourseKey);

    if (fallbackSyllabus) {
      return {
        success: true,
        syllabusUrl: targetPdfUrl,
        courseCode: fallbackSyllabus.generalInfo.courseCode,
        courseName: fallbackSyllabus.generalInfo.courseName,
        parsedSyllabus: fallbackSyllabus,
        fallback: true
      };
    }

    return {
      success: false,
      error: 'No se pudo descargar el PDF de S3 ni se encontró registro de contingencia.'
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    
    // Intento de rescate con fallback
    const fallbackKey = courseCode || courseName || '';
    const fallbackSyllabus = fallbackKey ? getSyllabusForCourse(fallbackKey) : null;
    if (fallbackSyllabus) {
      return {
        success: true,
        courseCode: fallbackSyllabus.generalInfo.courseCode,
        courseName: fallbackSyllabus.generalInfo.courseName,
        parsedSyllabus: fallbackSyllabus,
        fallback: true
      };
    }

    return {
      success: false,
      error: `Falla en el proceso de extracción en tiempo real: ${message}`
    };
  }
}

