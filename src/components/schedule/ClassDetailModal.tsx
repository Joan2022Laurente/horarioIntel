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
  Sparkles, 
  Send, 
  ExternalLink,
  ChevronDown,
  Minimize2,
  Maximize2,
  ArrowUp
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
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScrollTopRef = useRef<number>(0);
  const isProgrammaticScrollRef = useRef<boolean>(false);

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
    setIsChatExpanded(false);

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

  // Auto-scroll del chat al final cuando se envían mensajes
  useEffect(() => {
    if (chatBottomRef.current && isChatExpanded) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isChatExpanded]);

  if (!isOpen || !event) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    // Al enviar el mensaje, transformar inmediatamente a vista completa expandida (deja de ser modal)
    setIsChatExpanded(true);
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

  // Restaurar datos de clase y volver a modo modal
  const handleRestoreToModal = () => {
    isProgrammaticScrollRef.current = true;
    setIsChatExpanded(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 500);
  };

  // Sensor de scroll bidireccional inteligente
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScrollRef.current) return;

    const currentScrollTop = e.currentTarget.scrollTop;
    const isScrollingDown = currentScrollTop > lastScrollTopRef.current;
    const isScrollingUp = currentScrollTop < lastScrollTopRef.current;

    // Scroll hacia abajo con mensajes activos -> expande a pantalla completa (deja de verse como modal)
    if (!isChatExpanded && isScrollingDown && currentScrollTop > 30 && messages.length > 1) {
      setIsChatExpanded(true);
    }

    // Scroll hacia arriba al tope -> regresa al modo modal con la ficha de clase
    if (isChatExpanded && isScrollingUp && currentScrollTop <= 15) {
      setIsChatExpanded(false);
    }

    lastScrollTopRef.current = currentScrollTop;
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isChatExpanded 
          ? 'p-0 bg-[#0a0a0c]' 
          : 'p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isChatExpanded) {
          onClose();
        }
      }}
    >
      <div 
        className={`relative flex flex-col transition-all duration-300 ease-out overflow-hidden ${
          isChatExpanded 
            ? 'w-full h-full rounded-none bg-[#0a0a0c] shadow-none' 
            : 'w-full max-w-3xl h-[82vh] sm:h-[85vh] rounded-3xl bg-[#111114] text-white shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Superior Dinámico */}
        <div className={`transition-all duration-300 border-b border-white/5 shrink-0 ${
          isChatExpanded 
            ? 'bg-[#121216] px-4 sm:px-8 py-3' 
            : 'bg-[#16161a] px-6 py-4'
        }`}>
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                {isPresencial ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00e676] bg-[#00c853]/15 px-2.5 py-0.5 rounded-full">
                    <MapPin className="h-3 w-3" />
                    Presencial
                  </span>
                ) : isRemoteZoom ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ff7043] bg-[#ff5722]/15 px-2.5 py-0.5 rounded-full">
                    <Video className="h-3 w-3" />
                    Zoom
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#9195ff] bg-[#7075ff]/15 px-2.5 py-0.5 rounded-full">
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

              <h2 className={`font-bold text-white truncate transition-all ${
                isChatExpanded ? 'text-xs sm:text-sm text-neutral-300 max-w-[500px]' : 'text-base sm:text-lg'
              }`}>
                {parsed.cleanTitle}
              </h2>
            </div>

            {/* Controles: Ver datos de clase / Minimizar / Cerrar */}
            <div className="flex items-center gap-2 shrink-0">
              {isChatExpanded ? (
                <button
                  onClick={handleRestoreToModal}
                  title="Volver a modo modal y ver datos de clase"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white hover:text-black px-3.5 py-1.5 text-xs font-bold text-white transition active:scale-95 shadow-sm"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>Ver datos de clase</span>
                </button>
              ) : (
                messages.length > 1 && (
                  <button
                    onClick={() => setIsChatExpanded(true)}
                    title="Expandir a pantalla completa"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/15 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white transition"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Pantalla completa</span>
                  </button>
                )
              )}

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

        {/* Barra Flotante de Retorno en Modo Pantalla Completa */}
        {isChatExpanded && (
          <div 
            onClick={handleRestoreToModal}
            className="w-full bg-[#141418]/90 hover:bg-[#18181f] text-neutral-400 hover:text-neutral-200 text-xs py-1.5 text-center cursor-pointer transition flex items-center justify-center gap-2 border-b border-white/5 select-none"
          >
            <ArrowUp className="h-3 w-3 animate-bounce" />
            <span>Desliza hacia arriba o haz clic aquí para volver a ver aula, piso y horario</span>
          </div>
        )}

        {/* Contenedor con Scroll de la Conversación */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto custom-scrollbar transition-all ${
            isChatExpanded ? 'px-4 sm:px-8 py-6' : 'px-6 py-4'
          }`}
        >
          <div className="max-w-4xl mx-auto w-full space-y-4">
            
            {/* Ficha de Ubicación y Horario (Oculta suavemente en modo pantalla completa) */}
            <div className={`transition-all duration-300 ease-in-out ${
              isChatExpanded 
                ? '-translate-y-4 opacity-0 max-h-0 overflow-hidden pointer-events-none -my-2' 
                : 'translate-y-0 opacity-100 max-h-[500px]'
            }`}>
              <div className="space-y-3 pb-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#16161b] space-y-0.5">
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">Horario</span>
                    <p className="font-bold text-white">{dayName}</p>
                    <p className="font-mono text-[11px] text-neutral-400">
                      {formatTime(event.startAt)} – {formatTime(event.finishAt)}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#16161b] space-y-0.5">
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

                  <div className="p-3.5 rounded-2xl bg-[#16161b] space-y-0.5">
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

                  <div className="p-3.5 rounded-2xl bg-[#16161b] space-y-0.5">
                    <span className="text-[10px] text-neutral-500 uppercase font-semibold">Campus</span>
                    <p className="font-bold text-white">{location.campus}</p>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      {courseSyllabus?.generalInfo.courseCode || 'UTP'}
                    </p>
                  </div>
                </div>

                {/* Botón Zoom directo */}
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
              </div>
            </div>

            {/* Conversación IA: Renderizado Editorial Limpio con Markdown */}
            <div className={`${!isChatExpanded ? 'pt-2 border-t border-white/5' : ''}`}>
              {!isChatExpanded && (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#bbf451]" />
                    Copiloto de Clase & Sílabo
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Semana {effectiveWeek} • {syllabusWeekSession?.unit || 'Sílabo Oficial'}
                  </span>
                </div>
              )}

              {/* Mensajes */}
              <div className="space-y-4">
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
                    <span>Consultando sílabo oficial y respondiendo...</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>
            </div>

          </div>
        </div>

        {/* Input Bar Inferior */}
        <div className={`border-t border-white/5 shrink-0 ${
          isChatExpanded 
            ? 'bg-[#121216] px-4 sm:px-8 py-3.5' 
            : 'bg-[#141418] p-4'
        }`}>
          <div className="max-w-4xl mx-auto w-full">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-[#1b1b22] rounded-2xl px-4 py-2 focus-within:ring-1 focus-within:ring-[#ff5722]"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Pregunta sobre la clase de ${parsed.cleanTitle}...`}
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
    </div>
  );
};
