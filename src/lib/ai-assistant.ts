import { ProcessedCourse, UTPCurrentInterval, UTPEvent } from '@/types/utp';
import { formatTime, getCurrentAndNextClass, getEventsByWeek } from './schedule-parser';

export interface AIResponse {
  answer: string;
  suggestedActions: string[];
  contextInfo?: {
    courseName?: string;
    weekNumber?: number;
    zoomLink?: string;
  };
}

const COURSE_SYLLABUS_KNOWLEDGE: Record<string, {
  summary: string;
  weeklyPlan: Record<number, string>;
  exams: string;
  tips: string[];
}> = {
  'DESARROLLO WEB INTEGRADO': {
    summary: 'Aprenderás a construir aplicaciones web completas fullstack, abarcando interfaces dinámicas en React/Next.js, consumo de APIs, autenticación segura y despliegue en la nube.',
    weeklyPlan: {
      1: 'Introducción a la arquitectura web moderna, estándares HTML5 semántico y CSS3 responsive.',
      2: 'JavaScript moderno (ES6+): destructuring, async/await, promesas y manipulación del DOM.',
      3: 'Fundamentos de librerías modernas frontend: componentes, JSX y props.',
      4: 'Hooks de React: useState, useEffect, manejo de ciclo de vida y formularios controlados.',
      5: 'Entrega de APF1 (20%): Maquetación responsiva y componentes interactivos en Next.js/React.',
      6: 'Consumo de APIs RESTful con Fetch/Axios, manejo de errores y estados de carga.',
      7: 'Autenticación con JWT, tokens Bearer, seguridad en cliente y servidor.',
      8: 'Enrutamiento avanzado, Server Components y arquitectura de cliente en Next.js App Router.',
      9: 'Backend con Node.js & Server Actions / API Routes.',
      10: 'Entrega de APF2 (20%): Consumo de APIs, persistencia de datos y manejo de estado global.',
      11: 'Operaciones CRUD completas y validación de esquemas (Zod).',
      12: 'Optimización de interfaz, componentes de feedback y modales accesibles.',
      13: 'Despliegue continuo (CI/CD) en Vercel / AWS y gestión de variables de entorno.',
      14: 'Optimización de rendimiento (Core Web Vitals, SSR, SSG y caching).',
      15: 'Entrega de APF3 (20%): Autenticación JWT, validación y despliegue preliminar.',
      16: 'Seguridad web avanzada: protección contra XSS, CSRF y sanitización de inputs.',
      17: 'Pulido de interfaz de usuario, accesibilidad (a11y) y preparación de sustentación.',
      18: 'Entrega y Sustentación de PROYECTO FINAL PROY (40%): Demostración en vivo de app en producción.'
    },
    exams: 'APF1 (Semana 5 • 20% • Grupal) • APF2 (Semana 10 • 20% • Grupal) • APF3 (Semana 15 • 20% • Grupal) • PROY (Semana 18 • 40% • Grupal)',
    tips: [
      'Practica modularizando tus componentes en React para mantener el código limpio.',
      'Asegúrate de manejar estados de error y de carga en todas tus llamadas a APIs.',
      'Usa TypeScript estricto para evitar bugs en tiempo de ejecución.'
    ]
  },
  'GESTIÓN DEL SERVICIO TI': {
    summary: 'Comprenderás los estándares globales de ITIL 4 para la gestión de servicios de tecnología, alineando los objetivos de TI con las necesidades estratégicas del negocio.',
    weeklyPlan: {
      1: 'Conceptos clave de la gestión del servicio: valor, co-creación de valor y partes interesadas.',
      2: 'Las cuatro dimensiones de la gestión de servicios: Organizaciones y personas, Información y tecnología, Socios y proveedores, Flujos de valor y procesos.',
      3: 'El Sistema de Valor del Servicio (SVS) de ITIL y los 7 principios guía.',
      4: 'La Cadena de Valor del Servicio: Planear, Mejorar, Diseñar y Transicionar, Obtener/Construir, Entregar y Soportar.',
      5: 'Práctica de Gestión de Incidentes: Restauración oportuna del servicio normal.',
      6: 'Evaluación PC1 (Semana 6 • 20%): Fundamentos de ITIL 4, SVS y 4 dimensiones.',
      7: 'Práctica de Service Desk (Mesa de Ayuda): Punto de contacto único y experiencia del usuario.',
      8: 'Práctica de Gestión de Problemas: Análisis de causa raíz y soluciones provisionales (workarounds).',
      9: 'Práctica de Control de Cambios: Maximizar cambios exitosos minimizando riesgos.',
      10: 'Práctica de Gestión del Nivel de Servicio (SLA, OLA y contratos subyacentes).',
      11: 'Práctica de Gestión de Solicitudes de Servicio y Catálogo de Servicios.',
      12: 'Diagnóstico y diseño de flujo de atención de incidentes y requerimientos.',
      13: 'Práctica de Gestión de Activos de TI (ITAM) y Gestión de la Configuración del Servicio (CMDB).',
      14: 'Evaluación PC2 (Semana 14 • 20%): Gestión de incidentes, problemas, Service Desk, SLA y CMDB.',
      15: 'Práctica de Gestión de la Disponibilidad y Continuidad del Servicio TI.',
      16: 'El modelo de Mejora Continua de ITIL y métricas de éxito (KPIs y CSFs).',
      17: 'Evaluación PA (Semana 17 • 20%): Cierre de participación continua acumulada en foros y talleres.',
      18: 'Evaluación PROYECTO FINAL PROY (Semana 18 • 40%): Sustentación de diseño integral de gestión de servicios TI.'
    },
    exams: 'PC1 (Semana 6 • 20% • Individual) • PC2 (Semana 14 • 20% • Individual) • PA (Semana 17 • 20% • Individual) • PROY (Semana 18 • 40% • Evaluación flexible)',
    tips: [
      'Relaciona siempre la teoría de ITIL con casos reales de caídas de sistemas en empresas.',
      'Domina la diferencia entre Incidente (interrupción del servicio) y Problema (causa raíz desconocida).',
      'Aprende a formular SLAs realistas con métricas medibles.'
    ]
  },
  'SERVICIOS CLOUD': {
    summary: 'Aprenderás a diseñar, implementar y escalar infraestructuras seguras y resilientes en la nube utilizando los principales proveedores como Amazon Web Services (AWS) y Google Cloud.',
    weeklyPlan: {
      1: 'Fundamentos de Cloud Computing: características esenciales del NIST y modelos de servicio (IaaS, PaaS, SaaS).',
      2: 'Modelos de despliegue: Nube Pública, Privada, Híbrida y Multinube. Regiones y Zonas de Disponibilidad (AZ).',
      3: 'Redes en la nube: Virtual Private Cloud (VPC), subredes públicas y privadas, tablas de enrutamiento y Security Groups.',
      4: 'Cómputo en la nube: Máquinas virtuales elásticas (Amazon EC2), tipos de instancias y ciclo de vida.',
      5: 'Evaluación PC1 (Semana 5 • 15%): Redes VPC, subredes, tablas de enrutamiento y EC2.',
      6: 'Almacenamiento de objetos y bloques: Amazon S3 (clases de almacenamiento, políticas de bucket) y Amazon EBS.',
      7: 'Escalabilidad y alta disponibilidad: Elastic Load Balancers (ALB/NLB) y grupos de Auto Scaling.',
      8: 'Examen Parcial EP (Semana 8 • 20%): Laboratorio práctico de alta disponibilidad en AWS (ALB, Auto Scaling, S3).',
      9: 'Arquitecturas Serverless: AWS Lambda, API Gateway y patrones orientados a eventos.',
      10: 'Bases de datos en la nube: RDS (PostgreSQL/MySQL), DynamoDB y estrategias de backup.',
      11: 'Seguridad en la nube: AWS IAM (usuarios, roles, políticas de mínimo privilegio) y cifrado con KMS.',
      12: 'Evaluación PC2 (Semana 12 • 15%): Arquitecturas Serverless con AWS Lambda, API Gateway y RDS.',
      13: 'Contenedores en la nube: Docker, Amazon ECS / EKS (Kubernetes) y repositorios ECR.',
      14: 'Automatización e Infraestructura como Código (IaC): Terraform y AWS CloudFormation.',
      15: 'Evaluación PC3 (Semana 15 • 20%): Microservicios Docker en ECS/EKS y CI/CD pipelines.',
      16: 'Gestión de costos y optimización (FinOps): AWS Cost Explorer, presupuestos y Trusted Advisor.',
      17: 'Marco de Buena Arquitectura (Well-Architected Framework): los 6 pilares de diseño.',
      18: 'Examen Final EF (Semana 18 • 30%): Sustentación de infraestructura cloud integral y resiliente.'
    },
    exams: 'PC1 (Semana 5 • 15%) • EP (Semana 8 • 20%) • PC2 (Semana 12 • 15%) • PC3 (Semana 15 • 20%) • EF (Semana 18 • 30%)',
    tips: [
      'Configura siempre alertas de presupuesto en tu cuenta de AWS para evitar cobros sorpresa.',
      'Sigue el principio de mínimo privilegio en IAM al asignar permisos.',
      'Asegúrate de que tus bases de datos siempre estén en subredes privadas sin IP pública.'
    ]
  },
  'FORMACIÓN PARA LA INVESTIGACIÓN - SISTEMAS': {
    summary: 'Aprenderás a elaborar un artículo de investigación bajo el formato de Revisión Sistemática de Literatura (RSL) para una revista indexada en Scopus o Web of Science, aplicando la metodología PICO para formulación de preguntas de investigación, el protocolo PRISMA para cribado y selección de literatura científica, gestión con Mendeley y análisis bibliométrico/cualitativo con estricta integridad académica (similitud < 20%).',
    weeklyPlan: {
      1: 'Lineamientos generales, Código de Ética e Integridad Científica UTP, identificación de temas de investigación y bases de datos Scopus / Web of Science.',
      2: 'Artículos de revisión de literatura, adecuación a líneas de investigación UTP y redacción de apartados 1 a 5 de la ficha (PA).',
      3: 'Selección del formato de revista indexada en Scopus/WoS, autoría ética y redacción de la introducción de la RSL.',
      4: 'Evaluación ATI1 (Semana 4 • 10% • Grupal): Entrega de Ficha de Investigación e Introducción del artículo RSL.',
      5: 'Estrategia de búsqueda sistemática PICO (Population, Intervention, Comparison, Outcome), operadores booleanos y Mendeley.',
      6: 'Pautas de selección sistemática PRISMA, criterios de inclusión/exclusión y cribado de artículos.',
      7: 'Lectura transversal, mapeo del flujo PRISMA en diagrama y redacción de la sección de Metodología de la RSL.',
      8: 'Evaluación ATI2 (Semana 8 • 20% • Grupal): Entrega de Metodología de Revisión Sistemática (PICO + PRISMA + Mendeley).',
      9: 'Estrategias de lectura crítica con estructura IMRD y confección de formularios de extracción de datos.',
      10: 'Lectura a profundidad y extracción sistemática de información de los artículos seleccionados.',
      11: 'Organización, categorización y detección de tendencias temáticas y debates en la literatura.',
      12: 'Redacción de resultados: análisis descriptivo/bibliométrico (autores, países, revistas) y tendencias temáticas.',
      13: 'Evaluación ATI3 (Semana 13 • 20% • Grupal): Entrega de la sección de Resultados de la RSL.',
      14: 'Redacción de la discusión de la RSL, contrastación con la literatura, limitaciones y conclusiones.',
      15: 'Revisión integral de la versión final del manuscrito RSL y redacción del resumen estructurado (Abstract).',
      16: 'Pautas para la presentación del Trabajo de Investigación (TI) y primera ronda de sustentaciones orales.',
      17: 'Evaluación PA (Semana 17 • 20% • Individual): Segunda ronda de sustentaciones, entrega final de artículo TI y cierre de participación acumulada.',
      18: 'Evaluación TI (Semana 18 • 30% • Grupal): Retroalimentación final del curso y publicación de nota del Trabajo de Investigación.'
    },
    exams: 'ATI1 (Semana 4 • 10% • Grupal) • ATI2 (Semana 8 • 20% • Grupal) • ATI3 (Semana 13 • 20% • Grupal) • PA (Semana 17 • 20% • Individual) • TI (Semana 18 • 30% • Grupal)',
    tips: [
      'Define con precisión tu ecuación de búsqueda PICO con operadores booleanos (AND, OR) en Scopus y Web of Science.',
      'Construye tu diagrama de flujo PRISMA registrando el número exacto de artículos identificados, cribados, excluidos y seleccionados.',
      'El índice de similitud en software antiplagio de la UTP no debe superar el 20% y está prohibido el uso de IA para redactar.',
      'Almacena y cita todas tus referencias directamente desde Mendeley siguiendo el estilo de la revista objetivo.'
    ]
  },
  'HERRAMIENTAS PARA LA COMUNICACIÓN EFECTIVA': {
    summary: 'Potenciarás tus habilidades de comunicación oral, escrita y no verbal para desenvolverte con liderazgo en equipos multidisciplinarios y presentaciones ejecutivas.',
    weeklyPlan: {
      1: 'La comunicación humana y sus barreras en entornos profesionales.',
      2: 'Comunicación no verbal: lenguaje corporal, contacto visual y modulación vocal.',
      3: 'Estrategias de escucha activa y empatía en equipos de trabajo.',
      4: 'Evaluación TA1 (Semana 4 • 20%): Análisis de casos de barreras comunicativas y asertividad.',
      5: 'Estructura de discursos persuasivos y narrativa profesional (Storytelling).',
      6: 'Redacción de correos ejecutivos, informes técnicos y minutas de reunión.',
      7: 'Diseño visual de diapositivas de alto impacto para proyectos de ingeniería.',
      8: 'Evaluación TA2 (Semana 8 • 20%): Video grabado de discurso persuasivo con storytelling.',
      9: 'Técnicas de oratoria moderna: manejo de la ansiedad y el miedo escénico.',
      10: 'Negociación efectiva y persuasión basada en intereses.',
      11: 'Comunicación en entornos digitales y reuniones virtuales eficientes.',
      12: 'Evaluación TA3 (Semana 12 • 20%): Simulación de negociación y manejo de objeciones.',
      13: 'Liderazgo comunicacional y feedback constructivo en equipos de ingeniería.',
      14: 'Comunicación en situaciones de crisis y manejo de prensa/clientes.',
      15: 'Estrategias de argumentación y debate estructurado.',
      16: 'Evaluación PA (Semana 16 • 10%): Cierre de participación activa y foros.',
      17: 'Taller de ensayo general de presentaciones ejecutivas y retroalimentación.',
      18: 'Evaluación TRABAJO FINAL TF (Semana 18 • 30%): Presentación oral ejecutiva en vivo de alto impacto.'
    },
    exams: 'TA1 (Semana 4 • 20%) • TA2 (Semana 8 • 20%) • TA3 (Semana 12 • 20%) • PA (Semana 16 • 10%) • TF (Semana 18 • 30%)',
    tips: [
      'Grábate previamente practicando tu discurso para corregir muletillas y postura.',
      'Aplica la regla de 10/20/30 en tus diapositivas de presentación ejecutiva.',
      'Enfoca tus argumentos en los beneficios concretos para el receptor (técnica WIIFM).'
    ]
  }
};

