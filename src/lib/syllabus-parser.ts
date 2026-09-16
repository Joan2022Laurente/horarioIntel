import { CourseEvaluation } from '@/types/utp';
import { 
  SyllabusGeneralInfo, 
  SyllabusEvaluationItem, 
  SyllabusWeeklySession, 
  ParsedSyllabus 
} from './syllabus/types';

// Re-export types and official registry so existing callers remain 100% compatible
export * from './syllabus/types';
export * from './syllabus/official-registry';

/**
 * Parser universal para documentos de sílabo UTP (Markdown o texto plano extraído de PDF).
 * Capaz de procesar sílabos oficiales de cualquier carrera, facultad y ciclo en tiempo real.
 */
export function parseSyllabusMarkdown(text: string): ParsedSyllabus {
  const cleanText = text.replace(/\r\n/g, '\n');

  // 1. Extraer Código y Nombre
  const titleMatch = cleanText.match(/(?:#\s*)?SÍLABO\s*\n?\s*([^(]+?)\s*\(([A-Z0-9_]{6,12})\)/i) ||
                     cleanText.match(/#\s*\*{0,2}SÍLABO\s+([^(]+)\s*\(([^)]+)\)\*{0,2}/i);
  
  let courseName = titleMatch ? titleMatch[1].trim() : '';
  let courseCode = titleMatch ? titleMatch[2].trim() : '';

  if (!courseName) {
    const headerLineMatch = cleanText.match(/([A-ZÁÉÍÓÚÑ\s\-]{4,50})\s*\(([A-Z0-9_]{6,12})\)/);
    if (headerLineMatch) {
      courseName = headerLineMatch[1].trim();
      courseCode = headerLineMatch[2].trim();
    } else {
      courseName = 'CURSO UNIVERSITARIO UTP';
      courseCode = '100000';
    }
  }

  // 2. Extraer Periodo / Ciclo
  const cycleMatch = cleanText.match(/(\d{4}\s*-\s*Ciclo\s*\d+\s*[A-Za-z]+)/i);
  const semester = cycleMatch ? cycleMatch[1].trim() : '2026 - Ciclo 2 Agosto';

  // 3. Extraer Datos Generales
  const creditsMatch = cleanText.match(/Créditos:\s*(\d+)/i);
  const modalityMatch = cleanText.match(/Enseñanza de curso:\s*([^\n\r]+)/i);
  const hoursMatch = cleanText.match(/Horas semanales:\s*(\d+)/i);
  const careersMatch = cleanText.match(/Carrera:\s*([\s\S]*?)(?=\s*1\.2|\s*Créditos|\n\s*2\.|\n\s*\d+\.\d+)/i);

  const credits = creditsMatch ? parseInt(creditsMatch[1], 10) : 4;
  const modality = modalityMatch ? modalityMatch[1].trim() : 'Presencial';
  const weeklyHours = hoursMatch ? parseInt(hoursMatch[1], 10) : 4;
  const careers = careersMatch 
    ? careersMatch[1].split('\n').map(c => c.trim()).filter(c => c.length > 2)
    : ['Ingeniería de Sistemas e Informática'];

  // 4. Logro General de Aprendizaje
  const goalMatch = cleanText.match(/(?:##\s*)?4\.\s*LOGRO GENERAL DE APRENDIZAJE\s*([\s\S]*?)(?=(?:##\s*)?5\.\s*UNIDADES|\n\s*5\.|$)/i);
  const learningGoal = goalMatch ? goalMatch[1].trim().replace(/\n+/g, ' ') : '';

  // 5. Extraer Fórmula de Evaluación
  const formulaMatch = cleanText.match(/\(\d+%\)[A-Za-z0-9_]+(?:\s*\+\s*\(\d+%\)[A-Za-z0-9_]+)+/i) ||
                       cleanText.match(/`(\([^`]+?\))`/) ||
                       cleanText.match(/Fórmula:\s*([^\n\r]+)/i);
  const formula = formulaMatch ? formulaMatch[0].trim() : '(20%)PC1 + (20%)PC2 + (20%)PC3 + (40%)PROY';

  // Construir mapa de ponderaciones a partir de la fórmula
  const weightMap: Record<string, number> = {};
  const weightRegex = /\((\d{1,2})%\)([A-Z0-9_]+)/gi;
  let wm;
  while ((wm = weightRegex.exec(formula)) !== null) {
    weightMap[wm[2].toUpperCase()] = parseInt(wm[1], 10);
  }

  // 6. Extraer Tabla de Evaluaciones (Markdown o Texto Plano de PDF)
  const evaluations: SyllabusEvaluationItem[] = [];
  
  // Intento A: Formato Tabla Markdown con pipes '|'
  const evalTableSection = cleanText.match(/##\s*\*{0,2}7\.1\.\s*DESCRIPCIÓN DE LAS EVALUACIONES\*{0,2}([\s\S]*?)(?=##\s*\*{0,2}8\.|$)/i);
  if (evalTableSection && evalTableSection[1].includes('|')) {
    const rows = evalTableSection[1].split('\n').filter(r => r.includes('|') && !r.includes('---'));
    for (const row of rows) {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 6 && cols[0] !== 'Evaluación' && !cols[0].toLowerCase().includes('evaluación')) {
        const type = cols[0].toUpperCase();
        const description = cols[1];
        const week = parseInt(cols[2], 10) || 1;
        const weightPercent = weightMap[type] || parseInt(cols[4].replace('%', ''), 10) || 20;
        const modalityStr = cols[5]?.toLowerCase().includes('grupal') ? 'Grupal' : 'Individual';
        const observation = cols[6] || '';

        evaluations.push({
          id: `eval-${type.toLowerCase()}-${week}`,
          type,
          description,
          week,
          weightPercent,
          modality: modalityStr,
          observation,
          rules: [`Semana ${week}`, `Ponderación ${weightPercent}%`, modalityStr]
        });
      }
    }
  }

  // Intento B: Formato Texto Plano Extraído de PDF UTP
  if (evaluations.length === 0) {
    const evalBlockMatch = cleanText.match(/Donde:\s*\n\s*Tipo\s+Descripción\s+Semana\s+Observación([\s\S]*?)(?=Indicaciones|8\.\s*FUENTES|##\s*8\.|$)/i) ||
                           cleanText.match(/7\.1\.\s*DESCRIPCIÓN DE LAS EVALUACIONES([\s\S]*?)(?=Indicaciones|8\.\s*FUENTES|##\s*8\.|$)/i);
    
    if (evalBlockMatch) {
      const evalLines = evalBlockMatch[1].split('\n');
      for (const line of evalLines) {
        const rowMatch = line.trim().match(/^([A-Z0-9_]{2,8})\s+(.+?)\s+(\d{1,2})\s+(Individual|Grupal|Flexible)/i);
        if (rowMatch) {
          const type = rowMatch[1].toUpperCase();
          const description = rowMatch[2].trim();
          const week = parseInt(rowMatch[3], 10);
          const modalityStr = (rowMatch[4].toLowerCase().includes('grupal') ? 'Grupal' : 'Individual') as 'Grupal' | 'Individual';
          const weightPercent = weightMap[type] || 20;

          evaluations.push({
            id: `eval-${type.toLowerCase()}-${week}`,
            type,
            description,
            week,
            weightPercent,
            modality: modalityStr,
            observation: `${modalityStr}. ${description}.`,
            rules: [`Semana ${week}`, `Ponderación ${weightPercent}%`, modalityStr]
          });
        }
      }
    }
  }

  // 7. Extraer Indicaciones y Reglas Generales
  const rules: string[] = [];
  const rulesSection = cleanText.match(/Indicaciones sobre Fórmulas de Evaluación:\s*([\s\S]*?)(?=8\.\s*FUENTES|##\s*8\.|$)/i) ||
                       cleanText.match(/(?:##\s*)?8\.\s*INDICACIONES GENERALES\s*([\s\S]*?)(?=(?:##\s*)?9\.|$)/i);
  if (rulesSection) {
    const lines = rulesSection[1].split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.match(/^\d+\./)) {
        rules.push(trimmed.replace(/^[-*\d.]+\s*/, ''));
      }
    }
  }

  // 8. Políticas de Integridad y Plagio
  let antiPlagiarismPolicy: ParsedSyllabus['antiPlagiarismPolicy'];
  if (cleanText.includes('Integridad académica') || cleanText.includes('similitud') || cleanText.includes('plagio')) {
    antiPlagiarismPolicy = {
      maxSimilarityPercent: 20,
      aiPolicy: 'Permitido el uso responsable de IA para asistencia y depuración, prohibida la copia íntegra no documentada.',
      repositoryDelivery: 'Registro obligatorio con historial de commits y entrega en plataforma oficial.'
    };
  }

  // 9. Cronograma de Actividades (Semanas 1 a 18)
  const weeklySchedule: SyllabusWeeklySession[] = [];
  const scheduleSection = cleanText.match(/(?:10\.\s*CRONOGRAMA DE ACTIVIDADES|10\.CRONOGRAMA DE ACTIVIDADES)([\s\S]*)$/i);
  
  if (scheduleSection) {
    const lines = scheduleSection[1].split('\n');
    let currentUnit = 'Unidad 1';

    for (const line of lines) {
      if (line.includes('Unidad 1')) currentUnit = 'Unidad 1';
      if (line.includes('Unidad 2')) currentUnit = 'Unidad 2';
      if (line.includes('Unidad 3')) currentUnit = 'Unidad 3';
      if (line.includes('Unidad 4')) currentUnit = 'Unidad 4';

      // Coincidencia de fila semanal
      const rowMatch = line.trim().match(/^(\d{1,2})\s+(\d{1,2})\s+(.+)$/);
      if (rowMatch) {
        const week = parseInt(rowMatch[1], 10);
        const session = parseInt(rowMatch[2], 10);
        const topic = rowMatch[3].trim();
        
        let evaluationName: string | undefined;
        if (topic.includes('Evaluación') || topic.includes('APF') || topic.includes('PC') || topic.includes('PROY') || topic.includes('EXAMEN')) {
          const evalMatch = topic.match(/(APF\d|PC\d|ATI\d|TA\d|EP|EF|PROY|TI|TF)/i);
          if (evalMatch) evaluationName = evalMatch[1].toUpperCase();
        }

        weeklySchedule.push({
          week,
          session,
          unit: currentUnit,
          topic,
          evaluation: evaluationName
        });
      }
    }
  }

  return {
    id: courseCode,
    generalInfo: {
      courseCode,
      courseName,
      semester,
      credits,
      modality,
      weeklyHours,
      careers,
    },
    learningGoal,
    formula,
    evaluations,
    rules,
    antiPlagiarismPolicy,
    weeklySchedule,
  };
}

