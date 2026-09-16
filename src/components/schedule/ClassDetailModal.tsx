'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UTPEvent, UTPCurrentInterval, ChatMessage } from '@/types/utp';
import { parseEventTitle, formatTime, parseDate, DAYS_OF_WEEK } from '@/lib/schedule-parser';
import { getSyllabusForCourse } from '@/lib/syllabus/official-registry';
import { getClassroomLocation } from '@/lib/classroom-helper';
import { ChatMessageBubble } from '@/components/ai/ChatMessageBubble';
import { AsciiMatrixOrb } from '@/components/ai/AsciiMatrixOrb';
import { 
  X, 
  Video, 
  MapPin, 
  Radio, 
  Send, 
  ExternalLink,
  Sparkles,
  BookOpen
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
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsed = event ? parseEventTitle(event.title) : { cleanTitle: '', sectionCode: '', weekInTitle: weekNumber };
  const effectiveWeek = parsed.weekInTitle || weekNumber;
  const courseSyllabus = event ? getSyllabusForCourse(parsed.cleanTitle) : null;
  
  const syllabusWeekSession = courseSyllabus?.weeklySchedule.find(s => s.week === effectiveWeek) || null;
  const evaluationInWeek = courseSyllabus?.evaluations.find(e => e.week === effectiveWeek) || null;

  const isRemoteZoom = event?.modality === 'R';
  const isPresencial = event?.modality === 'P';

  const location = getClassroomLocation(parsed.cleanTitle, parsed.sectionCode);
  const eventDate = event ? parseDate(event.startAt) : new Date();
  const dayName = DAYS_OF_WEEK[eventDate.getDay()] || 'Lunes';

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
      }\n¿En qué te ayudo para esta sesión?`,
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

  // Auto-scroll del chat al final cuando cambian los mensajes
  useEffect(() => {
    if (messages.length > 1) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isLoading]);

  if (!isOpen || !event) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setLastUserPrompt(text);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    if (text.toLowerCase() === '/piensa' || text.toLowerCase().startsWith('/piensa')) {
      // Simulación de prueba: pensar durante 10 segundos
      setTimeout(() => {
        const simMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚡ **Simulación de pensamiento completada (10s)** para **${parsed.cleanTitle}** (Semana ${effectiveWeek}). Las ondas 3D y la matriz de micro-números operaron a 60 FPS.`,
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, simMsg]);
        setIsLoading(false);
      }, 10000);
      return;
    }

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
      const topic = syllabusWeekSession?.topic || 'los temas oficiales del sílabo';
      const fallbackReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Para **${parsed.cleanTitle}** en la **Semana ${effectiveWeek}**, el temario se centra en: **${topic}**.\n\nTe recomiendo repasar las lecturas y guías de laboratorio disponibles en Canvas.`,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastUserPrompt) {
      handleSendMessage(lastUserPrompt);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative flex flex-col w-full max-w-2xl h-[90vh] sm:h-[85vh] rounded-3xl bg-[#111114] text-white shadow-2xl overflow-hidden border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Superior Estable */}
        <div className="bg-[#16161a] px-4 sm:px-6 py-3.5 border-b border-white/5 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {isPresencial ? (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#00e676] bg-[#00c853]/15 px-2 py-0.5 rounded-full shrink-0">
                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    Presencial
                  </span>
                ) : isRemoteZoom ? (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#ff7043] bg-[#ff5722]/15 px-2 py-0.5 rounded-full shrink-0">
                    <Video className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    Zoom
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-[#9195ff] bg-[#7075ff]/15 px-2 py-0.5 rounded-full shrink-0">
                    <Radio className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    Virtual
                  </span>
                )}

                <span className="text-xs font-medium text-neutral-400 whitespace-nowrap">
                  Semana {effectiveWeek}
                </span>
              </div>

              <h2 className="font-bold text-white text-sm sm:text-base truncate">
                {parsed.cleanTitle}
              </h2>
            </div>

            {/* Controles */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onClose}
                aria-label="Cerrar modal"
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenedor con Scroll Estable de la Conversación */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-4 space-y-4">
          
          {/* Ficha compacta de Ubicación y Horario */}
          <div className="space-y-3 pb-2 border-b border-white/5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#16161b] space-y-0.5">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Horario</span>
                <p className="font-bold text-white text-xs">{dayName}</p>
                <p className="font-mono text-[11px] text-neutral-400">
                  {formatTime(event.startAt)} – {formatTime(event.finishAt)}
                </p>
              </div>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#16161b] space-y-0.5">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                  {isPresencial ? 'Aula y Piso' : 'Plataforma'}
                </span>
                <p className="font-bold text-white text-xs">
                  {isPresencial ? location.aula : isRemoteZoom ? 'Zoom UTP' : 'Canvas LMS'}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {isPresencial ? `Piso ${location.piso}` : 'Sesión Virtual'}
                </p>
              </div>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#16161b] space-y-0.5">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                  {isPresencial ? 'Pabellón' : 'Modalidad'}
                </span>
                <p className="font-bold text-white text-xs">
                  {isPresencial ? location.pabellon : isRemoteZoom ? 'Remota en Vivo' : 'Asíncrono'}
                </p>
                <p className="text-[11px] text-neutral-400 truncate" title={location.tipo}>
                  {isPresencial ? location.tipo : 'Digital'}
                </p>
              </div>

              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#16161b] space-y-0.5">
                <span className="text-[10px] text-neutral-500 uppercase font-semibold">Sección</span>
                <p className="font-bold text-white text-xs">{location.campus}</p>
                <p className="text-[11px] text-neutral-400 font-mono">
                  {parsed.sectionCode ? `Sec. ${parsed.sectionCode}` : 'Oficial'}
                </p>
              </div>
            </div>

            {/* Botón Zoom directo si aplica */}
            {isRemoteZoom && event.metadata?.zoomLink && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#16161b]">
                <div className="flex items-center gap-2 text-xs">
                  <Video className="h-4 w-4 text-[#ff7043]" />
                  <span className="text-neutral-300 font-medium">Clase remota en vivo por Zoom</span>
                </div>
                <a
                  href={event.metadata.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-neutral-200 px-3.5 py-1.5 text-xs font-bold text-black shadow transition active:scale-95"
                >
                  <span>Entrar a Zoom</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>

          {/* Conversación IA */}
          <div className="space-y-4 pt-1">
            {messages.map((m) => (
              <ChatMessageBubble
                key={m.id}
                msg={m}
                onSendAction={handleSendMessage}
                onRetry={handleRetry}
              />
            ))}

            {isLoading && (
              <div className="flex items-center gap-3 text-xs text-neutral-300 py-3 animate-in fade-in select-none">
                <AsciiMatrixOrb size={26} state="thinking" colorMode="monochrome" />
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Consultando sílabo oficial y razonando...</span>
                  <span className="text-[10px] text-neutral-400">Analizando rúbricas, fórmulas y temario de clase</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

        </div>

        {/* Input Bar Inferior */}
        <div className="border-t border-white/5 bg-[#141418] p-3 sm:p-4 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-[#1b1b22] rounded-2xl px-3.5 sm:px-4 py-1.5 sm:py-2 focus-within:ring-1 focus-within:ring-[#ff5722]"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Pregunta sobre ${parsed.cleanTitle}...`}
              className="flex-1 bg-transparent py-1.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              aria-label="Enviar mensaje"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff5722] hover:bg-[#ff7043] text-white transition disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
