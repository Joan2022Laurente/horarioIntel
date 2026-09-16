import { StudentProfile, UTPCalendarResponse } from '@/types/utp';

export const GUEST_STUDENT_PROFILE: StudentProfile = {
  name: 'Estudiante Invitado',
  username: 'INVITADO',
  email: 'estudiante@utp.edu.pe',
  userId: '',
  tenantId: 'a5f469d2-3c0e-5c68-8d32-5265923a8e40',
  role: 'STUDENT',
  career: 'UTP Pregrado',
  campus: 'Campus Digital',
};

export const EMPTY_CALENDAR_RESPONSE: UTPCalendarResponse = {
  success: true,
  code: 200,
  message: 'Sin sesión activa. Inicia sesión para cargar tu horario.',
  idTransaction: 'guest-session-empty',
  data: {
    current_interval: {
      period_name: '2026 - Ciclo 2 Agosto',
      week_number: 5,
      total_weeks: 18,
      current_date: '2026-09-14 00:00:00',
      start_of_interval: '2026-09-14 00:00:00',
      end_of_interval: '2026-09-20 23:59:59',
      start_of_period: '2026-08-18 00:00:00',
      end_of_period: '2026-12-20 23:59:59',
      events: [],
    },
  },
};

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  name: 'Estudiante UTP',
  username: 'INVITADO',
  email: 'estudiante@utp.edu.pe',
  userId: '',
  tenantId: 'a5f469d2-3c0e-5c68-8d32-5265923a8e40',
  role: 'STUDENT',
  career: 'UTP Pregrado',
  campus: 'Campus Digital',
};

export const INITIAL_CALENDAR_RESPONSE = EMPTY_CALENDAR_RESPONSE;

export const KNOWN_SYLLABUS_MAP: Record<string, { syllabusUrl: string; name: string }> = {
  // Desarrollo Web Integrado
  '29b3fddb-e8dc-50cc-8e5c-9a3a2d3cd1bb': {
    name: 'Desarrollo Web Integrado',
    syllabusUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/presencial/100000ST61_DesarrolloWebIntegrado.pdf'
  },
  // Gestión del Servicio TI
  'c6341c15-436c-59af-8803-ce512fb45697': {
    name: 'Gestión del Servicio TI',
    syllabusUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/virtual/100000SI12_GestionDelServicioTI.pdf'
  },
  // Formación para la Investigación - Sistemas
  '49613f79-5bd6-5a23-a774-973aff3dbc48': {
    name: 'Formación para la Investigación - Sistemas',
    syllabusUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/virtual/100000SI34_FormacionInvestigacionSistemas.pdf'
  },
  // Servicios Cloud
  'efab3b1e-7f8b-5d82-af6b-49f09d748a0b': {
    name: 'Servicios Cloud',
    syllabusUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/presencial/100000ST62_ServiciosCloud.pdf'
  },
  // Herramientas para la Comunicación Efectiva
  '24577268-593a-5db7-a592-d676a656f171': {
    name: 'Herramientas para la Comunicación Efectiva',
    syllabusUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/virtual/100000CO01_HerramientasComunicacionEfectiva.pdf'
  },
  // Lenguajes de Programación
  '34384-lenguajes-programacion': {
    name: 'Lenguajes de Programación',
    syllabusUrl: 'https://ms-utp-prd-silbiaback-cd.s3.amazonaws.com/pdfs/approved/complete/2026%20-%20Ciclo%202%20Agosto/presencial/100000SI23_LenguajesDeProgramacion.pdf'
  }
};
