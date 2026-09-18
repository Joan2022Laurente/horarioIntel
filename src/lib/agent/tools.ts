import { AgentAction, NavigationTab } from '@/types/agent';

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'navigateToTab',
      description: 'Navega a una pestaña de la aplicación. USAR ÚNICAMENTE ante órdenes explícitas de navegación como: "ir a horario", "ve a cursos", "abrir comunidad", "ir a mentorías".',
      parameters: {
        type: 'object',
        properties: {
          tab: {
            type: 'string',
            enum: ['today', 'weekly', 'courses', 'networking', 'community', 'marketplace'],
            description: 'La pestaña destino en la aplicación: today (Hoy), weekly (Horario semanal), courses (Cursos y sílabos), networking (Huecos libres y faros de estudio), community (Foro y preguntas), marketplace (Mentorías y asesorías).',
          },
        },
        required: ['tab'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'openSyllabus',
      description: 'Abre la ventana modal interactiva del sílabo oficial en pantalla. USAR ÚNICAMENTE ante comandos directos de apertura de interfaz como: "abre el sílabo", "ábreme el sílabo", "mostrar sílabo en pantalla". NUNCA usar esta herramienta para preguntas de estudio, qué aprender, temarios o explicaciones (responde esas preguntas con texto directo).',
      parameters: {
        type: 'object',
        properties: {
          courseName: {
            type: 'string',
            description: 'Nombre o código de la asignatura a abrir (ej: "Servicios Cloud", "Desarrollo Web Integrado").',
          },
        },
        required: ['courseName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'openSettings',
      description: 'Abre el modal de configuración y perfil UTP ante pedidos explícitos ("configuración", "abrir ajustes").',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];

export function parseToolCallToAction(toolName: string, rawArgs: string | Record<string, unknown>): AgentAction | undefined {
  try {
    const args = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
    switch (toolName) {
      case 'navigateToTab':
        if (args.tab) {
          return {
            type: 'NAVIGATE_TAB',
            payload: { tab: args.tab as NavigationTab },
          };
        }
        break;
      case 'openSyllabus':
        if (args.courseName) {
          return {
            type: 'OPEN_SYLLABUS',
            payload: { courseName: args.courseName },
          };
        }
        break;
      case 'openSettings':
        return { type: 'OPEN_SETTINGS' };
    }
  } catch (err) {
    console.warn('[ToolParser] Error al parsear tool call:', err);
  }
  return undefined;
}
