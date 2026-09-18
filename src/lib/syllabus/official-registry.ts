import { CourseEvaluation } from '@/types/utp';
import { ParsedSyllabus } from './types';

/**
 * Registro oficial verificado de sílabos con datos 100% exactos extraídos de los documentos oficiales UTP.
 */
export const OFFICIAL_SYLLABUS_REGISTRY: Record<string, ParsedSyllabus> = {
  // 1. FORMACIÓN PARA LA INVESTIGACIÓN - SISTEMAS (100000SI82)
  '100000SI82': {
    id: '100000SI82',
    generalInfo: {
      courseCode: '100000SI82',
      courseName: 'FORMACIÓN PARA LA INVESTIGACIÓN - SISTEMAS',
      semester: '2026 - Ciclo 2 Agosto',
      credits: 4,
      modality: 'Virtual en vivo',
      weeklyHours: 4,
      careers: [
        'Ingeniería de Sistemas e Informática',
        'Ingeniería de Software',
        'Ingeniería de Redes y Comunicaciones'
      ],
    },
    learningGoal: 'Al finalizar el curso, el estudiante elabora un trabajo de investigación bajo el formato de Revisión Sistemática de Literatura (RSL) para una revista indexada en Scopus o Web of Science, siguiendo una metodología sistemática de búsqueda (PICO), selección (PRISMA) y análisis que cumpla con integridad académica y ética.',
    formula: '(10%)ATI1 + (20%)ATI2 + (20%)ATI3 + (20%)PA + (30%)TI',
    rules: [
      'La nota mínima aprobatoria final es de 12.',
      'En este curso, no aplica examen rezagado.',
      'En este curso, ninguna nota se reemplaza.',
      'El porcentaje de similitud aceptable en software antiplagio no debe exceder el 20%, excluyendo bibliografía.',
      'No se debe utilizar herramientas de inteligencia artificial para la redacción ni para corrección o reescritura de los trabajos.',
      'El trabajo se redacta en formato oficial de revista indexada en Scopus o Web of Science seleccionada en el curso.'
    ],
    antiPlagiarismPolicy: {
      maxSimilarityPercent: 20,
      aiPolicy: 'Prohibido el uso de IA generativa para redacción o reescritura.',
      repositoryDelivery: 'Registro obligatorio en repositorio institucional antes de finalizar el ciclo.'
    },
    evaluations: [
      {
        id: 'inv-ati1',
        type: 'ATI1',
        description: 'AVANCE DE TRABAJO DE INVESTIGACIÓN 1',
        week: 4,
        weightPercent: 10,
        modality: 'Grupal',
        observation: 'Evaluación grupal. Entrega de Ficha de Investigación aprobada e Introducción de la RSL.',
        rules: ['Semana 4', 'Ponderación 10%', 'Evaluación grupal en parejas de la misma carrera', 'No rezagado']
      },
      {
        id: 'inv-ati2',
        type: 'ATI2',
        description: 'AVANCE DE TRABAJO DE INVESTIGACIÓN 2',
        week: 8,
        weightPercent: 20,
        modality: 'Grupal',
        observation: 'Evaluación grupal. Metodología de revisión sistemática: ecuación PICO, diagrama de flujo PRISMA y almacenamiento en Mendeley.',
        rules: ['Semana 8', 'Ponderación 20%', 'Evaluación grupal', 'No rezagado']
      },
      {
        id: 'inv-ati3',
        type: 'ATI3',
        description: 'AVANCE DE TRABAJO DE INVESTIGACIÓN 3',
        week: 13,
        weightPercent: 20,
        modality: 'Grupal',
        observation: 'Evaluación grupal. Presentación de resultados de la RSL: cuadros bibliométricos, geográficos y análisis temático.',
        rules: ['Semana 13', 'Ponderación 20%', 'Evaluación grupal', 'No rezagado']
      },
      {
        id: 'inv-pa',
        type: 'PA',
        description: 'PARTICIPACIÓN EN CLASE',
        week: 17,
        weightPercent: 20,
        modality: 'Individual',
        observation: 'Evaluación individual acumulada a lo largo del ciclo (19 entregas intermedias en sesiones sincrónicas).',
        rules: ['Semana 17', 'Ponderación 20%', 'Evaluación individual acumulada', 'No rezagado']
      },
      {
        id: 'inv-ti',
        type: 'TI',
        description: 'TRABAJO DE INVESTIGACIÓN',
        week: 18,
        weightPercent: 30,
        modality: 'Grupal',
        observation: 'Evaluación Grupal. Entrega del artículo completo en semana 17 y sustentación/registro de notas y retroalimentación en semana 18.',
        rules: ['Semana 18', 'Ponderación 30%', 'Evaluación grupal + Sustentación obligatoria', 'No rezagado']
      }
    ],
    weeklySchedule: [
      { week: 1, session: 1, unit: 'Unidad 1', topic: 'Lineamientos generales, ética científica y antiplagio UTP', activities: 'Presentación del curso y Código de Ética del Investigador' },
      { week: 1, session: 2, unit: 'Unidad 1', topic: 'Identificación del tema de investigación', activities: 'Criterios de identificación de temas de interés en Ingeniería' },
      { week: 1, session: 3, unit: 'Unidad 1', topic: 'Bases de datos científicas: Scopus y Web of Science', activities: 'Acceso y selección preliminar de artículos de revisión' },
      { week: 2, session: 4, unit: 'Unidad 1', topic: 'Artículos de revisión de literatura', activities: 'Redacción apartados 1 y 2 de la ficha (PA)', isDeliverableForClassScore: true },
      { week: 2, session: 5, unit: 'Unidad 1', topic: 'Líneas de investigación y competencias de carrera', activities: 'Redacción apartados 3, 4 y 5 de la ficha (PA)', isDeliverableForClassScore: true },
      { week: 3, session: 6, unit: 'Unidad 1', topic: 'Redacción de introducción de la RSL y autoría ética', activities: 'Selección de formato de revista Scopus/WoS y borrador de introducción' },
      { week: 4, session: 7, unit: 'Unidad 1', topic: 'Revisión preliminar de ficha e introducción', activities: 'Revisión y feedback en clase (PA)', isDeliverableForClassScore: true },
      { week: 4, session: 8, unit: 'Unidad 1', topic: 'Presentación de ATI1', activities: 'Entrega formal de ATI1 (10%)', evaluation: 'ATI1' },
      { week: 5, session: 9, unit: 'Unidad 2', topic: 'Estrategia de búsqueda PICO y palabras clave', activities: 'Formulación de pregunta PICO y operadores booleanos' },
      { week: 5, session: 10, unit: 'Unidad 2', topic: 'Aplicación de ecuación de búsqueda y Mendeley', activities: 'Aplicación de ecuación y almacenamiento en gestor (PA)', isDeliverableForClassScore: true },
      { week: 6, session: 11, unit: 'Unidad 2', topic: 'Registro y almacenamiento de resultados', activities: 'Evaluación de pertinencia de resultados (PA)', isDeliverableForClassScore: true },
      { week: 6, session: 12, unit: 'Unidad 2', topic: 'Pautas de selección sistemática PRISMA', activities: 'Criterios de inclusión/exclusión y cribado (PA)', isDeliverableForClassScore: true },
      { week: 7, session: 13, unit: 'Unidad 2', topic: 'Selección sistemática de literatura', activities: 'Diagrama de flujo PRISMA (PA)', isDeliverableForClassScore: true },
      { week: 7, session: 14, unit: 'Unidad 2', topic: 'Redacción de la sección de Metodología', activities: 'Reporte del diseño y proceso metodológico' },
      { week: 8, session: 15, unit: 'Unidad 2', topic: 'Revisión preliminar de metodología', activities: 'Retroalimentación de metodología (PA)', isDeliverableForClassScore: true },
      { week: 8, session: 16, unit: 'Unidad 2', topic: 'Presentación de ATI2', activities: 'Entrega formal de ATI2 (20%)', evaluation: 'ATI2' },
      { week: 9, session: 17, unit: 'Unidad 3', topic: 'Estrategias de lectura IMRD', activities: 'Pautas de lectura crítica de papers científicos' },
      { week: 9, session: 18, unit: 'Unidad 3', topic: 'Formatos de extracción de información', activities: 'Confección de formulario de extracción (PA)', isDeliverableForClassScore: true },
      { week: 10, session: 19, unit: 'Unidad 3', topic: 'Lectura y extracción de papers (1 y 2)', activities: 'Fichado de artículos seleccionados (PA)', isDeliverableForClassScore: true },
      { week: 11, session: 22, unit: 'Unidad 3', topic: 'Organización de resultados', activities: 'Categorización y detección de tendencias temáticas (PA)', isDeliverableForClassScore: true },
      { week: 12, session: 23, unit: 'Unidad 3', topic: 'Redacción de resultados descriptivos', activities: 'Elaboración de tablas bibliométricas y mapas geográficos (PA)', isDeliverableForClassScore: true },
      { week: 12, session: 24, unit: 'Unidad 3', topic: 'Redacción de resultados cualitativos', activities: 'Análisis de categorías y debates (PA)', isDeliverableForClassScore: true },
      { week: 13, session: 26, unit: 'Unidad 3', topic: 'Presentación de ATI3', activities: 'Entrega formal de ATI3 (20%)', evaluation: 'ATI3' },
      { week: 14, session: 27, unit: 'Unidad 4', topic: 'Redacción de la discusión de la RSL', activities: 'Borrador de contrastación y discusión (PA)', isDeliverableForClassScore: true },
      { week: 14, session: 28, unit: 'Unidad 4', topic: 'Conclusiones y limitaciones', activities: 'Redacción de conclusiones y recomendaciones (PA)', isDeliverableForClassScore: true },
      { week: 15, session: 30, unit: 'Unidad 4', topic: 'Revisión final integral del manuscrito', activities: 'Discusión de versión completa corregida (PA)', isDeliverableForClassScore: true },
      { week: 16, session: 32, unit: 'Unidad 4', topic: 'Resumen estructurado y preparación de sustentación', activities: 'Revisión de resumen y diapositivas de sustentación' },
      { week: 16, session: 33, unit: 'Unidad 4', topic: 'Sustentación del TI (Sesión 1)', activities: 'Exposición oral del artículo y preguntas del docente' },
      { week: 17, session: 34, unit: 'Unidad 4', topic: 'Sustentación del TI (Sesión 2) y Entrega Final', activities: 'Entrega TI en plataforma, Declaración de autoría y cierre PA', evaluation: 'PA' },
      { week: 18, session: 35, unit: 'Unidad 4', topic: 'Retroalimentación Final y Cierre', activities: 'Registro final de notas y feedback integral', evaluation: 'TI' },
    ]
  },

  // 2. GESTIÓN DEL SERVICIO TI (100000SI12)
  '100000SI12': {
    id: '100000SI12',
    generalInfo: {
      courseCode: '100000SI12',
      courseName: 'GESTIÓN DEL SERVICIO TI',
      semester: '2026 - Ciclo 2 Agosto',
      credits: 4,
      modality: 'Virtual en vivo',
      weeklyHours: 4,
      careers: ['Ingeniería de Sistemas e Informática', 'Ingeniería de Software'],
    },
    learningGoal: 'Al finalizar el curso, el estudiante diseña y gestiona el ciclo de vida de los servicios de TI alineados al marco ITIL 4, optimizando la co-creación de valor y la continuidad operativa empresarial.',
    formula: '(20%)PC1 + (20%)PC2 + (20%)PA + (40%)PROY',
    rules: [
      'La nota mínima aprobatoria final es de 12.',
      'PC1 y PC2 son evaluaciones individuales en plataforma virtual.',
      'PA corresponde a la participación activa en foros, casos prácticos y actividades semanales.',
      'PROY es una evaluación flexible e integral sobre el caso de estudio empresarial.'
    ],
    evaluations: [
      {
        id: 'gst-pc1',
        type: 'PC1',
        description: 'PRÁCTICA CALIFICADA 1',
        week: 6,
        weightPercent: 20,
        modality: 'Individual',
        observation: 'Individual. Fundamentos de ITIL 4, 4 dimensiones y Sistema de Valor del Servicio (SVS).',
        rules: ['Semana 6', 'Ponderación 20%', 'Individual']
      },
      {
        id: 'gst-pc2',
        type: 'PC2',
        description: 'PRÁCTICA CALIFICADA 2',
        week: 14,
        weightPercent: 20,
        modality: 'Individual',
        observation: 'Individual. Prácticas de gestión de incidentes, problemas, Service Desk, SLA y CMDB.',
        rules: ['Semana 14', 'Ponderación 20%', 'Individual']
      },
      {
        id: 'gst-pa',
        type: 'PA',
        description: 'PARTICIPACIÓN EN CLASE',
        week: 17,
        weightPercent: 20,
        modality: 'Individual',
        observation: 'Individual. Evaluación acumulativa de actividades prácticas, talleres y foros.',
        rules: ['Semana 17', 'Ponderación 20%', 'Individual']
      },
      {
        id: 'gst-proy',
        type: 'PROY',
        description: 'PROYECTO FINAL',
        week: 18,
        weightPercent: 40,
        modality: 'Grupal',
        observation: 'Evaluación flexible. Diseño integral del catálogo y gestión de servicios para una empresa real.',
        rules: ['Semana 18', 'Ponderación 40%', 'Evaluación flexible / Grupal']
      }
    ],
    weeklySchedule: [
      { week: 1, session: 1, unit: 'Unidad 1', topic: 'Conceptos clave de la gestión del servicio: valor, co-creación y partes interesadas' },
      { week: 2, session: 2, unit: 'Unidad 1', topic: 'Las 4 dimensiones de la gestión de servicios ITIL 4' },
      { week: 3, session: 3, unit: 'Unidad 1', topic: 'El Sistema de Valor del Servicio (SVS) de ITIL y los 7 principios guía' },
      { week: 4, session: 4, unit: 'Unidad 1', topic: 'La Cadena de Valor del Servicio: Planear, Mejorar, Diseñar, Obtener y Entregar' },
      { week: 5, session: 5, unit: 'Unidad 2', topic: 'Práctica de Gestión de Incidentes: Restauración del servicio normal y priorización' },
      { week: 6, session: 6, unit: 'Unidad 2', topic: 'Evaluación PC1 (20%): Fundamentos de ITIL 4, SVS y 4 dimensiones', evaluation: 'PC1' },
      { week: 7, session: 7, unit: 'Unidad 2', topic: 'Práctica de Service Desk (Mesa de Ayuda) y experiencia del usuario' },
      { week: 8, session: 8, unit: 'Unidad 2', topic: 'Práctica de Gestión de Problemas: Análisis de causa raíz (RCA) y workarounds' },
      { week: 9, session: 9, unit: 'Unidad 3', topic: 'Práctica de Control de Cambios: Maximizar cambios exitosos y comités CAB' },
      { week: 10, session: 10, unit: 'Unidad 3', topic: 'Práctica de Gestión del Nivel de Servicio (SLA, OLA y contratos UC)' },
      { week: 11, session: 11, unit: 'Unidad 3', topic: 'Práctica de Gestión de Solicitudes de Servicio y Catálogo de Servicios' },
      { week: 12, session: 12, unit: 'Unidad 3', topic: 'Diagnóstico y diseño de flujo de atención de incidentes y requerimientos' },
      { week: 13, session: 13, unit: 'Unidad 3', topic: 'Práctica de Gestión de Activos de TI (ITAM) y Gestión de Configuración (CMDB)' },
      { week: 14, session: 14, unit: 'Unidad 3', topic: 'Evaluación PC2 (20%): Incidentes, problemas, Service Desk, SLA y CMDB', evaluation: 'PC2' },
      { week: 15, session: 15, unit: 'Unidad 4', topic: 'Práctica de Gestión de la Disponibilidad y Continuidad del Servicio TI' },
      { week: 16, session: 16, unit: 'Unidad 4', topic: 'El modelo de Mejora Continua de ITIL y métricas de éxito (KPIs y CSFs)' },
      { week: 17, session: 17, unit: 'Unidad 4', topic: 'Evaluación PA (20%): Cierre de participación acumulada en foros y talleres', evaluation: 'PA' },
      { week: 18, session: 18, unit: 'Unidad 4', topic: 'Evaluación PROYECTO FINAL PROY (40%): Sustentación de diseño integral de gestión TI', evaluation: 'PROY' }
    ]
  },

  // 3. DESARROLLO WEB INTEGRADO (100000ST61)
  '100000ST61': {
    id: '100000ST61',
    generalInfo: {
      courseCode: '100000ST61',
      courseName: 'DESARROLLO WEB INTEGRADO',
      semester: '2026 - Ciclo 2 Agosto',
      credits: 2,
      modality: 'Presencial',
      weeklyHours: 3,
      careers: ['Ingeniería de Sistemas e Informática', 'Ingeniería de Software'],
    },
    learningGoal: 'Al finalizar el curso, el estudiante desarrolla soluciones web integrales mediante frameworks de front-end y back-end, siguiendo el diseño orientado a objetos y tecnologías web para resolver problemas empresariales.',
    formula: '(20%)APF1 + (20%)APF2 + (20%)APF3 + (40%)PROY',
    rules: [
      'La nota mínima aprobatoria final es de 12.',
      'En este curso, no aplica examen rezagado.',
      'En este curso, ninguna nota se reemplaza.',
      'El cálculo del promedio final considera: (20%)APF1 + (20%)APF2 + (20%)APF3 + (40%)PROY.'
    ],
    evaluations: [
      {
        id: 'dwi-apf1',
        type: 'APF1',
        description: 'AVANCE DE PROYECTO FINAL 1',
        week: 5,
        weightPercent: 20,
        modality: 'Grupal',
        observation: 'Evaluación grupal. Implementación de API RESTful con Spring Boot y TDD (Semanas 1 a 4). Entregable: Informe hasta cap. 3 + PPTx.',
        rules: ['Semana 5', 'Ponderación 20%', 'Grupal', 'No rezagado']
      },
      {
        id: 'dwi-apf2',
        type: 'APF2',
        description: 'AVANCE DE PROYECTO FINAL 2',
        week: 10,
        weightPercent: 20,
        modality: 'Grupal',
        observation: 'Evaluación grupal. Back-end con bases de datos: JPA Hibernate, CRUD, JPQL y Spring Security JWT.',
        rules: ['Semana 10', 'Ponderación 20%', 'Grupal', 'No rezagado']
      },
      {
        id: 'dwi-apf3',
        type: 'APF3',
        description: 'AVANCE DE PROYECTO FINAL 3',
        week: 15,
        weightPercent: 20,
        modality: 'Grupal',
        observation: 'Evaluación grupal. Integración de frontend con Angular/React, componentes, rutas, consumo de servicios REST.',
        rules: ['Semana 15', 'Ponderación 20%', 'Grupal', 'No rezagado']
      },
      {
        id: 'dwi-proy',
        type: 'PROY',
        description: 'PROYECTO FINAL',
        week: 18,
        weightPercent: 40,
        modality: 'Grupal',
        observation: 'Evaluación grupal. Despliegue en la nube e integración completa de frontend y backend.',
        rules: ['Semana 18', 'Ponderación 40%', 'Evaluación grupal final']
      }
    ],
    weeklySchedule: [
      { week: 1, session: 1, unit: 'Unidad 1', topic: 'Arquitectura web moderna, Spring Boot y configuración inicial' },
      { week: 2, session: 2, unit: 'Unidad 1', topic: 'Configuración de endpoints, controladores y Dependency Injection' },
      { week: 3, session: 3, unit: 'Unidad 1', topic: 'Test-Driven Development (TDD) en servicios y controladores' },
      { week: 4, session: 4, unit: 'Unidad 1', topic: 'Diseño de APIs RESTful, métodos HTTP y validación de DTOs' },
      { week: 5, session: 5, unit: 'Unidad 1', topic: 'Evaluación APF1 (20%): API RESTful funcional con Spring Boot y TDD', evaluation: 'APF1' },
      { week: 6, session: 6, unit: 'Unidad 2', topic: 'Persistencia de datos con Spring Data JPA y Hibernate ORM' },
      { week: 7, session: 7, unit: 'Unidad 2', topic: 'Mapeo de relaciones de entidades, consultas JPQL y transacciones' },
      { week: 8, session: 8, unit: 'Unidad 2', topic: 'Autenticación y autorización con Spring Security y tokens JWT' },
      { week: 9, session: 9, unit: 'Unidad 2', topic: 'Frontend moderno: Componentes, JSX/TSX y arquitectura modular' },
      { week: 10, session: 10, unit: 'Unidad 2', topic: 'Evaluación APF2 (20%): Backend JPA + Spring Security + JWT', evaluation: 'APF2' },
      { week: 11, session: 11, unit: 'Unidad 3', topic: 'Hooks de estado, ciclo de vida y consumo de APIs con Axios/Fetch' },
      { week: 12, session: 12, unit: 'Unidad 3', topic: 'Manejo de estado global, formularios dinámicos y validación con Zod' },
      { week: 13, session: 13, unit: 'Unidad 3', topic: 'Rutas protegidas por roles y manejo de sesiones en frontend' },
      { week: 14, session: 14, unit: 'Unidad 3', topic: 'Optimización de rendimiento, caching y server components' },
      { week: 15, session: 15, unit: 'Unidad 3', topic: 'Evaluación APF3 (20%): Integración Fullstack con Frontend y Backend', evaluation: 'APF3' },
      { week: 16, session: 16, unit: 'Unidad 4', topic: 'Seguridad web avanzada: Prevención de OWASP Top 10, CORS y CSRF' },
      { week: 17, session: 17, unit: 'Unidad 4', topic: 'Despliegue en producción con CI/CD (Vercel / Docker en la nube)' },
      { week: 18, session: 18, unit: 'Unidad 4', topic: 'Sustentación de PROYECTO FINAL PROY (40%): Demostración en vivo', evaluation: 'PROY' }
    ]
  },

  // 4. SERVICIOS CLOUD (100000SI97)
  '100000SI97': {
    id: '100000SI97',
    generalInfo: {
      courseCode: '100000SI97',
      courseName: 'SERVICIOS CLOUD',
      semester: '2026 - Ciclo 2 Agosto',
      credits: 3,
      modality: 'Presencial',
      weeklyHours: 4,
      careers: ['Ingeniería de Sistemas e Informática', 'Ingeniería de Software'],
    },
    learningGoal: 'Al finalizar el curso el estudiante diseña soluciones tecnológicas en la nube para la gestión de la información de las empresas.',
    formula: '(25%)PC1 + (25%)PC2 + (10%)PA + (40%)PROY',
    rules: [
      'La nota mínima aprobatoria final es de 12.',
      'En este curso, no aplica examen rezagado.',
      'Metodología basada en construcción de conocimientos, casuísticas y aprendizaje autónomo/colaborativo.'
    ],
    evaluations: [
      {
        id: 'sc-pc1',
        type: 'PC1',
        description: 'PRÁCTICA CALIFICADA 1',
        week: 3,
        weightPercent: 25,
        modality: 'Individual',
        observation: 'Individual. Introducción a Cloud, Sistemas Distribuidos, Virtualización y Almacenamiento.',
        rules: ['Semana 3', 'Ponderación 25%', 'Individual', 'No rezagado']
      },
      {
        id: 'sc-pc2',
        type: 'PC2',
        description: 'PRÁCTICA CALIFICADA 2',
        week: 12,
        weightPercent: 25,
        modality: 'Individual',
        observation: 'Individual. Gestión de Servicios Cloud, Contenedores, Kubernetes, Hadoop/Spark, Redes, Orquestación, Monitoreo y Escalabilidad.',
        rules: ['Semana 12', 'Ponderación 25%', 'Individual', 'No rezagado']
      },
      {
        id: 'sc-pa',
        type: 'PA',
        description: 'PARTICIPACIÓN EN CLASE',
        week: 17,
        weightPercent: 10,
        modality: 'Individual',
        observation: 'Individual. Participación permanente, ejercicios prácticos y evaluaciones continuas.',
        rules: ['Semana 17', 'Ponderación 10%', 'Individual acumulativo']
      },
      {
        id: 'sc-proy',
        type: 'PROY',
        description: 'PROYECTO FINAL',
        week: 18,
        weightPercent: 40,
        modality: 'Grupal',
        observation: 'Grupal. Diseño integral de solución en la nube (física y cloud) para gestión de centro de datos empresarial.',
        rules: ['Semana 18', 'Ponderación 40%', 'Evaluación grupal + Sustentación', 'No rezagado']
      }
    ],
    weeklySchedule: [
      { week: 1, session: 1, unit: 'Unidad 1', topic: 'Introducción a Computación en Nube: Conceptos, características, deployment, tipos de servicios y limitaciones', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 1, session: 2, unit: 'Unidad 1', topic: 'Sistemas Distribuidos: Arquitecturas, comunicación y tolerancia a fallas', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 2, session: 3, unit: 'Unidad 1', topic: 'Virtualización: Fundamentos y tipos de virtualización', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 2, session: 4, unit: 'Unidad 1', topic: 'Gerenciamiento de máquinas virtuales (casos de uso y conexión) y contenedores', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 3, session: 5, unit: 'Unidad 1', topic: 'Almacenamiento en la nube: Frameworks de base de datos (Cloud Storage, Spanner, Datastore y SQL)', activities: 'Exposición docente' },
      { week: 3, session: 6, unit: 'Unidad 1', topic: 'Evaluación PRÁCTICA CALIFICADA 1 (PC1 - 25%)', evaluation: 'PC1' },
      { week: 4, session: 7, unit: 'Unidad 2', topic: 'Plataformas basadas en Contenedores: Fundamentos y componentes (procesamiento, memoria, disco y red)', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 4, session: 8, unit: 'Unidad 2', topic: 'Plataformas basadas en Contenedores: Configuración y aislamiento de recursos', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 5, session: 9, unit: 'Unidad 2', topic: 'Plataformas distribuidas multi-contenedor: Características y arquitectura de Kubernetes', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 5, session: 10, unit: 'Unidad 2', topic: 'Arquitectura de Kubernetes: Control Plane, Nodes, Pods y Services', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 6, session: 11, unit: 'Unidad 2', topic: 'Modelos de programación en la nube: Sistemas de archivos distribuidos y MapReduce', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 6, session: 12, unit: 'Unidad 2', topic: 'Tecnologías para programación distribuida en la nube: Apache Hadoop, Apache Spark y frameworks analíticos', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 7, session: 13, unit: 'Unidad 2', topic: 'Infraestructura en Nube: Fundamentos de redes virtuales y topologías de red', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 7, session: 14, unit: 'Unidad 2', topic: 'Conexiones seguras entre redes privadas y públicas en la nube', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 8, session: 15, unit: 'Unidad 2', topic: 'Infraestructura en Nube: Máquinas Virtuales y aprovisionamiento', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 8, session: 16, unit: 'Unidad 2', topic: 'Administración y ciclo de vida de VMs en infraestructura cloud', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 9, session: 17, unit: 'Unidad 2', topic: 'Orquestación en Nube: Tipos de sistemas de orquestación', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 9, session: 18, unit: 'Unidad 2', topic: 'Gerenciamiento y automatización de nubes privadas y públicas', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 10, session: 19, unit: 'Unidad 2', topic: 'Monitoreo en Nube: Tipos de sistemas de monitoreo y bases de datos de series temporales', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 10, session: 20, unit: 'Unidad 2', topic: 'Visualización y métricas de rendimiento en infraestructura cloud', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 11, session: 21, unit: 'Unidad 2', topic: 'Escalabilidad y Elasticidad: Principios de escalabilidad vertical y horizontal', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 11, session: 22, unit: 'Unidad 2', topic: 'Adaptabilidad y eficiencia en la gestión de recursos de nube', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 12, session: 23, unit: 'Unidad 2', topic: 'Planificación (Scheduling): Estrategias y algoritmos para asignación eficiente de recursos', activities: 'Exposición docente' },
      { week: 12, session: 24, unit: 'Unidad 2', topic: 'Evaluación PRÁCTICA CALIFICADA 2 (PC2 - 25%)', evaluation: 'PC2' },
      { week: 13, session: 25, unit: 'Unidad 3', topic: 'Arquitectura en Nube: Arquitectura de aplicaciones modernas en la nube', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 13, session: 26, unit: 'Unidad 3', topic: 'Patrones arquitectónicos distribuidos y desacoplamiento', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 14, session: 27, unit: 'Unidad 3', topic: 'Padrones y buenas prácticas para diseño e implementación de aplicaciones en la nube', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 14, session: 28, unit: 'Unidad 3', topic: 'Implementación práctica de patrones de resiliencia y diseño cloud', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 15, session: 29, unit: 'Unidad 3', topic: 'Tolerancia a Fallas, Resiliencia y Confiabilidad en servicios cloud', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 15, session: 30, unit: 'Unidad 3', topic: 'Estrategias de diseño de aplicaciones tolerantes a fallos y alta disponibilidad', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 16, session: 31, unit: 'Unidad 3', topic: 'Diseño de centro de datos empresarial: Red, Energía, Climatización y cómputo', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 16, session: 32, unit: 'Unidad 3', topic: 'Dimensionamiento de procesamiento y almacenamiento empresarial', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 17, session: 33, unit: 'Unidad 3', topic: 'Diseño de Solución Física vs. Solución en la Nube', activities: 'Exposición docente y ejercicios prácticos' },
      { week: 17, session: 34, unit: 'Unidad 3', topic: 'Evaluación PARTICIPACIÓN EN CLASE (PA - 10%)', evaluation: 'PA' },
      { week: 18, session: 35, unit: 'Unidad 3', topic: 'Evaluación y Sustentación PROYECTO FINAL (PROY - 40%)', evaluation: 'PROY' }
    ]
  },
  '100000ST62': {
    id: '100000SI97',
    generalInfo: {
      courseCode: '100000SI97',
      courseName: 'SERVICIOS CLOUD',
      semester: '2026 - Ciclo 2 Agosto',
      credits: 3,
      modality: 'Presencial',
      weeklyHours: 4,
      careers: ['Ingeniería de Sistemas e Informática', 'Ingeniería de Software'],
    },
    learningGoal: 'Al finalizar el curso el estudiante diseña soluciones tecnológicas en la nube para la gestión de la información de las empresas.',
    formula: '(25%)PC1 + (25%)PC2 + (10%)PA + (40%)PROY',
    rules: [
      'La nota mínima aprobatoria final es de 12.',
      'En este curso, no aplica examen rezagado.'
    ],
    evaluations: [
      {
        id: 'sc-pc1',
        type: 'PC1',
        description: 'PRÁCTICA CALIFICADA 1',
        week: 3,
        weightPercent: 25,
        modality: 'Individual',
        observation: 'Individual. Introducción a Cloud, Sistemas Distribuidos, Virtualización y Almacenamiento.',
        rules: ['Semana 3', 'Ponderación 25%', 'Individual', 'No rezagado']
      },
      {
        id: 'sc-pc2',
        type: 'PC2',
        description: 'PRÁCTICA CALIFICADA 2',
        week: 12,
        weightPercent: 25,
        modality: 'Individual',
        observation: 'Individual. Gestión de Servicios Cloud, Contenedores, Kubernetes, Hadoop/Spark, Redes y Orquestación.',
        rules: ['Semana 12', 'Ponderación 25%', 'Individual', 'No rezagado']
      },
      {
        id: 'sc-pa',
        type: 'PA',
        description: 'PARTICIPACIÓN EN CLASE',
        week: 17,
        weightPercent: 10,
        modality: 'Individual',
        observation: 'Individual. Participación permanente, ejercicios prácticos y evaluaciones continuas.',
        rules: ['Semana 17', 'Ponderación 10%', 'Individual']
      },
      {
        id: 'sc-proy',
        type: 'PROY',
        description: 'PROYECTO FINAL',
        week: 18,
        weightPercent: 40,
        modality: 'Grupal',
        observation: 'Grupal. Diseño integral de solución en la nube (física y cloud) para gestión de centro de datos empresarial.',
        rules: ['Semana 18', 'Ponderación 40%', 'Grupal + Sustentación', 'No rezagado']
      }
    ],
    weeklySchedule: [
      { week: 1, session: 1, unit: 'Unidad 1', topic: 'Introducción a Computación en Nube: Conceptos, características, deployment, tipos de servicios y limitaciones' },
      { week: 1, session: 2, unit: 'Unidad 1', topic: 'Sistemas Distribuidos: Arquitecturas, comunicación y tolerancia a fallas' },
      { week: 2, session: 3, unit: 'Unidad 1', topic: 'Virtualización: Fundamentos y tipos de virtualización' },
      { week: 2, session: 4, unit: 'Unidad 1', topic: 'Gerenciamiento de máquinas virtuales (casos de uso y conexión) y contenedores' },
      { week: 3, session: 5, unit: 'Unidad 1', topic: 'Almacenamiento en la nube: Frameworks de base de datos (Cloud Storage, Spanner, Datastore y SQL)' },
      { week: 3, session: 6, unit: 'Unidad 1', topic: 'Evaluación PRÁCTICA CALIFICADA 1 (PC1 - 25%)', evaluation: 'PC1' },
      { week: 4, session: 7, unit: 'Unidad 2', topic: 'Plataformas basadas en Contenedores: Fundamentos y componentes (procesamiento, memoria, disco y red)' },
      { week: 4, session: 8, unit: 'Unidad 2', topic: 'Plataformas basadas en Contenedores: Configuración y aislamiento de recursos' },
      { week: 5, session: 9, unit: 'Unidad 2', topic: 'Plataformas distribuidas multi-contenedor: Características y arquitectura de Kubernetes' },
      { week: 5, session: 10, unit: 'Unidad 2', topic: 'Arquitectura de Kubernetes: Control Plane, Nodes, Pods y Services' },
      { week: 6, session: 11, unit: 'Unidad 2', topic: 'Modelos de programación en la nube: Sistemas de archivos distribuidos y MapReduce' },
      { week: 6, session: 12, unit: 'Unidad 2', topic: 'Tecnologías para programación distribuida en la nube: Apache Hadoop, Apache Spark y frameworks analíticos' },
      { week: 7, session: 13, unit: 'Unidad 2', topic: 'Infraestructura en Nube: Fundamentos de redes virtuales y topologías de red' },
      { week: 7, session: 14, unit: 'Unidad 2', topic: 'Conexiones seguras entre redes privadas y públicas en la nube' },
      { week: 8, session: 15, unit: 'Unidad 2', topic: 'Infraestructura en Nube: Máquinas Virtuales y aprovisionamiento' },
      { week: 8, session: 16, unit: 'Unidad 2', topic: 'Administración y ciclo de vida de VMs en infraestructura cloud' },
      { week: 9, session: 17, unit: 'Unidad 2', topic: 'Orquestación en Nube: Tipos de sistemas de orquestación' },
      { week: 9, session: 18, unit: 'Unidad 2', topic: 'Gerenciamiento y automatización de nubes privadas y públicas' },
      { week: 10, session: 19, unit: 'Unidad 2', topic: 'Monitoreo en Nube: Tipos de sistemas de monitoreo y bases de datos de series temporales' },
      { week: 10, session: 20, unit: 'Unidad 2', topic: 'Visualización y métricas de rendimiento en infraestructura cloud' },
      { week: 11, session: 21, unit: 'Unidad 2', topic: 'Escalabilidad y Elasticidad: Principios de escalabilidad vertical y horizontal' },
      { week: 11, session: 22, unit: 'Unidad 2', topic: 'Adaptabilidad y eficiencia en la gestión de recursos de nube' },
      { week: 12, session: 23, unit: 'Unidad 2', topic: 'Planificación (Scheduling): Estrategias y algoritmos para asignación eficiente de recursos' },
      { week: 12, session: 24, unit: 'Unidad 2', topic: 'Evaluación PRÁCTICA CALIFICADA 2 (PC2 - 25%)', evaluation: 'PC2' },
      { week: 13, session: 25, unit: 'Unidad 3', topic: 'Arquitectura en Nube: Arquitectura de aplicaciones modernas en la nube' },
      { week: 13, session: 26, unit: 'Unidad 3', topic: 'Patrones arquitectónicos distribuidos y desacoplamiento' },
      { week: 14, session: 27, unit: 'Unidad 3', topic: 'Padrones y buenas prácticas para diseño e implementación de aplicaciones en la nube' },
      { week: 14, session: 28, unit: 'Unidad 3', topic: 'Implementación práctica de patrones de resiliencia y diseño cloud' },
      { week: 15, session: 29, unit: 'Unidad 3', topic: 'Tolerancia a Fallas, Resiliencia y Confiabilidad en servicios cloud' },
      { week: 15, session: 30, unit: 'Unidad 3', topic: 'Estrategias de diseño de aplicaciones tolerantes a fallos y alta disponibilidad' },
      { week: 16, session: 31, unit: 'Unidad 3', topic: 'Diseño de centro de datos empresarial: Red, Energía, Climatización y cómputo' },
      { week: 16, session: 32, unit: 'Unidad 3', topic: 'Dimensionamiento de procesamiento y almacenamiento empresarial' },
      { week: 17, session: 33, unit: 'Unidad 3', topic: 'Diseño de Solución Física vs. Solución en la Nube' },
      { week: 17, session: 34, unit: 'Unidad 3', topic: 'Evaluación PARTICIPACIÓN EN CLASE (PA - 10%)', evaluation: 'PA' },
      { week: 18, session: 35, unit: 'Unidad 3', topic: 'Evaluación y Sustentación PROYECTO FINAL (PROY - 40%)', evaluation: 'PROY' }
    ]
  },

  // 5. HERRAMIENTAS PARA LA COMUNICACIÓN EFECTIVA (100000CO01)
  '100000CO01': {
    id: '100000CO01',
    generalInfo: {
      courseCode: '100000CO01',
      courseName: 'HERRAMIENTAS PARA LA COMUNICACIÓN EFECTIVA',
      semester: '2026 - Ciclo 2 Agosto',
      credits: 2,
      modality: 'Virtual en vivo',
      weeklyHours: 2,
      careers: ['Todas las carreras'],
    },
    learningGoal: 'Al finalizar el curso, el estudiante aplica técnicas de comunicación asertiva, escucha activa y oratoria estratégica en presentaciones profesionales y liderazgo de equipos.',
    formula: '(20%)TA1 + (20%)TA2 + (20%)TA3 + (10%)PA + (30%)TF',
    rules: [
      'La nota mínima aprobatoria final es de 12.',
      'Grabaciones de video con rúbrica de desempeño no verbal y persuasión.',
      'Trabajo final incluye presentación oral ejecutiva de alto impacto.'
    ],
    evaluations: [
      {
        id: 'com-ta1',
        type: 'TA1',
        description: 'TAREA ACADÉMICA 1',
        week: 4,
        weightPercent: 20,
        modality: 'Individual',
        observation: 'Individual. Análisis de casos de barreras comunicativas y asertividad.',
        rules: ['Semana 4', 'Ponderación 20%']
      },
      {
        id: 'com-ta2',
        type: 'TA2',
        description: 'TAREA ACADÉMICA 2',
        week: 8,
        weightPercent: 20,
        modality: 'Individual',
        observation: 'Individual. Video grabado de discurso persuasivo con storytelling.',
        rules: ['Semana 8', 'Ponderación 20%']
      },
      {
        id: 'com-ta3',
        type: 'TA3',
        description: 'TAREA ACADÉMICA 3',
        week: 12,
        weightPercent: 20,
        modality: 'Individual',
        observation: 'Individual. Simulación de negociación y manejo de objeciones.',
        rules: ['Semana 12', 'Ponderación 20%']
      },
      {
        id: 'com-pa',
        type: 'PA',
        description: 'PARTICIPACIÓN EN CLASE',
        week: 16,
        weightPercent: 10,
        modality: 'Individual',
        observation: 'Individual. Participación en foros y dinámicas de interacción sincrónica.',
        rules: ['Semana 16', 'Ponderación 10%']
      },
      {
        id: 'com-tf',
        type: 'TF',
        description: 'TRABAJO FINAL',
        week: 18,
        weightPercent: 30,
        modality: 'Grupal',
        observation: 'Grupal. Presentación ejecutiva final ante la clase.',
        rules: ['Semana 18', 'Ponderación 30%']
      }
    ],
    weeklySchedule: [
      { week: 1, session: 1, unit: 'Unidad 1', topic: 'Fundamentos de la comunicación interpersonal y asertividad profesional' },
      { week: 2, session: 2, unit: 'Unidad 1', topic: 'Lenguaje no verbal, kinésica y manejo del espacio escénico' },
      { week: 3, session: 3, unit: 'Unidad 1', topic: 'Escucha activa, empatía y retroalimentación constructiva' },
      { week: 4, session: 4, unit: 'Unidad 1', topic: 'Evaluación Tarea Académica TA1 (20%): Análisis de casos', evaluation: 'TA1' },
      { week: 5, session: 5, unit: 'Unidad 2', topic: 'Estructura del discurso persuasivo y oratoria estratégica' },
      { week: 6, session: 6, unit: 'Unidad 2', topic: 'Storytelling aplicado a presentaciones técnicas y de proyectos' },
      { week: 7, session: 7, unit: 'Unidad 2', topic: 'Modulación de voz, ritmo, pausas y proyección vocal' },
      { week: 8, session: 8, unit: 'Unidad 2', topic: 'Evaluación Tarea Académica TA2 (20%): Video de discurso persuasivo', evaluation: 'TA2' },
      { week: 9, session: 9, unit: 'Unidad 3', topic: 'Técnicas de debate, argumentación y refutación de ideas' },
      { week: 10, session: 10, unit: 'Unidad 3', topic: 'Comunicación en equipos multidisciplinarios y liderazgo' },
      { week: 11, session: 11, unit: 'Unidad 3', topic: 'Negociación estratégica y resolución de objeciones' },
      { week: 12, session: 12, unit: 'Unidad 3', topic: 'Evaluación Tarea Académica TA3 (20%): Negociación ejecutiva', evaluation: 'TA3' },
      { week: 13, session: 13, unit: 'Unidad 4', topic: 'Diseño visual de diapositivas de alto impacto (sin sobrecarga)' },
      { week: 14, session: 14, unit: 'Unidad 4', topic: 'Manejo del pánico escénico y técnicas de respiración diafragmática' },
      { week: 15, session: 15, unit: 'Unidad 4', topic: 'Comunicación digital y etiqueta en videoconferencias y correos' },
      { week: 16, session: 16, unit: 'Unidad 4', topic: 'Evaluación Participación PA (10%): Cierre de foros y dinámicas', evaluation: 'PA' },
      { week: 17, session: 17, unit: 'Unidad 4', topic: 'Ensayos generales y feedback personalizado de presentaciones' },
      { week: 18, session: 18, unit: 'Unidad 4', topic: 'Evaluación Trabajo Final TF (30%): Presentación ejecutiva en vivo', evaluation: 'TF' }
    ]
  },
  // 6. LENGUAJES DE PROGRAMACIÓN (100000SI23)
  '100000SI23': {
    id: '100000SI23',
    generalInfo: {
      courseCode: '100000SI23',
      courseName: 'LENGUAJES DE PROGRAMACIÓN',
      semester: '2026 - Ciclo 2 Agosto',
      credits: 3,
      modality: 'Presencial',
      weeklyHours: 4,
      careers: [
        'Ingeniería de Sistemas e Informática',
        'Ingeniería de Software'
      ],
    },
    learningGoal: 'Al finalizar el curso, el estudiante diseña e implementa soluciones de software complejas aprovechando múltiples paradigmas de programación (orientado a objetos, funcional y concurrente) con criterios de inmutabilidad, tipado estricto y alto rendimiento.',
    formula: '(20%)PC1 + (20%)PC2 + (20%)PC3 + (40%)PROY',
    rules: [
      'La nota mínima aprobatoria final es de 12.',
      'Aplica examen rezagado para evaluaciones autorizadas según reglamento.',
      'El proyecto final integra desarrollo en paradigmas declarativos y concurrentes.',
      'Se prohíbe el plagio de código fuente en repositorios GitHub.'
    ],
    antiPlagiarismPolicy: {
      maxSimilarityPercent: 20,
      aiPolicy: 'Permitido el uso de IA como asistente de depuración y refactorización, prohibida la copia íntegra no documentada.',
      repositoryDelivery: 'Entrega obligatoria con historial de commits verificable.'
    },
    evaluations: [
      {
        id: 'lp-pc1',
        type: 'PC1',
        description: 'PRÁCTICA CALIFICADA 1',
        week: 5,
        weightPercent: 20,
        modality: 'Individual',
        observation: 'Individual. Paradigmas de programación, funciones puras, inmutabilidad y cálculo lambda.',
        rules: ['Semana 5', 'Ponderación 20%', 'Individual']
      },
      {
        id: 'lp-pc2',
        type: 'PC2',
        description: 'PRÁCTICA CALIFICADA 2',
        week: 10,
        weightPercent: 20,
        modality: 'Individual',
        observation: 'Individual. Programación funcional avanzada, closures, monads y colecciones lazy.',
        rules: ['Semana 10', 'Ponderación 20%', 'Individual']
      },
      {
        id: 'lp-pc3',
        type: 'PC3',
        description: 'PRÁCTICA CALIFICADA 3',
        week: 14,
        weightPercent: 20,
        modality: 'Individual',
        observation: 'Individual. Concurrencia, asincronía, promesas y canales de comunicación.',
        rules: ['Semana 14', 'Ponderación 20%', 'Individual']
      },
      {
        id: 'lp-proy',
        type: 'PROY',
        description: 'PROYECTO FINAL INTEGRADOR',
        week: 18,
        weightPercent: 40,
        modality: 'Grupal',
        observation: 'Grupal. Construcción de un motor o sistema de procesamiento de datos aplicando paradigmas mixtos.',
        rules: ['Semana 18', 'Ponderación 40%', 'Grupal con sustentación en laboratorio']
      }
    ],
    weeklySchedule: [
      { week: 1, session: 1, unit: 'Unidad 1', topic: 'Evolución y taxonomía de lenguajes de programación' },
      { week: 2, session: 2, unit: 'Unidad 1', topic: 'Sintaxis vs Semántica y sistemas de tipos estáticos/dinámicos' },
      { week: 3, session: 3, unit: 'Unidad 1', topic: 'Fundamentos de programación funcional y funciones de primera clase' },
      { week: 4, session: 4, unit: 'Unidad 1', topic: 'Inmutabilidad, recursión de cola y optimización' },
      { week: 5, session: 5, unit: 'Unidad 2', topic: 'Evaluación PC1 (20%) - Paradigmas y funciones puras', evaluation: 'PC1' },
      { week: 6, session: 6, unit: 'Unidad 2', topic: 'Composición de funciones, currying y mónadas aplicadas' },
      { week: 7, session: 7, unit: 'Unidad 2', topic: 'Programación reactiva y flujos de eventos observables' },
      { week: 8, session: 8, unit: 'Unidad 2', topic: 'Manejo avanzado de errores sin excepciones (Result / Option types)' },
      { week: 9, session: 9, unit: 'Unidad 3', topic: 'Modelos de memoria y recolectores de basura (Garbage Collection)' },
      { week: 10, session: 10, unit: 'Unidad 3', topic: 'Evaluación PC2 (20%) sobre paradigmas avanzados', evaluation: 'PC2' },
      { week: 11, session: 11, unit: 'Unidad 3', topic: 'Concurrencia vs Paralelismo y threads del sistema operativo' },
      { week: 12, session: 12, unit: 'Unidad 4', topic: 'Modelo de Actores y comunicación por paso de mensajes' },
      { week: 13, session: 13, unit: 'Unidad 4', topic: 'Corrutinas, async/await y event loops' },
      { week: 14, session: 14, unit: 'Unidad 4', topic: 'Evaluación PC3 (20%) sobre concurrencia', evaluation: 'PC3' },
      { week: 15, session: 15, unit: 'Unidad 4', topic: 'Metaprogramación, macros y reflexión en tiempo de compilación' },
      { week: 16, session: 16, unit: 'Unidad 4', topic: 'Arquitectura del proyecto final integrador' },
      { week: 17, session: 17, unit: 'Unidad 4', topic: 'Pruebas de carga, benchmarks y profiling de código' },
      { week: 18, session: 18, unit: 'Unidad 4', topic: 'Sustentación de Proyecto Final PROY (40%)', evaluation: 'PROY' }
    ]
  }
};

