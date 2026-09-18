import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Server, 
  Database, 
  Key, 
  FileText, 
  CheckCircle2, 
  ArrowLeft,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const metadata = {
  title: 'Políticas de Privacidad y Seguridad | Plataforma Académica UTP',
  description: 'Documentación transparente sobre la arquitectura de seguridad, tratamiento de datos y política de cero almacenamiento de contraseñas.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#070709] text-neutral-200 selection:bg-[var(--accent-lime)] selection:text-black">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--accent-lime)]/5 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-blue-500/5 blur-[160px] rounded-full" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-white/10 bg-[#0c0c10]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Volver al inicio de sesión</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent-lime)] animate-pulse" />
            <span className="text-xs font-mono text-neutral-400">Security Directive v2.4</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-10">
        
        {/* Hero Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-lime)]/10 border border-[var(--accent-lime)]/20 text-[var(--accent-lime)] text-xs font-mono font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>Transparencia y Seguridad 100%</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Políticas de Privacidad & Arquitectura de Seguridad
          </h1>
          <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
            Conoce cómo protegemos tus datos, el funcionamiento de la autenticación oficial SSO de UTP y nuestro principio inquebrantable de cero almacenamiento de contraseñas.
          </p>
        </div>

        {/* Highlight Card */}
        <div className="p-6 rounded-3xl bg-[var(--accent-lime)]/5 border border-[var(--accent-lime)]/20 backdrop-blur-xl flex flex-col sm:flex-row items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[var(--accent-lime)]/10 border border-[var(--accent-lime)]/30 flex items-center justify-center text-[var(--accent-lime)] shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base font-bold text-white">
              Garantía Zero-Storage: Tus contraseñas nunca se guardan
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              La plataforma <strong>jamás almacena, registra ni persiste contraseñas</strong> en ninguna base de datos, archivo o log. Las credenciales viajan exclusivamente mediante un canal encriptado TLS 1.3 / SSL hacia los servidores de Keycloak de la UTP para la emisión de tokens de acceso efímeros.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          
          {/* Section 1 */}
          <section className="p-6 rounded-3xl bg-[#0e0e14] border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-white font-bold text-base border-b border-white/5 pb-3">
              <Server className="h-5 w-5 text-[var(--accent-lime)]" />
              <h2>1. Autenticación Directa Institucional (UTP SSO)</h2>
            </div>
            
            <p className="text-xs text-neutral-400 leading-relaxed">
              El proceso de inicio de sesión se realiza en tiempo real contra el servidor central de autenticación de la universidad:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Lock className="h-4 w-4 text-blue-400" />
                  Protocolo OAuth 2.0 / OIDC
                </div>
                <p className="text-[11px] text-neutral-400">
                  La comunicación se realiza directamente contra <code className="text-white bg-white/10 px-1 py-0.5 rounded">https://sso.utp.edu.pe</code> utilizando el client oficial de estudiantes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Key className="h-4 w-4 text-amber-400" />
                  Tokens JWT Efímeros
                </div>
                <p className="text-[11px] text-neutral-400">
                  El servidor de UTP responde con un Bearer Token con tiempo de vida limitado. Una vez emitido el token, la contraseña es purgada de la memoria inmediatamente.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-3xl bg-[#0e0e14] border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-white font-bold text-base border-b border-white/5 pb-3">
              <Database className="h-5 w-5 text-[var(--accent-lime)]" />
              <h2>2. Datos Persistidos y Finalidad Específica</h2>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Para sincronizar tus cursos, horario y rúbricas de evaluación sin necesidad de que inicies sesión continuamente, se persisten los siguientes datos públicos del perfil:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-lime)] mt-1 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Código Institucional</div>
                  <div className="text-[11px] text-neutral-400">Para asociar tu horario y tus entregables de manera única.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-lime)] mt-1 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Nombre y Correo Institucional</div>
                  <div className="text-[11px] text-neutral-400">Para personalizar tu experiencia y reportes académicos.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-lime)] mt-1 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Carrera y Campus</div>
                  <div className="text-[11px] text-neutral-400">Para contextualizar recomendaciones de estudio del copiloto.</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3">
                <span className="h-2 w-2 rounded-full bg-[var(--accent-lime)] mt-1 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Horario y Cronograma de Clases</div>
                  <div className="text-[11px] text-neutral-400">Estructura de cursos, aulas, docentes y evaluaciones.</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-3xl bg-[#0e0e14] border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-white font-bold text-base border-b border-white/5 pb-3">
              <Cpu className="h-5 w-5 text-[var(--accent-lime)]" />
              <h2>3. Cifrado Local y Control de Sesión</h2>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              En tu navegador, los datos de sesión se almacenan de forma local en <code className="text-white bg-white/10 px-1 py-0.5 rounded">localStorage</code>. Puedes purgar toda la información local en cualquier momento haciendo clic en <strong>&quot;Cerrar Sesión&quot;</strong>, lo que eliminará inmediatamente todos los tokens y datos de tu dispositivo.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-3xl bg-[#0e0e14] border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-white font-bold text-base border-b border-white/5 pb-3">
              <Layers className="h-5 w-5 text-[var(--accent-lime)]" />
              <h2>4. Cuota Responsable del Asistente de IA</h2>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Para garantizar que los recursos de cómputo y modelos de lenguaje de última generación permanezcan disponibles y gratuitos para todos los estudiantes, se aplica un límite de <strong>6 consultas diarias por alumno</strong> que se restablece automáticamente a las 00:00 horas cada día.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-3xl bg-neutral-900/50 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <FileText className="h-4 w-4 text-neutral-400" />
              <h2>5. Declaración de Independencia y Propiedad Intelectual</h2>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Esta plataforma es un proyecto académico y tecnológico autónomo, creado con el fin de optimizar el aprendizaje, la organización y el rendimiento de los estudiantes. No constituye un servicio oficial operado ni administrado directamente por la Universidad Tecnológica del Perú (UTP). Las marcas registradas y logotipos institucionales pertenecen a sus respectivos propietarios.
            </p>
          </section>

        </div>

        {/* Bottom Action */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-neutral-500">
            © 2026 Plataforma Académica Estudiantil UTP. Todos los derechos reservados.
          </span>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-2xl bg-[var(--accent-lime)] hover:bg-[#a8e63b] text-[#0a0a0c] font-black text-xs transition active:scale-95 shadow-lg shadow-[var(--accent-lime)]/20"
          >
            Volver a la Plataforma
          </Link>
        </div>

      </main>
    </div>
  );
}
