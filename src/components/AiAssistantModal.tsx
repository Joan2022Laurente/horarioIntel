'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UTPCurrentInterval } from '@/types/utp';
import { 
  X, 
  Send, 
  RotateCcw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { ChatMessageBubble } from '@/components/ai/ChatMessageBubble';
import { AsciiMatrixOrb } from '@/components/ai/AsciiMatrixOrb';
import { getAllCachedSyllabi, getCachedStudentProfile } from '@/lib/syllabus/client-storage';
import { useAgent } from '@/context/AgentContext';
import { 
  getClientDailyLimitStatus, 
  incrementClientDailyUsage, 
  DailyLimitStatus 
} from '@/lib/rate-limit/daily-limiter';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  interval: UTPCurrentInterval;
  initialPrompt?: string;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `¡Hola! Soy tu **Agente Académico Autónomo UTP**. Puedo guiarte en tus clases, responder dudas de rúbricas y ejecutar acciones como llevarte a tus cursos, abrir sílabos oficiales o coordinar grupos.

¿Qué deseas realizar hoy?
- "¿Qué temas tocan en mi próxima clase?"
- "Ábreme el sílabo de Desarrollo Web Integrado"
- "¿Qué evaluaciones y fórmulas tengo esta semana?"
- "¿Cómo asegurar 20 en la PC1?"`,
  timestamp: 'Ahora',
  suggestedActions: [
    '¿Qué temas tocan esta semana?',
    'Ábreme el sílabo de mi próximo curso',
    'Fórmulas y reglas de evaluación',
    'Estrategia de estudio para sacar 20'
  ]
};

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  interval,
  initialPrompt,
}) => {
  const { getLiveContext, executeAction, setLastCourseInFocus } = useAgent();
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const [quota, setQuota] = useState<DailyLimitStatus>(() => {
    const student = getCachedStudentProfile();
    return getClientDailyLimitStatus(student?.userId || student?.email);
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      const student = getCachedStudentProfile();
      setQuota(getClientDailyLimitStatus(student?.userId || student?.email));
      setTimeout(() => inputRef.current?.focus(), 150);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const studentProfile = getCachedStudentProfile();
    const currentQuota = getClientDailyLimitStatus(studentProfile?.userId || studentProfile?.email);

    // 1. Verificación en cliente de cuota diaria (6 mensajes/día)
    if (!currentQuota.isUnlimited && currentQuota.remaining <= 0) {
      const limitMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `⚠️ **Has alcanzado el límite diario de 6 consultas durante la fase de pruebas.**\n\nTu cuota se reiniciará automáticamente a las 00:00. Mientras tanto, puedes explorar libremente tus pestañas de **Horario**, **Sílabos**, **Networking** y **Mercado Académico**.`,
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, limitMsg]);
      return;
    }

    setLastUserPrompt(query);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const allSyllabi = getAllCachedSyllabi();
      const liveContext = getLiveContext();

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          userId: studentProfile?.userId || studentProfile?.email,
          studentProfile,
          calendarData: interval ? { data: { current_interval: interval } } : undefined,
          syllabiData: allSyllabi,
          liveContext,
        }),
      });

      const resData = await response.json();

      // Manejo de Rate Limit desde el servidor (HTTP 429)
      if (response.status === 429 || resData.rateLimitReached) {
        setQuota(prev => ({ ...prev, remaining: 0, used: prev.limit }));
        const limitMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ ${resData.error || 'Has completado tus 6 consultas de prueba por hoy. Tu cuota se reiniciará a medianoche.'}`,
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, limitMsg]);
        return;
      }

      if (resData.success && resData.data) {
        // Consumir cuota localmente tras respuesta exitosa
        const nextQuota = incrementClientDailyUsage(studentProfile?.userId || studentProfile?.email);
        setQuota(nextQuota);

        // Ejecutar acción si el agente determinó una tool call
        if (resData.data.action) {
          executeAction(resData.data.action);
          if (resData.data.action.type === 'OPEN_SYLLABUS' && resData.data.action.payload?.courseName) {
            setLastCourseInFocus(resData.data.action.payload.courseName);
          }
        }

        if (resData.data.contextInfo?.courseName) {
          setLastCourseInFocus(resData.data.contextInfo.courseName);
        }

        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: resData.data.answer,
          suggestedActions: resData.data.suggestedActions,
          contextInfo: resData.data.contextInfo,
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, assistantMsg]);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'No pude conectar con el servicio en este momento. Por favor verifica tu conexión.',
        timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastUserPrompt) {
      handleSend(lastUserPrompt);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-2xl h-[90vh] sm:h-[85vh] rounded-3xl bg-[var(--surface-card)] shadow-none overflow-hidden text-white border border-[var(--border-strong)]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[var(--surface-card)] border-b border-[var(--border-subtle)] gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <AsciiMatrixOrb size={32} state={isLoading ? 'thinking' : 'idle'} colorMode="monochrome" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">Agente Académico UTP</h3>
              <p className="text-[11px] text-neutral-400 truncate">
                Semana {interval.week_number || 5} de {interval.total_weeks || 18} • {interval.period_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Badge de Cuota de Consultas (No expone ningún código privado de usuario) */}
            {quota.isUnlimited ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Sparkles className="h-3 w-3" />
                <span>Acceso Ilimitado</span>
              </span>
            ) : (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2.5 py-1 rounded-full ${
                quota.remaining > 0 
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}>
                <span>{quota.remaining > 0 ? `⚡ ${quota.remaining}/${quota.limit} consultas hoy` : '🚫 Cuota agotada hoy'}</span>
              </span>
            )}

            <button
              onClick={() => setMessages([DEFAULT_WELCOME_MESSAGE])}
              title="Reiniciar conversación"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] text-neutral-400 hover:text-white transition shadow-none"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] text-neutral-400 hover:text-white transition shadow-none"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mensajes Area */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              msg={msg}
              onSendAction={handleSend}
              onRetry={handleRetry}
            />
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-neutral-300 py-3 animate-in fade-in select-none">
              <AsciiMatrixOrb size={26} state="thinking" colorMode="monochrome" />
              <div className="flex flex-col">
                <span className="font-semibold text-white">Razonando y procesando acciones...</span>
                <span className="text-[10px] text-neutral-400">Consultando sílabo oficial, rúbricas y cronograma UTP</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[var(--surface-card)] border-t border-[var(--border-subtle)] shrink-0 space-y-2">
          {!quota.isUnlimited && quota.remaining <= 0 && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-500/20 px-3.5 py-2 rounded-xl">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Has completado tus 6 consultas de prueba diarias. Tu cuota se reinicia automáticamente a las 00:00.</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-2xl px-4 py-1.5 focus-within:border-[var(--accent-orange)]"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              disabled={!quota.isUnlimited && quota.remaining <= 0}
              onChange={(e) => setInput(e.target.value)}
              placeholder={!quota.isUnlimited && quota.remaining <= 0 ? "Límite diario de prueba alcanzado (6/6). Vuelve mañana..." : "Pregunta sobre temas de clase, pide abrir un sílabo o cambiar de vista..."}
              className="flex-1 bg-transparent py-2 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none disabled:opacity-40"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || (!quota.isUnlimited && quota.remaining <= 0)}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white transition disabled:opacity-30 disabled:pointer-events-none active:scale-95 shrink-0 shadow-none"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
