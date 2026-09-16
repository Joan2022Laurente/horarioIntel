export interface ClassroomLocation {
  campus: string;
  pabellon: string;
  piso: number;
  aula: string;
  tipo: string;
}

/**
 * Genera la información de ubicación física estructurada (Campus, Pabellón, Piso, Aula, Tipo)
 * de forma determinista y consistente por sección y curso.
 */
export function getClassroomLocation(courseName: string, sectionCode?: string, studentCampus?: string): ClassroomLocation {
  const seed = (sectionCode || courseName).trim();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 100000;
  }

  const pabellones = ['Pabellón A', 'Pabellón B', 'Pabellón C', 'Torre Tecnológica'];
  const pabellonIndex = hash % pabellones.length;
  const pabellon = pabellones[pabellonIndex];
  
  const piso = (hash % 6) + 2; // Pisos 2 al 7
  const aulaNum = ((hash * 7) % 18) + 1;
  const aulaLetra = pabellon.startsWith('Torre') ? 'T' : pabellon.charAt(pabellon.length - 1);
  const aula = `Aula ${aulaLetra}-${piso}${aulaNum < 10 ? '0' : ''}${aulaNum}`;

  const isLab = courseName.toUpperCase().includes('WEB') || 
                courseName.toUpperCase().includes('CLOUD') || 
                courseName.toUpperCase().includes('PROGRAMACI') ||
                courseName.toUpperCase().includes('SISTEMAS');

  return {
    campus: studentCampus || 'Campus Lima Centro',
    pabellon,
    piso,
    aula,
    tipo: isLab ? 'Laboratorio Especializado de Sistemas' : 'Aula Multimedia Interactiva',
  };
}
