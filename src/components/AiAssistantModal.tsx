'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UTPCurrentInterval } from '@/types/utp';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { ChatMessageBubble } from '@/components/ai/ChatMessageBubble';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  interval: UTPCurrentInterval;
  initialPrompt?: string;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `¡Hola! Soy tu **Copiloto Académico UTP**. Conozco tus 6 asignaturas, los enlaces directos a Zoom, el calendario de 18 semanas y el **sílabo oficial con sus rúbricas y criterios de evaluación**.

¿En qué te puedo asesorar hoy?
- "¿Qué temas tocan en mi próxima clase?"
- "¿Cuáles son las evaluaciones y rúbricas de la Semana 5?"
- "¿Cómo estructurar el 1er entregable APF1 de Desarrollo Web Integrado?"
- "¿Cómo formular la ecuación PICO y no pasar el 20% de similitud en Investigación?"`,
  timestamp: 'Ahora',
  suggestedActions: [
    '¿Qué temas tocan esta semana en mis cursos?',
    'Explícame la rúbrica de APF1 de Desarrollo Web Integrado',
    '¿Cuáles son las reglas y fórmula de Formación para la Investigación?',
    'Estrategia de estudio para sacar 20 en la Semana 5'
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
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative flex flex-col w-full max-w-2xl h-[90vh] sm:h-[85vh] rounded-2xl bg-[#140e0b] shadow-2xl overflow-hidden text-[#f2e9e4]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1c1511]">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e89005] text-[#140e0b] font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#f2e9e4]">Copiloto Académico UTP</h3>
                <Badge variant="orange">Claude Engine</Badge>
              </div>
              <p className="text-[11px] text-[#8e7c74]">
                Semana {interval.week_number || 4} de {interval.total_weeks || 18} • {interval.period_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setMessages([messages[0]])}
              title="Reiniciar conversación"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8e7c74] hover:bg-white/10 hover:text-white transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8e7c74] hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mensajes Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              msg={msg}
              onSendAction={handleSend}
            />
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e89005]/20 text-[#e89005]">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-xl bg-[#1c1511] px-4 py-3 text-xs text-[#8e7c74] flex items-center gap-2 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#e89005] animate-spin" />
                <span>Analizando calendario y sílabos oficiales UTP...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3.5 sm:p-4 bg-[#1c1511]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre temas de clase, rúbricas o cómo asegurar 20..."
              className="flex-1 rounded-xl bg-[#140e0b] px-4 py-2.5 text-xs sm:text-sm text-[#f2e9e4] placeholder-[#8e7c74] focus:ring-1 focus:ring-[#e89005] focus:outline-none shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e89005] text-[#140e0b] font-bold shadow transition hover:bg-[#c97b04] disabled:opacity-40 disabled:pointer-events-none active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
