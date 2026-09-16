'use client';

import React, { useState } from 'react';
import { ChatMessage } from '@/types/utp';
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

  const parseInlineMarkdown = (text: string) => {
    // Matches **bold**, `code`, [link](url)
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-xs text-[#bbf451]">
            {part.slice(1, -1)}
          </code>
        );
      }
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3a86ff] hover:underline font-semibold"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return part;
    });
  };

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={i} className="text-sm sm:text-base font-bold text-white mt-3 mb-1.5 tracking-tight">
            {trimmed.replace('### ', '')}
          </h4>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={i} className="text-base font-extrabold text-white mt-4 mb-2 tracking-tight">
            {trimmed.replace('## ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300 my-1 leading-relaxed pl-2">
            <span className="text-[#bbf451] font-bold mt-0.5">•</span>
            <span className="flex-1">{parseInlineMarkdown(trimmed.substring(2))}</span>
          </div>
        );
      }
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300 my-1.5 leading-relaxed pl-1">
            <span className="font-mono font-bold text-neutral-400 shrink-0 text-xs mt-0.5">
              {numMatch[1]}.
            </span>
            <span className="flex-1">{parseInlineMarkdown(numMatch[2])}</span>
          </div>
        );
      }
      if (trimmed === '') {
        return <div key={i} className="h-2" />;
      }
      return (
        <p key={i} className="text-xs sm:text-sm text-neutral-200 leading-relaxed my-1">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
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

  // Mensaje del Asistente: Abierto en el canvas (Zero Card-ception)
  return (
    <div className="flex flex-col gap-2 my-4 text-neutral-200 animate-in fade-in duration-150">
      
      {/* Contenido sin card envolvente */}
      <div className="space-y-1">
        {renderMarkdown(msg.content)}
      </div>

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

      {/* Barra de herramientas: Copiar, Reintentar (Solo para respuestas reales generadas, NO para el aviso/bienvenida inicial) */}
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
