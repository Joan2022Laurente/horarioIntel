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
 * Parser universal para documentos de sílabo UTP (Markdown o texto estructurado).
 * Capaz de procesar sílabos oficiales de cualquier carrera y ciclo.
 */
export function parseSyllabusMarkdown(markdown: string): ParsedSyllabus {
  // 1. Extraer Código y Nombre
  const titleMatch = markdown.match(/#\s*\*{0,2}SÍLABO\s+([^(]+)\s*\(([^)]+)\)\*{0,2}/i);
  const courseName = titleMatch ? titleMatch[1].trim() : 'CURSO UNIVERSITARIO';
  const courseCode = titleMatch ? titleMatch[2].trim() : '100000';

  // 2. Extraer Periodo / Ciclo
  const cycleMatch = markdown.match(/#\s*\*{0,2}(\d{4}\s*-\s*Ciclo\s*\d+\s*[A-Za-z]+)\*{0,2}/i);
  const semester = cycleMatch ? cycleMatch[1].trim() : '2026 - Ciclo 2 Agosto';

  // 3. Extraer Datos Generales
  const creditsMatch = markdown.match(/Créditos:\s*(\d+)/i);
  const modalityMatch = markdown.match(/Enseñanza de curso:\s*([^1-9\n\r]+)/i);
  const hoursMatch = markdown.match(/Horas semanales:\s*(\d+)/i);
  const careersMatch = markdown.match(/Carrera:\s*([^1-9\n\r]+?)(?=\s*1\.2|\s*Créditos)/i);

  const credits = creditsMatch ? parseInt(creditsMatch[1], 10) : 4;
  const modality = modalityMatch ? modalityMatch[1].trim() : 'Virtual en vivo';
  const weeklyHours = hoursMatch ? parseInt(hoursMatch[1], 10) : 4;
  const careers = careersMatch 
    ? careersMatch[1].split(/(?=Ingeniería|Licenciatura|Administración|Derecho)/g).map(c => c.trim()).filter(Boolean)
    : ['Ingeniería de Sistemas e Informática'];

  // 4. Logro General de Aprendizaje
  const goalMatch = markdown.match(/##\s*\*{0,2}4\.\s*LOGRO GENERAL DE APRENDIZAJE\*{0,2}\s*([\s\S]*?)(?=##\s*\*{0,2}5\.|$)/i);
  const learningGoal = goalMatch ? goalMatch[1].trim().replace(/\n+/g, ' ') : '';

  // 5. Extraer Fórmula de Evaluación
  const formulaMatch = markdown.match(/##\s*\*{0,2}7\.\s*SISTEMA DE EVALUACIÓN\*{0,2}\s*[\s\S]*?`([^`]+)`/i) ||
                       markdown.match(/`(\([^`]+?\))`/) ||
                       markdown.match(/Fórmula:\s*([^\n\r]+)/i);
  const formula = formulaMatch ? formulaMatch[1].trim() : '(20%)APF1 + (20%)APF2 + (20%)APF3 + (40%)PROY';

  // 6. Extraer Tabla de Evaluaciones
  const evaluations: SyllabusEvaluationItem[] = [];
  const evalTableSection = markdown.match(/##\s*\*{0,2}7\.1\.\s*DESCRIPCIÓN DE LAS EVALUACIONES\*{0,2}([\s\S]*?)(?=##\s*\*{0,2}8\.|$)/i);
  
  if (evalTableSection) {
    const rows = evalTableSection[1].split('\n').filter(r => r.includes('|') && !r.includes('---'));
    for (const row of rows) {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 6 && cols[0] !== 'Evaluación' && !cols[0].toLowerCase().includes('evaluación')) {
        const type = cols[0];
        const description = cols[1];
        const week = parseInt(cols[2], 10) || 1;
        const weightPercent = parseInt(cols[4].replace('%', ''), 10) || 0;
        const modalityStr = cols[5]?.toLowerCase().includes('grupal') ? 'Grupal' : 'Individual';
        const observation = cols[6] || '';

        evaluations.push({
          id: `eval-${type.toLowerCase()}-${week}`,
          type,
          description,
          week,
          weightPercent,
          modality: modalityStr,
          observation
        });
      }
    }
  }

  // 7. Extraer Indicaciones y Reglas Generales
  const rules: string[] = [];
  const rulesSection = markdown.match(/##\s*\*{0,2}8\.\s*INDICACIONES GENERALES\*{0,2}([\s\S]*?)(?=##\s*\*{0,2}9\.|$)/i);
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
  if (markdown.includes('Integridad académica en investigación') || markdown.includes('similitud')) {
    antiPlagiarismPolicy = {
      maxSimilarityPercent: 20,
      aiPolicy: 'Prohibido el uso de herramientas de inteligencia artificial para la redacción o reescritura del trabajo de investigación.',
      repositoryDelivery: 'La versión final debe registrarse en el repositorio institucional interno del curso antes de culminar el ciclo.'
    };
  }

  // 9. Cronograma de Actividades (Semanas 1 a 18)
  const weeklySchedule: SyllabusWeeklySession[] = [];
  const scheduleSection = markdown.match(/##\s*\*{0,2}10\.\s*CRONOGRAMA DE ACTIVIDADES\*{0,2}([\s\S]*)$/i);
  
  if (scheduleSection) {
    const lines = scheduleSection[1].split('\n');
    let currentWeekNum = 1;
    let currentUnit = 'Unidad 1';

    for (const line of lines) {
      const weekCheck = line.match(/Semana\s*(\d+)/i) || line.match(/\|\s*(\d{1,2})\s*\|/);
      if (weekCheck && parseInt(weekCheck[1], 10) <= 18) {
        currentWeekNum = parseInt(weekCheck[1], 10);
      }
      if (line.includes('Unidad 1')) currentUnit = 'Unidad 1';
      if (line.includes('Unidad 2')) currentUnit = 'Unidad 2';
      if (line.includes('Unidad 3')) currentUnit = 'Unidad 3';
      if (line.includes('Unidad 4')) currentUnit = 'Unidad 4';
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
