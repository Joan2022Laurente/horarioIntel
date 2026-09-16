'use client';

import React, { useState } from 'react';
import { ChatMessage } from '@/types/utp';
import { MarkdownRenderer } from '@/components/ai/MarkdownRenderer';
import { AsciiMatrixOrb } from '@/components/ai/AsciiMatrixOrb';
import { Copy, Check, RotateCcw, ChevronRight, Video } from 'lucide-react';

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  onSendAction: (text: string) => void;
  onRetry?: () => void;
  isLastAssistant?: boolean;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  msg,
  onSendAction,
  onRetry,
}) => {
  const isAssistant = msg.role === 'assistant';
  const isWelcome = msg.id === 'welcome' || msg.id === 'init-class-ai' || msg.id.startsWith('init-');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Error al copiar:', e);
    }
  };

  // Mensaje del Usuario: Burbuja en el lado derecho estilo Claude/Gemini
  if (!isAssistant) {
    return (
      <div className="flex flex-col items-end gap-1.5 my-3">
        <div className="rounded-3xl bg-[#22222a] text-white px-4 py-2.5 max-w-[85%] text-xs sm:text-sm font-medium shadow-sm">
          {msg.content}
        </div>
        <div className="flex items-center gap-2 pr-2 text-neutral-500 text-[10px]">
          <button
            onClick={handleCopy}
            title="Copiar texto"
            className="hover:text-white transition flex items-center gap-1"
          >
            {copied ? <Check className="h-3 w-3 text-[#bbf451]" /> : <Copy className="h-3 w-3" />}
          </button>
          <span>{msg.timestamp}</span>
        </div>
      </div>
    );
  }

  // Mensaje del Asistente: Abierto en el canvas con MarkdownRenderer completo y avatar orbital
  return (
    <div className="flex flex-col gap-2.5 my-4 text-neutral-200 animate-in fade-in duration-150">
      
      {/* Cabecera sutil del Asistente */}
      <div className="flex items-center gap-2 select-none">
        <AsciiMatrixOrb size={26} state="idle" colorMode="monochrome" />
        <span className="text-[11px] font-bold text-neutral-400">Copiloto UTP</span>
      </div>

      {/* Contenido sin card envolvente */}
      <MarkdownRenderer content={msg.content} />

      {/* Enlace a Zoom si aplica */}
      {msg.contextInfo?.zoomLink && (
        <div className="mt-2">
          <a
            href={msg.contextInfo.zoomLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-neutral-200 text-black px-4 py-2 text-xs font-bold transition shadow"
          >
            <Video className="h-4 w-4" />
            <span>Unirse a Zoom</span>
          </a>
        </div>
      )}

      {/* Chips sugeridos de inicio o acción rápida */}
      {msg.suggestedActions && msg.suggestedActions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {msg.suggestedActions.map((action, aIdx) => (
            <button
              key={aIdx}
              onClick={() => onSendAction(action)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#18181f] hover:bg-white hover:text-black px-3.5 py-1.5 text-xs font-medium text-neutral-300 transition-all shadow-sm active:scale-95"
            >
              <span>{action}</span>
              <ChevronRight className="h-3 w-3 opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* Barra de herramientas: Copiar, Reintentar (Solo para respuestas reales generadas) */}
      {!isWelcome && (
        <div className="flex items-center gap-3 pt-1 text-neutral-500 text-xs">
          <button
            onClick={handleCopy}
            title="Copiar respuesta"
            className="hover:text-white transition flex items-center gap-1 text-[11px]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#bbf451]" />
                <span className="text-[#bbf451]">Copiado</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar</span>
              </>
            )}
          </button>

          {onRetry && (
            <button
              onClick={onRetry}
              title="Reintentar respuesta"
              className="hover:text-white transition flex items-center gap-1 text-[11px]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reintentar</span>
            </button>
          )}

          <span className="text-[10px] text-neutral-600 font-mono ml-auto">
            {msg.timestamp}
          </span>
        </div>
      )}

    </div>
  );
};
