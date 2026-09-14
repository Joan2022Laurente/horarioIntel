import { 
  CourseAssignment, 
  SyllabusWeekSyncContext, 
  TaskWithSyllabusContext 
} from '@/types/utp';
import { getSyllabusForCourse } from './syllabus-parser';
import { VERIFIED_ASSIGNMENT_RUBRICS } from './rubrics/verified-rubrics';
import { ACTIVE_STUDENT_TASKS } from './tasks/active-tasks';

// Re-export for backward compatibility
export { VERIFIED_ASSIGNMENT_RUBRICS } from './rubrics/verified-rubrics';
export { ACTIVE_STUDENT_TASKS } from './tasks/active-tasks';

/**
 * Resuelve y sincroniza el contexto del sílabo oficial para una semana dada en cualquier curso.
 * Este motor permite vincular automáticamente los temas teóricos, unidades y fórmulas a las tareas.
 */
export function getSyllabusWeekContext(courseNameOrId: string, weekNumber: number): SyllabusWeekSyncContext {
  const syllabus = getSyllabusForCourse(courseNameOrId);
  const courseUpper = courseNameOrId.toUpperCase();

  // 1. Detección de Unidad
  let unitNumber = 1;
  let unitTitle = 'Unidad 1: Fundamentos y Conceptos Clave';
  if (weekNumber >= 5 && weekNumber <= 8) {
    unitNumber = 2;
    unitTitle = 'Unidad 2: Metodología, Diseño y Aplicación Práctica';
  } else if (weekNumber >= 9 && weekNumber <= 13) {
    unitNumber = 3;
    unitTitle = 'Unidad 3: Procesamiento, Integración y Resultados';
  } else if (weekNumber >= 14) {
    unitNumber = 4;
    unitTitle = 'Unidad 4: Discusión, Conclusiones y Sustentación Final';
  }

  // 2. Temas específicos por curso y semana
  let sessionTopics: string[] = [];
  let learningOutcome = 'Desarrollo de competencias técnicas y conceptuales según cronograma.';
  let activities: string[] = ['Sesión síncrona en vivo', 'Taller práctico de resolución de ejercicios'];

  if (courseUpper.includes('WEB INTEGRADO')) {
    if (weekNumber <= 5) {
      unitNumber = 1;
      unitTitle = 'Unidad 1: API REST (Semanas 1 a 5)';
      learningOutcome = 'Implementa una API RESTful de back-end mediante el framework Spring Boot considerando el desarrollo guiado por pruebas (TDD).';
    } else if (weekNumber <= 10) {
      unitNumber = 2;
      unitTitle = 'Unidad 2: Back-end con bases de datos (Semanas 6 a 10)';
      learningOutcome = 'Construye aplicaciones RESTful con bases de datos relacionales en Spring Boot (JPA / Hibernate / JWT).';
    } else {
      unitNumber = 3;
      unitTitle = 'Unidad 3: Integración de proyectos webs (back-end y front-end) (Semanas 11 a 18)';
      learningOutcome = 'Integra proyectos de Back-end con Front-end (Angular) mediante métodos REST.';
    }

    if (weekNumber === 4) {
      sessionTopics = [
        'Implementación de API REST en Spring Boot',
        'Herramientas de prueba de API REST (Postman / Swagger)',
        'Métodos HTTP y sus usos en la práctica'
      ];
      activities = ['Exposición docente', 'Pruebas de endpoints REST'];
    } else if (weekNumber === 5) {
      sessionTopics = [
        'Sem. 1: Arquitectura y estructura de Spring Boot (Conceptos y entorno)',
        'Sem. 2: Endpoints, Controladores e Inyección de Dependencias (@Autowired)',
        'Sem. 3: Test-driven development (TDD) e integración en Spring',
        'Sem. 4: Implementación de API RESTful y pruebas de Métodos HTTP',
        'Sem. 5: Evaluación: AVANCE DE PROYECTO FINAL 1 (APF1 - 20%)'
      ];
      activities = [
        'Entregables oficiales: Informe hasta el capítulo 3 + Presentación PPTx',
        'Evaluación flexible (2 intentos permitidos, calificado sobre 20 pts)',
        'Docente: Iván Robles Fernández (Sin matriz de rúbrica en plataforma)'
      ];
    }
  } else if (courseUpper.includes('INVESTIGACI')) {
    if (weekNumber === 4) {
      sessionTopics = [
        'Revisión preliminar de Ficha de Investigación',
        'Redacción de la Introducción de la RSL',
        'Pautas y rúbrica para presentación de ATI1 (10%)'
      ];
      learningOutcome = 'Define el tema de tesis y redacta la introducción bajo pautas Scopus/WoS.';
      activities = ['Feedback en clase sobre fichas de investigación', 'Entrega formal de ATI1'];
    } else if (weekNumber === 5) {
      sessionTopics = [
        'Diseño de estrategia de búsqueda sistemática PICO',
        'Operadores booleanos (AND, OR, NOT) y palabras clave',
        'Almacenamiento de referencias en Mendeley'
      ];
      learningOutcome = 'Estructura ecuaciones de búsqueda especializadas para literatura científica.';
    }
  } else if (courseUpper.includes('COMUNICACI')) {
    if (weekNumber === 5) {
      sessionTopics = [
        'Estructura de discursos persuasivos y Storytelling',
        'Modulación vocal, tono, timbre e inflexión emocional',
        'Entrenamiento del narrador oral (Actividad práctica PA02)'
      ];
      learningOutcome = 'Aplica técnicas de narración oral y modulación vocal para captar la atención de la audiencia.';
      activities = ['Grabación de video de relato oral', 'Intervención en foro sincrónico'];
    }
  } else if (courseUpper.includes('LENGUAJES') || courseUpper.includes('PROGRAMACI')) {
    if (weekNumber === 5) {
      sessionTopics = [
        'Paradigmas Funcional vs Imperativo',
        'Funciones puras, inmutabilidad y funciones de orden superior (Map/Filter/Reduce)',
        'Ejercicios preparatorios para Práctica Calificada 1 (PC1 - 20%)'
      ];
      learningOutcome = 'Resuelve problemas complejos aplicando composición de funciones e inmutabilidad.';
      activities = ['Resolución guiada de ejercicios de repaso', 'Pruebas unitarias en consola'];
    }
  } else if (courseUpper.includes('CLOUD')) {
    if (weekNumber === 5) {
      sessionTopics = [
        'Redes Virtuales VPC, subredes públicas y privadas en AWS',
        'Tablas de enrutamiento e Internet Gateways',
        'Evaluación Práctica Calificada 1 (PC1 - 15%)'
      ];
      learningOutcome = 'Aprovisiona infraestructuras de red aisladas y seguras en la nube.';
      activities = ['Laboratorio práctico en consola AWS', 'Despliegue de instancias EC2'];
    }
  } else if (courseUpper.includes('SERVICIO TI') || courseUpper.includes('GESTI')) {
    if (weekNumber === 5) {
      sessionTopics = [
        'Práctica de Gestión de Incidentes bajo ITIL 4',
        'Flujos de escalamiento y priorización según impacto/urgencia',
        'Preparación para Práctica Calificada 1 (Semana 6)'
      ];
      learningOutcome = 'Diseña flujos de atención y resolución oportuna de interrupciones de servicios.';
    }
  }

  // 3. Buscar si en esta semana hay evaluación oficial en el sílabo
  const officialEval = syllabus?.evaluations.find(e => e.week === weekNumber);

  return {
    week: weekNumber,
    unitNumber,
    unitTitle,
    learningOutcome,
    sessionTopics,
    activities,
    officialEvaluation: officialEval ? {
      id: officialEval.id,
      courseName: syllabus?.generalInfo.courseName || courseNameOrId,
      code: officialEval.type,
      fullName: officialEval.description,
      week: officialEval.week,
      weightPercent: officialEval.weightPercent,
      modality: officialEval.modality,
      description: officialEval.observation || officialEval.description,
      rules: officialEval.rules || syllabus?.rules,
    } : undefined,
    formulaWeight: officialEval?.weightPercent,
    rules: syllabus?.rules,
    antiPlagiarismThreshold: syllabus?.antiPlagiarismPolicy?.maxSimilarityPercent,
  };
}

/**
 * Sincroniza una tarea con el contexto del sílabo oficial de su semana.
 */
export function syncTaskWithSyllabus(task: CourseAssignment): TaskWithSyllabusContext {
  const syllabusContext = getSyllabusWeekContext(task.courseName, task.week);
  return {
    task,
    syllabusContext,
  };
}

/**
 * Obtiene todas las tareas activas enriquecidas con su contexto de sílabo sincronizado.
 */
export function getSynchronizedStudentTasks(): TaskWithSyllabusContext[] {
  return ACTIVE_STUDENT_TASKS.map(task => syncTaskWithSyllabus(task));
}

/**
 * Filtra tareas sincronizadas por semana académica.
 */
export function getTasksByWeek(weekNumber: number): TaskWithSyllabusContext[] {
  return getSynchronizedStudentTasks().filter(item => item.task.week === weekNumber);
}