/**
 * Busca el sílabo en el registro por código o por nombre aproximado.
 */
export function getSyllabusForCourse(courseIdentifier: string): ParsedSyllabus | null {
  if (OFFICIAL_SYLLABUS_REGISTRY[courseIdentifier]) {
    return OFFICIAL_SYLLABUS_REGISTRY[courseIdentifier];
  }

  const normalized = courseIdentifier.toUpperCase().trim();
  for (const syllabus of Object.values(OFFICIAL_SYLLABUS_REGISTRY)) {
    if (
      normalized.includes(syllabus.generalInfo.courseCode) ||
      syllabus.generalInfo.courseName.includes(normalized) ||
      normalized.includes(syllabus.generalInfo.courseName)
    ) {
      return syllabus;
    }
  }

  // Búsqueda por palabras clave
  if (normalized.includes('INVESTIGACI')) return OFFICIAL_SYLLABUS_REGISTRY['100000SI82'];
  if (normalized.includes('SERVICIO TI') || normalized.includes('GESTI')) return OFFICIAL_SYLLABUS_REGISTRY['100000SI12'];
  if (normalized.includes('WEB INTEGRADO') || normalized.includes('DESARROLLO WEB')) return OFFICIAL_SYLLABUS_REGISTRY['100000ST61'];
  if (normalized.includes('CLOUD') || normalized.includes('NUBE')) return OFFICIAL_SYLLABUS_REGISTRY['100000ST62'];
  if (normalized.includes('COMUNICACI')) return OFFICIAL_SYLLABUS_REGISTRY['100000CO01'];
  if (normalized.includes('LENGUAJE') || normalized.includes('PROGRAMACI')) return OFFICIAL_SYLLABUS_REGISTRY['100000SI23'];

  return null;
}

/**
 * Convierte los sílabos registrados en la lista plana oficial de CourseEvaluation
 * para que TodayView, el Horario y el Copilot usen siempre datos oficiales 100% verificados.
 */
export function getAllEvaluationsFromRegistry(): CourseEvaluation[] {
  const result: CourseEvaluation[] = [];

  for (const syllabus of Object.values(OFFICIAL_SYLLABUS_REGISTRY)) {
    for (const ev of syllabus.evaluations) {
      result.push({
        id: ev.id,
        courseName: syllabus.generalInfo.courseName,
        code: ev.type,
        fullName: ev.description,
        week: ev.week,
        weightPercent: ev.weightPercent,
        modality: ev.modality,
        description: ev.observation || ev.description,
        rules: ev.rules || syllabus.rules,
      });
    }
  }

  return result;
}
