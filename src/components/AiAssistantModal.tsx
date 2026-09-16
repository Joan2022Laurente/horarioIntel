'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UTPCurrentInterval } from '@/types/utp';
import { 
  X, 
  Send, 
  Sparkles, 
  RotateCcw
} from 'lucide-react';
import { ChatMessageBubble } from '@/components/ai/ChatMessageBubble';
import { AsciiMatrixOrb } from '@/components/ai/AsciiMatrixOrb';
import { getAllCachedSyllabi } from '@/lib/syllabus/client-storage';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  interval: UTPCurrentInterval;
  initialPrompt?: string;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `¡Hola! Soy tu **Copiloto Académico UTP**. Conozco tus asignaturas, los enlaces directos a Zoom, el calendario del ciclo y los **sílabos oficiales con sus rúbricas y criterios de evaluación**.

¿En qué te puedo asesorar hoy?
- "¿Qué temas tocan en mi próxima clase?"
- "¿Cuáles son las evaluaciones y rúbricas de la semana actual?"
- "¿Qué recomiendas en concreto estudiar para el examen?"
- "¿Cómo estructurar el entregable para sacar la máxima nota?"`,
  timestamp: 'Ahora',
  suggestedActions: [
    '¿Qué temas tocan esta semana en mis cursos?',
    '¿Qué recomiendas en concreto estudiar?',
    '¿Cuáles son las reglas y fórmulas de evaluación?',
    'Estrategia de estudio para sacar 20'
  ]
};

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  interval,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
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

    if (query.toLowerCase() === '/piensa' || query.toLowerCase().startsWith('/piensa')) {
      // Simulación de prueba: pensar durante 10 segundos y luego volver a reposo
      setTimeout(() => {
        const simMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '⚡ **Simulación de pensamiento completada (10s)**.\n\nEl avatar orbital 3D ejecutó la transición harmónica con ondas matriciales y retornó al estado inactivo de forma fluida.',
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, simMsg]);
        setIsLoading(false);
      }, 10000);
      return;
    }

    try {
      const allSyllabi = getAllCachedSyllabi();
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          calendarData: interval ? { data: { current_interval: interval } } : undefined,
          syllabiData: allSyllabi,
        }),
      });


      const resData = await response.json();

      if (resData.success && resData.data) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-2xl h-[90vh] sm:h-[85vh] rounded-3xl bg-[#111114] shadow-2xl overflow-hidden text-white border border-white/5">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#16161a] border-b border-white/5">
          <div className="flex items-center gap-3">
            <AsciiMatrixOrb size={32} state={isLoading ? 'thinking' : 'idle'} colorMode="monochrome" />
            <div>
              <h3 className="text-sm font-bold text-white">Copiloto Académico UTP</h3>
              <p className="text-[11px] text-neutral-400">
                Semana {interval.week_number || 5} de {interval.total_weeks || 18} • {interval.period_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setMessages([DEFAULT_WELCOME_MESSAGE])}
              title="Reiniciar conversación"
              className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:bg-white/10 hover:text-white transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-neutral-400 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mensajes Area: Open Canvas Style */}
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
                <span className="font-semibold text-white">Razonando respuesta académica...</span>
                <span className="text-[10px] text-neutral-400">Consultando sílabo oficial, rúbricas y cronograma UTP</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#141418] border-t border-white/5 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-[#1b1b22] rounded-2xl px-4 py-1.5 focus-within:ring-1 focus-within:ring-[#ff5722]"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre temas de clase, rúbricas o cómo asegurar 20..."
              className="flex-1 bg-transparent py-2 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff5722] hover:bg-[#ff7043] text-white transition disabled:opacity-30 disabled:pointer-events-none active:scale-95 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
