'use client';

import React, { useState, useEffect, useRef } from 'react';
import { UTPEvent, UTPCurrentInterval, ChatMessage } from '@/types/utp';
import { parseEventTitle, formatTime, parseDate, DAYS_OF_WEEK } from '@/lib/schedule-parser';
import { getSyllabusForCourse } from '@/lib/syllabus/official-registry';
import { getClassroomLocation } from '@/lib/classroom-helper';
import { ChatMessageBubble } from '@/components/ai/ChatMessageBubble';
import { 
  X, 
  Video, 
  MapPin, 
  Radio, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Send, 
  Award,
  ExternalLink
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
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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
        content: `Para **${parsed.cleanTitle}** en la **Semana ${effectiveWeek}**, el temario se centra en: **${topic}**.\n\nTe recomiendo repasar las lecturas y guías de laboratorio disponibles en Canvas y preparar tus consultas para el docente durante la sesión.`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#111114] text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clean Minimal Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 bg-[#16161a] border-b border-white/5 shrink-0">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {isPresencial ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00e676] bg-[#00c853]/15 px-3 py-0.5 rounded-full">
                  <MapPin className="h-3 w-3" />
                  Presencial
                </span>
              ) : isRemoteZoom ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff7043] bg-[#ff5722]/15 px-3 py-0.5 rounded-full">
                  <Video className="h-3 w-3" />
                  Zoom
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9195ff] bg-[#7075ff]/15 px-3 py-0.5 rounded-full">
                  <Radio className="h-3 w-3" />
                  Virtual
                </span>
              )}

              <span className="text-xs font-medium text-neutral-400">
                Semana {effectiveWeek}
              </span>

              {parsed.sectionCode && (
                <span className="text-xs font-mono text-neutral-500">
                  • Sec. {parsed.sectionCode}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
              {parsed.cleanTitle}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
          
          {/* Ficha de Ubicación y Horario */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-[#16161b] space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Horario</span>
              <p className="font-bold text-white">{dayName}</p>
              <p className="font-mono text-[11px] text-neutral-400">
                {formatTime(event.startAt)} – {formatTime(event.finishAt)}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#16161b] space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                {isPresencial ? 'Aula y Piso' : 'Plataforma'}
              </span>
              <p className="font-bold text-white">
                {isPresencial ? location.aula : isRemoteZoom ? 'Zoom UTP' : 'Canvas LMS'}
              </p>
              <p className="text-[11px] text-neutral-400">
                {isPresencial ? `Piso ${location.piso}` : 'Sesión Virtual'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#16161b] space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                {isPresencial ? 'Pabellón' : 'Modalidad'}
              </span>
              <p className="font-bold text-white">
                {isPresencial ? location.pabellon : isRemoteZoom ? 'Remota en Vivo' : 'Asíncrono'}
              </p>
              <p className="text-[11px] text-neutral-400 truncate" title={location.tipo}>
                {isPresencial ? location.tipo : 'Digital'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#16161b] space-y-0.5">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold">Campus</span>
              <p className="font-bold text-white">{location.campus}</p>
              <p className="text-[11px] text-neutral-400 font-mono">
                {courseSyllabus?.generalInfo.courseCode || 'UTP'}
              </p>
            </div>
          </div>

          {/* Botón directo a Zoom si es remoto */}
          {isRemoteZoom && event.metadata?.zoomLink && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#16161b]">
              <div className="flex items-center gap-2 text-xs">
                <Video className="h-4 w-4 text-[#ff7043]" />
                <span className="text-neutral-300 font-medium">Clase remota en vivo programada por Zoom</span>
              </div>
              <a
                href={event.metadata.zoomLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-neutral-200 px-4 py-2 text-xs font-bold text-black shadow transition active:scale-95"
              >
                <span>Entrar a Zoom</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Divisor sutil hacia la conversación */}
          <div className="pt-2 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#bbf451]" />
                Copiloto de Clase & Sílabo
              </span>
              <span className="text-[11px] text-neutral-500">
                Semana {effectiveWeek} • {syllabusWeekSession?.unit || 'Sílabo Oficial'}
              </span>
            </div>

            {/* Chat Area: Open Canvas Style (Zero Card-ception!) */}
            <div 
              ref={chatScrollRef}
              className="space-y-4 pt-1 max-h-72 overflow-y-auto custom-scrollbar pr-1"
            >
              {messages.map((m) => (
                <ChatMessageBubble
                  key={m.id}
                  msg={m}
                  onSendAction={handleSendMessage}
                  onRetry={handleRetry}
                />
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-neutral-400 py-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#bbf451] animate-ping" />
                  <span>Consultando sílabo oficial...</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Floating Input Area */}
        <div className="p-4 bg-[#141418] border-t border-white/5 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-[#1b1b22] rounded-2xl px-4 py-1.5 focus-within:ring-1 focus-within:ring-[#ff5722]"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Pregunta sobre la clase de ${parsed.cleanTitle}...`}
              className="flex-1 bg-transparent py-2 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none"
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
