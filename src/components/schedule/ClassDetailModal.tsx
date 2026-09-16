'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UTPEvent, UTPCurrentInterval, ChatMessage } from '@/types/utp';
import { parseEventTitle, formatTime, parseDate, DAYS_OF_WEEK } from '@/lib/schedule-parser';
import { getSyllabusForCourse } from '@/lib/syllabus/official-registry';
import { getClassroomLocation } from '@/lib/classroom-helper';
import { 
  X, 
  Video, 
  MapPin, 
  Radio, 
  Clock, 
  Calendar, 
  Building2, 
  Layers, 
  BookOpen, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Award,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ClassDetailModalProps {
  isOpen: boolean;
  event: UTPEvent | null;
  weekNumber?: number;
  interval?: UTPCurrentInterval;
  onClose: () => void;
  onOpenGlobalAi?: (prompt: string) => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  isOpen,
  event,
  weekNumber = 5,
  interval,
  onClose,
  onOpenGlobalAi,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const parsed = event ? parseEventTitle(event.title) : { cleanTitle: '', sectionCode: '', weekInTitle: weekNumber };
  const effectiveWeek = parsed.weekInTitle || weekNumber;
  const courseSyllabus = event ? getSyllabusForCourse(parsed.cleanTitle) : null;
  
  // Buscar la sesión del sílabo para la semana actual
  const syllabusWeekSession = courseSyllabus?.weeklySchedule.find(s => s.week === effectiveWeek) || null;
  const evaluationInWeek = courseSyllabus?.evaluations.find(e => e.week === effectiveWeek) || null;

  const isRemoteZoom = event?.modality === 'R';
  const isPresencial = event?.modality === 'P';
  const isVirtual = event?.modality === 'VT';

  // Ubicación física determinista
  const location = getClassroomLocation(parsed.cleanTitle, parsed.sectionCode);

  // Fecha y día
  const eventDate = event ? parseDate(event.startAt) : new Date();
  const dayName = DAYS_OF_WEEK[eventDate.getDay()] || 'Lunes';

  // Inicializar chat context cuando cambia el evento
  useEffect(() => {
    if (!event) return;

    const topicText = syllabusWeekSession?.topic || 
      syllabusWeekSession?.topics?.join(', ') || 
      `Avance académico correspondiente a la Semana ${effectiveWeek}`;

    const initialAiMessage: ChatMessage = {
      id: 'init-class-ai',
      role: 'assistant',
      content: `¡Hola! Soy tu asistente para **${parsed.cleanTitle}** en la **Semana ${effectiveWeek}**.\n\n📚 **Tema del Sílabo:** ${topicText}\n${
        evaluationInWeek ? `🎯 **Evaluación Programada:** ${evaluationInWeek.type} - ${evaluationInWeek.description} (${evaluationInWeek.weightPercent}%)\n` : ''
      }\n¿En qué te ayudo a preparar esta sesión? Puedes preguntarme sobre conceptos clave, qué esperar en la clase o cómo resolver los ejercicios.`,
      timestamp: 'Ahora',
      suggestedActions: [
        '¿Qué temas específicos tocan en esta clase?',
        'Dame un resumen de los conceptos clave',
        evaluationInWeek ? `¿Cómo prepararme para ${evaluationInWeek.type}?` : '¿Qué tareas o prácticas vienen?',
        '¿Qué ejercicios o preguntas típicas vendrán?'
      ]
    };

    setMessages([initialAiMessage]);
  }, [event?.id, effectiveWeek]);

  // Auto-scroll del chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen || !event) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Para el curso "${parsed.cleanTitle}" en la Semana ${effectiveWeek} (${syllabusWeekSession?.unit || 'Unidad de Aprendizaje'}): ${text}`,
          calendarData: interval ? { data: { current_interval: interval } } : undefined,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data?.answer) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: resData.data.answer,
          suggestedActions: resData.data.suggestedActions,
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('Sin respuesta');
      }
    } catch {
      // Fallback local con conocimiento del sílabo
      const topic = syllabusWeekSession?.topic || 'los temas oficiales del sílabo';
      const fallbackReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Para **${parsed.cleanTitle}** en la **Semana ${effectiveWeek}**, el temario se centra en: **${topic}**.\n\nTe recomiendo repasar las lecturas y guías de laboratorio disponibles en Canvas y preparar tus consultas para el docente durante la sesión.`,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#121216] text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 bg-[#16161c] shrink-0">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {isPresencial ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#00e676] bg-[#00c853]/15 px-3 py-1 rounded-full">
                  <MapPin className="h-3.5 w-3.5" />
                  Presencial
                </span>
              ) : isRemoteZoom ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#ff7043] bg-[#ff5722]/15 px-3 py-1 rounded-full">
                  <Video className="h-3.5 w-3.5" />
                  Remoto Zoom
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#9195ff] bg-[#7075ff]/15 px-3 py-1 rounded-full">
                  <Radio className="h-3.5 w-3.5" />
                  Virtual Asíncrono
                </span>
              )}

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-neutral-300">
                Semana {effectiveWeek}
              </span>

              {parsed.sectionCode && (
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-mono text-neutral-400">
                  Sec. {parsed.sectionCode}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg md:text-xl font-black text-white leading-tight">
              {parsed.cleanTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5 text-neutral-400 hover:bg-white/15 hover:text-white transition shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
          
          {/* Card 1: Horario y Ubicación Detallada (Aula, Piso, Pabellón, Campus) */}
          <div className="rounded-2xl bg-[#18181f] p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#ff5722]" />
                Horario & Espacio Académico
              </span>

              {isRemoteZoom && event.metadata?.zoomLink && (
                <a
                  href={event.metadata.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-neutral-200 px-3.5 py-1.5 text-xs font-black text-black shadow-md transition active:scale-95"
                >
                  <Video className="h-3.5 w-3.5 text-black" />
                  <span>Unirse a Zoom</span>
                  <ExternalLink className="h-3 w-3 text-black/60" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Dia y Hora */}
              <div className="p-3 rounded-xl bg-[#121216] space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Horario</span>
                <p className="font-extrabold text-white">{dayName}</p>
                <p className="font-mono text-[11px] text-neutral-300">
                  {formatTime(event.startAt)} – {formatTime(event.finishAt)}
                </p>
              </div>

              {/* Aula y Piso */}
              <div className="p-3 rounded-xl bg-[#121216] space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">
                  {isPresencial ? 'Aula y Piso' : 'Plataforma'}
                </span>
                <p className="font-extrabold text-white">
                  {isPresencial ? location.aula : isRemoteZoom ? 'Zoom UTP' : 'Canvas LMS'}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {isPresencial ? `Piso ${location.piso}` : 'Sesión Virtual'}
                </p>
              </div>

              {/* Pabellón y Tipo */}
              <div className="p-3 rounded-xl bg-[#121216] space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">
                  {isPresencial ? 'Pabellón' : 'Modalidad'}
                </span>
                <p className="font-extrabold text-white">
                  {isPresencial ? location.pabellon : isRemoteZoom ? 'Remota en Vivo' : 'Asíncrono'}
                </p>
                <p className="text-[11px] text-neutral-400 truncate" title={location.tipo}>
                  {isPresencial ? location.tipo : '100% Digital'}
                </p>
              </div>

              {/* Campus */}
              <div className="p-3 rounded-xl bg-[#121216] space-y-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Campus</span>
                <p className="font-extrabold text-white">{location.campus}</p>
                <p className="text-[11px] text-neutral-400">
                  {courseSyllabus?.generalInfo.courseCode || 'UTP Oficial'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Contenido Oficial del Sílabo para la Semana */}
          <div className="rounded-2xl bg-[#18181f] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#3a86ff]" />
                Sílabo Oficial — Semana {effectiveWeek}
              </span>

              {courseSyllabus?.generalInfo.credits && (
                <span className="text-[11px] font-extrabold text-neutral-400">
                  {courseSyllabus.generalInfo.credits} Créditos • {courseSyllabus.generalInfo.weeklyHours}h semanales
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-[#121216] space-y-1">
                <span className="text-[10px] font-bold text-[#3a86ff] uppercase tracking-wide">
                  {syllabusWeekSession?.unit || 'Unidad de Aprendizaje'}
                </span>
                <p className="text-sm font-black text-white">
                  {syllabusWeekSession?.topic || syllabusWeekSession?.topics?.join(' • ') || 'Temario programado para la semana según sílabo oficial.'}
                </p>
              </div>

              {evaluationInWeek && (
                <div className="p-3 rounded-xl bg-[#ff5722]/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#ff5722] shrink-0" />
                    <div>
                      <span className="font-black text-[#ff7043]">{evaluationInWeek.type} ({evaluationInWeek.weightPercent}%)</span>
                      <p className="text-[11px] text-neutral-300">{evaluationInWeek.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-[#ff5722] bg-[#ff5722]/20 px-2 py-0.5 rounded-full shrink-0">
                    {evaluationInWeek.modality}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Interactive Class Syllabus AI Copilot */}
          <div className="rounded-2xl bg-[#18181f] p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#bbf451] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#bbf451]" />
                Copiloto de Clase & Sílabo IA
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">
                Conoce el sílabo, temas y rúbricas
              </span>
            </div>

            {/* Chat Messages Area */}
            <div 
              ref={chatScrollRef}
              className="max-h-60 overflow-y-auto space-y-3 p-3 rounded-xl bg-[#121216] text-xs custom-scrollbar"
            >
              {messages.map((m) => (
                <div 
                  key={m.id}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#ff5722] text-white shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`space-y-2 max-w-[85%] ${
                    m.role === 'user'
                      ? 'bg-[#ff5722] text-white rounded-2xl rounded-tr-sm p-3 font-medium'
                      : 'bg-[#1e1e24] text-neutral-200 rounded-2xl rounded-tl-sm p-3 leading-relaxed'
                  }`}>
                    <div className="whitespace-pre-line text-xs font-normal">
                      {m.content}
                    </div>

                    {/* Quick suggested action chips */}
                    {m.suggestedActions && m.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(action)}
                            className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-[#bbf451] hover:text-black px-2.5 py-1 text-[10px] font-bold text-neutral-300 transition"
                          >
                            <span>{action}</span>
                            <ChevronRight className="h-2.5 w-2.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {m.role === 'user' && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/10 text-white shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-neutral-400 py-1 pl-9">
                  <div className="h-2 w-2 rounded-full bg-[#bbf451] animate-ping" />
                  <span>Consultando sílabo y generando respuesta...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Pregunta sobre la clase de ${parsed.cleanTitle}...`}
                className="flex-1 rounded-xl bg-[#121216] px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#ff5722]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Enviar mensaje"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff5722] hover:bg-[#ff7043] text-white transition disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 bg-[#16161c] shrink-0 text-xs">
          <span className="text-neutral-500">
            UTP Horario Inteligente
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/10 hover:bg-white/20 px-4 py-1.5 font-extrabold text-white transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
