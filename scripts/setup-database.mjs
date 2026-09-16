import fs from 'fs';
import path from 'path';

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'hvunobsbasdksiajmfjf';

async function executeSql(sql) {
  if (!SUPABASE_ACCESS_TOKEN) {
    throw new Error('SUPABASE_ACCESS_TOKEN no definido en variables de entorno.');
  }

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`SQL Execution failed (${res.status}): ${errText}`);
  }

  return await res.json();
}

async function run() {
  console.log('🚀 Iniciando despliegue de base de datos en Supabase...');
  
  // 1. Ejecutar Schema
  const schemaPath = path.resolve(process.cwd(), 'scripts/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('📦 Aplicando DDL Schema...');
  await executeSql(schemaSql);
  console.log('✅ Tablas, RLS y Políticas creadas con éxito.');

  // 2. Insertar Semillas de Estudiantes
  console.log('🌱 Insertando semillas de usuarios y mentores...');
  const studentSql = `
    INSERT INTO public.students (id, student_code, full_name, email, career, campus, cycle, reputation_score, wallet_balance_cents, locked_escrow_cents)
    VALUES 
      ('00000000-0000-0000-0000-000000000001', 'U20202020', 'Joan Laurente', 'jlaurente@utp.edu.pe', 'Ingeniería de Software', 'Campus Digital', 7, 150, 4500, 2000),
      ('00000000-0000-0000-0000-000000000002', 'U19204910', 'David Zevallos', 'dzevallos@utp.edu.pe', 'Ing. de Software (10mo Ciclo)', 'Campus Digital', 10, 210, 12000, 0),
      ('00000000-0000-0000-0000-000000000003', 'U19304812', 'Camila Salazar', 'csalazar@utp.edu.pe', 'Ing. de Sistemas (9no Ciclo)', 'Torre Arequipa', 9, 195, 8500, 0),
      ('00000000-0000-0000-0000-000000000004', 'U20104822', 'Jorge Huamán', 'jhuaman@utp.edu.pe', 'Ciencias de la Computación', 'Campus Digital', 8, 170, 6000, 0),
      ('00000000-0000-0000-0000-000000000005', 'U21204891', 'Mateo Quispe', 'mquispe@utp.edu.pe', 'Ing. de Software', 'Torre Arequipa - Piso 4', 7, 120, 0, 0),
      ('00000000-0000-0000-0000-000000000006', 'U20309912', 'Valeria Mendoza', 'vmendoza@utp.edu.pe', 'Ing. de Sistemas', 'Campus Digital', 8, 140, 0, 0)
    ON CONFLICT (student_code) DO UPDATE SET 
      full_name = EXCLUDED.full_name,
      career = EXCLUDED.career;
  `;
  await executeSql(studentSql);

  // 3. Insertar Semillas de Faros de Networking
  console.log('📡 Insertando Faros de Networking...');
  const beaconsSql = `
    INSERT INTO public.study_beacons (id, host_id, host_name, host_code, host_career, course_id, course_name, location_name, objective, max_collaborators, current_collaborators, status, expires_at)
    VALUES 
      ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'Mateo Quispe', 'U21204891', 'Ing. de Software', '100000ST61', 'DESARROLLO WEB Y APLICACIONES MÓVILES', 'Biblioteca Central Piso 4 - Mesa 12', 'Repaso y armado de arquitectura para entregable APF1 (React + Tailwind)', 4, 2, 'ACTIVE', NOW() + interval '2 hours'),
      ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'Valeria Mendoza', 'U20309912', 'Ing. de Sistemas', '100000SI12', 'GESTIÓN DEL SERVICIO TI', 'Sala Discord UTP Voice #3', 'Simulacro de preguntas teóricas para la PC1 de Gestión del Servicio TI', 5, 3, 'ACTIVE', NOW() + interval '3 hours')
    ON CONFLICT (id) DO NOTHING;
  `;
  await executeSql(beaconsSql);

  // 4. Insertar Semillas de Marketplace
  console.log('🛒 Insertando Servicios del Marketplace...');
  const servicesSql = `
    INSERT INTO public.academic_services (id, mentor_id, mentor_name, mentor_code, mentor_career, course_id, title, description, service_type, price_cents, duration_minutes, rating_avg, total_reviews, is_active)
    VALUES 
      ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'David Zevallos', 'U19204910', 'Ing. de Software (10mo Ciclo)', '100000ST61', 'Simulacro de Sustentación APF1 y Auditoría de Código React', 'Revisión exhaustiva de tu arquitectura de componentes, cumplimiento de rúbrica y simulación de preguntas típicas del docente.', 'MOCK_DEFENSE', 2000, 45, 4.95, 18, true),
      ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Camila Salazar', 'U19304812', 'Ing. de Sistemas (9no Ciclo)', '100000SI12', 'Asesoría 1 a 1 para PC1 de Gestión del Servicio TI (ITIL 4)', 'Resolución de casos de estudio, formulación de SLAs, métricas de incidentes y problemas con garantía de comprensión.', 'TUTORING_1ON1', 1500, 40, 5.00, 24, true),
      ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'Jorge Huamán', 'U20104822', 'Ciencias de la Computación', '100000ST62', 'Configuración de Laboratorios Cloud AWS & Docker', 'Te ayudo a levantar y configurar tu VPC, EC2, contenedores y pipelines sin errores para tus entregables de Servicios Cloud.', 'CODE_REVIEW', 2500, 50, 4.90, 12, true)
    ON CONFLICT (id) DO NOTHING;
  `;
  await executeSql(servicesSql);

  // 5. Insertar Semillas de Comunidad
  console.log('💬 Insertando Posts de Comunidad...');
  const postsSql = `
    INSERT INTO public.community_posts (id, author_id, author_name, author_code, author_career, course_id, category, title, content, upvotes_count, comments_count)
    VALUES 
      ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'Carlos Benítez', 'U19302911', 'Ingeniería de Sistemas', '100000ST61', 'PROJECT_RECRUITMENT', 'Buscamos 1 integrante Backend para el entregable APF1 de Desarrollo Web', 'Somos 2 alumnos trabajando con React + Next.js y Tailwind. Buscamos a alguien que maneje PostgreSQL / Supabase o APIs en Node para completar el equipo de 3.', 14, 5),
      ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'Andrea Rivas', 'U21301289', 'Ingeniería de Software', '100000SI12', 'STUDY_TIPS', 'Resumen de las 4 Dimensiones de ITIL 4 para la PC1 de Gestión TI', 'Les comparto los puntos clave que siempre entran en la PC1: 1. Organizaciones y Personas, 2. Información y Tecnología, 3. Socios y Proveedores, 4. Flujos de Valor y Procesos.', 29, 8)
    ON CONFLICT (id) DO NOTHING;
  `;
  await executeSql(postsSql);

  console.log('🎉 ¡Base de datos poblada exitosamente en Supabase!');
}

run().catch(err => {
  console.error('❌ Error en el despliegue:', err);
  process.exit(1);
});