export function queryAssistant(
  prompt: string,
  context: {
    interval: UTPCurrentInterval;
    courses: ProcessedCourse[];
  }
): AIResponse {
  const cleanPrompt = prompt.toLowerCase().trim();
  const currentWeek = context.interval.week_number || 4;
  const events = context.interval.events || [];
  const { currentClass, nextClass, minutesToNext } = getCurrentAndNextClass(events);

  // 1. Preguntas sobre qué clase toca hoy o la siguiente clase
  if (
    cleanPrompt.includes('siguiente clase') ||
    cleanPrompt.includes('proxima clase') ||
    cleanPrompt.includes('próxima clase') ||
    cleanPrompt.includes('clase toca') ||
    cleanPrompt.includes('tengo clase')
  ) {
    if (currentClass) {
      const zoom = currentClass.metadata?.zoomLink;
      return {
        answer: `### 🔴 Clase en curso en este momento:
**${currentClass.title}**
- **Modalidad:** ${currentClass.modality === 'P' ? '🏛️ Presencial' : currentClass.modality === 'R' ? '💻 Remoto síncrono' : '🌐 Virtual'}
- **Horario:** ${formatTime(currentClass.startAt)} – ${formatTime(currentClass.finishAt)}
${zoom ? `- **Enlace Zoom:** [Entrar a la sesión en vivo](${zoom})` : ''}

Te recomiendo unirte a la sala o tomar asiento de inmediato.`,
        suggestedActions: [
          zoom ? 'Abrir enlace de Zoom' : 'Ver horario completo',
          '¿Qué temas tocan hoy?',
          '¿Cuándo es mi siguiente examen?'
        ],
        contextInfo: {
          zoomLink: zoom,
        }
      };
    }

    if (nextClass) {
      const zoom = nextClass.metadata?.zoomLink;
      const timeStr = formatTime(nextClass.startAt);
      const countdownStr = minutesToNext
        ? minutesToNext > 60
          ? `(en ${Math.floor(minutesToNext / 60)}h ${minutesToNext % 60}m)`
          : `(en ${minutesToNext} minutos)`
        : '';

      return {
        answer: `### ⏰ Tu próxima clase programada:
**${nextClass.title}**
- **Hora de inicio:** ${timeStr} ${countdownStr}
- **Modalidad:** ${nextClass.modality === 'P' ? '🏛️ Presencial' : nextClass.modality === 'R' ? '💻 Remoto por Zoom' : '🌐 Virtual'}
${zoom ? `- **Sala Zoom directa:** [Clic para ingresar](${zoom})` : ''}

> [!TIP]
> Te sugiero repasar los apuntes de la semana anterior 10 minutos antes de comenzar.`,
        suggestedActions: [
          '¿Qué temas tocan en esta clase?',
          'Ver clases de toda la semana',
          'Generar resumen de estudio'
        ],
        contextInfo: {
          zoomLink: zoom,
        }
      };
    }

    return {
      answer: `No tienes más clases programadas para el día de hoy. ¡Es un excelente momento para avanzar tareas o repasar los sílabos de la **Semana ${currentWeek}**!`,
      suggestedActions: [
        '¿Cuándo son mis exámenes parciales?',
        'Ver horario de la semana',
        'Plan de estudio recomendado'
      ]
    };
  }

  // 2. Preguntas sobre exámenes, parciales y evaluaciones
  if (
    cleanPrompt.includes('examen') ||
    cleanPrompt.includes('examenes') ||
    cleanPrompt.includes('parcial') ||
    cleanPrompt.includes('evaluacion') ||
    cleanPrompt.includes('evaluación') ||
    cleanPrompt.includes('pc') ||
    cleanPrompt.includes('calificada')
  ) {
    const weeksToParcial = Math.max(0, 8 - currentWeek);
    const weeksToFinal = Math.max(0, 18 - currentWeek);

    return {
      answer: `### 📅 Calendario Oficial de Evaluaciones UTP (${context.interval.period_name})
Actualmente te encuentras en la **Semana ${currentWeek} de ${context.interval.total_weeks}**.

| Hito Académico | Semana | Estado / Tiempo Restante |
| :--- | :---: | :--- |
| **Evaluación Continua 1 (EC1 / PC1)** | **Semana 4 - 5** | ${currentWeek <= 5 ? '🟡 **En desarrollo / Próxima**' : '✅ Completada'} |
| **Exámenes Parciales (EP)** | **Semana 8** | ⏳ **Faltan ${weeksToParcial} semanas** |
| **Evaluación Continua 2 (EC2 / PC2)** | **Semana 12** | 📌 Evaluaciones de laboratorio y prototipos |
| **Evaluación Continua 3 (EC3 / PC3)** | **Semana 15** | 📌 Avance final de proyectos integradores |
| **Exámenes Finales & Sustentaciones (EF)** | **Semana 18** | ⏳ **Faltan ${weeksToFinal} semanas** |

> [!IMPORTANT]
> **Recomendación de Copiloto IA:**
> En tus cursos de **Desarrollo Web Integrado** y **Servicios Cloud**, las evaluaciones continuas ponderan un alto porcentaje del promedio final. Asegúrate de tener los repositorios de GitHub y la arquitectura en AWS al día.`,
      suggestedActions: [
        '¿Qué temas vienen en Desarrollo Web Integrado?',
        '¿Cómo prepararme para Servicios Cloud?',
        'Ver sílabos de todos mis cursos'
      ]
    };
  }

  // 3. Preguntas sobre temas de una materia específica o de la semana
  for (const [courseName, data] of Object.entries(COURSE_SYLLABUS_KNOWLEDGE)) {
    const courseShort = courseName.toLowerCase();
    if (
      cleanPrompt.includes(courseShort) ||
      (courseShort.includes('web') && cleanPrompt.includes('web')) ||
      (courseShort.includes('cloud') && cleanPrompt.includes('cloud')) ||
      (courseShort.includes('investigacion') && (cleanPrompt.includes('investigacion') || cleanPrompt.includes('investigación') || cleanPrompt.includes('tesis'))) ||
      (courseShort.includes('servicio ti') && (cleanPrompt.includes('servicio') || cleanPrompt.includes('itil') || cleanPrompt.includes('gestion'))) ||
      (courseShort.includes('comunicacion') && (cleanPrompt.includes('comunicacion') || cleanPrompt.includes('comunicación')))
    ) {
      const thisWeekTopic = data.weeklyPlan[currentWeek] || 'Consolidación de temas de la unidad.';
      const nextWeekTopic = data.weeklyPlan[currentWeek + 1] || 'Evaluación y aplicación práctica.';

      return {
        answer: `### 📚 Sílabo & Temario: **${courseName}**
${data.summary}

#### 🎯 Temario de la Semana Actual (**Semana ${currentWeek}**):
👉 **${thisWeekTopic}**

#### 🔜 Próxima Semana (**Semana ${currentWeek + 1}**):
👉 **${nextWeekTopic}**

#### 🏆 Fechas Clave de Evaluación:
${data.exams}

#### 💡 Consejos de Estudio del Asistente:
${data.tips.map(t => `- ${t}`).join('\n')}`,
        suggestedActions: [
          `Descargar Sílabo de ${courseName.split(' ')[0]}`,
          '¿Cuándo son mis exámenes parciales?',
          '¿Qué clase me toca hoy?'
        ],
        contextInfo: {
          courseName,
          weekNumber: currentWeek,
        }
      };
    }
  }

  // 4. Preguntas sobre qué temas tocan esta semana en general
  if (
    cleanPrompt.includes('esta semana') ||
    cleanPrompt.includes('temas tocan') ||
    cleanPrompt.includes('que temas') ||
    cleanPrompt.includes('qué temas') ||
    cleanPrompt.includes('semana actual')
  ) {
    return {
      answer: `### 🗺️ Hoja de Ruta de la **Semana ${currentWeek}** (Ciclo 2 Agosto 2026)

Aquí tienes el desglose de lo que abordarás en cada una de tus asignaturas esta semana:

1. **Desarrollo Web Integrado:**
   - 📌 *Tema:* ${COURSE_SYLLABUS_KNOWLEDGE['DESARROLLO WEB INTEGRADO'].weeklyPlan[currentWeek]}
   - ⚡ *Foco:* Hooks fundamentales de React (\`useState\`, \`useEffect\`) y renderizado condicional.

2. **Servicios Cloud:**
   - 📌 *Tema:* ${COURSE_SYLLABUS_KNOWLEDGE['SERVICIOS CLOUD'].weeklyPlan[currentWeek]}
   - ⚡ *Foco:* Aprovisionamiento de instancias EC2 y asignación de direcciones IP elásticas.

3. **Gestión del Servicio TI:**
   - 📌 *Tema:* ${COURSE_SYLLABUS_KNOWLEDGE['GESTIÓN DEL SERVICIO TI'].weeklyPlan[currentWeek]}
   - ⚡ *Foco:* Cadena de valor del servicio en ITIL 4 y diseño de flujos operacionales.

4. **Formación para la Investigación - Sistemas:**
   - 📌 *Tema:* ${COURSE_SYLLABUS_KNOWLEDGE['FORMACIÓN PARA LA INVESTIGACIÓN - SISTEMAS'].weeklyPlan[currentWeek]}
   - ⚡ *Foco:* Formulación de objetivos de tesis y redacción de hipótesis general.

5. **Herramientas para la Comunicación Efectiva:**
   - 📌 *Tema:* ${COURSE_SYLLABUS_KNOWLEDGE['HERRAMIENTAS PARA LA COMUNICACIÓN EFECTIVA'].weeklyPlan[currentWeek]}
   - ⚡ *Foco:* Técnicas de asertividad y comunicación en entornos de alta presión.`,
      suggestedActions: [
        '¿Cuándo es mi próximo examen?',
        '¿Qué clase me toca hoy?',
        'Ver horario semanal completo'
      ]
    };
  }

  // 5. Plan de estudio personalizado o sugerencias
  if (
    cleanPrompt.includes('estudiar') ||
    cleanPrompt.includes('plan de estudio') ||
    cleanPrompt.includes('organizar') ||
    cleanPrompt.includes('consejo') ||
    cleanPrompt.includes('tips')
  ) {
    return {
      answer: `### 🚀 Plan de Estudio Optimizado para la **Semana ${currentWeek}**

He diseñado esta estrategia basada en tu carga horaria y las modalidades de tus cursos:

- **Bloque Frontend (Jueves 16:00 - 18:15):** Antes de tu clase de *Desarrollo Web Integrado*, repasa los hooks de estado y ciclo de vida en React para aprovechar al máximo la sesión práctica.
- **Bloque Cloud (Jueves & Viernes 18:30 - 20:00):** Realiza laboratorios en la consola de AWS creando VPCs y subredes para afianzar conceptos antes de la semana 5.
- **Bloque Gestión TI & Tesis (Lunes & Martes):** Dedica 45 minutos a redactar tu matriz de consistencia antes de la clase de *Investigación*.

> [!TIP]
> Recuerda que tienes enlaces de Zoom directos a tus clases remotas en la pestaña **Horario Semanal**.`,
      suggestedActions: [
        '¿Qué temas tocan en Desarrollo Web?',
        'Ver enlaces de Zoom de mis clases',
        '¿Cuándo son los exámenes finales?'
      ]
    };
  }

  // Respuesta general inteligente tipo Claude
  return {
    answer: `Hola Joan. Como tu **Copiloto Académico de la UTP**, estoy conectado a tu calendario del ciclo **${context.interval.period_name}** (Semana ${currentWeek} de ${context.interval.total_weeks}) y a los sílabos de tus 6 asignaturas.

Puedo ayudarte con:
- 📖 **Temarios y Sílabos:** Saber con exactitud qué temas se enseñarán en cualquier semana.
- 🎯 **Preparación de Exámenes:** Fechas de Evaluaciones Continuas (EC), Exámenes Parciales (Semana 8) y Finales (Semana 18).
- ⏰ **Horarios y Enlaces:** Recordatorios de tus próximas clases con acceso directo a Zoom.
- 💡 **Planes de Estudio:** Recomendaciones personalizadas según la carga de tu semana.

¿Sobre qué curso o fecha te gustaría consultar?`,
    suggestedActions: [
      '¿Qué temas tocan esta semana?',
      '¿Cuándo es mi siguiente examen?',
      '¿Qué clase me toca hoy?',
      'Temario de Desarrollo Web Integrado'
    ]
  };
}
