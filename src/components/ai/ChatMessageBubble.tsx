'use client';

import React from 'react';
import { ChatMessage } from '@/types/utp';
import { Bot, User, Video, ArrowRight } from 'lucide-react';

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  onSendAction: (text: string) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  msg,
  onSendAction,
}) => {
  const isAssistant = msg.role === 'assistant';

  const parseInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-[#f2e9e4]">{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e89005] hover:underline font-semibold"
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
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-sm sm:text-base font-bold text-[#f2e9e4] mt-3 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={i} className="text-xs sm:text-sm font-bold text-[#e89005] mt-2 mb-1">{line.replace('#### ', '')}</h4>;
      }
      if (line.startsWith('> [!IMPORTANT]') || line.startsWith('> [!TIP]')) {
        const isTip = line.includes('TIP');
        return (
          <div key={i} className={`my-2 p-2.5 rounded-lg text-xs leading-relaxed ${
            isTip ? 'bg-[#e89005]/15 text-[#e89005]' : 'bg-[#9b2915]/25 text-[#f5a278]'
          }`}>
            <span className="font-bold block mb-0.5">{isTip ? '💡 Consejo del Copiloto:' : '⚠️ Importante:'}</span>
          </div>
        );
      }
      if (line.startsWith('> ')) {
        return <p key={i} className="text-xs italic text-[#c7b8b0] pl-2.5 py-0.5 bg-white/5 rounded-lg my-1">{line.replace('> ', '')}</p>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={i} className="text-xs text-[#c7b8b0] ml-4 list-disc my-0.5 leading-relaxed">
            {parseInlineMarkdown(line.substring(2))}
          </li>
        );
      }
      if (line.match(/^\d+\.\s/)) {
        return (
          <div key={i} className="text-xs text-[#f2e9e4] my-1 font-medium leading-relaxed">
            {parseInlineMarkdown(line)}
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={i} className="h-1" />;
      }
      return <p key={i} className="text-xs text-[#c7b8b0] leading-relaxed my-0.5">{parseInlineMarkdown(line)}</p>;
    });
  };

  return (
    <div className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      {isAssistant && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e89005]/20 text-[#e89005] mt-0.5">
          <Bot className="h-3.5 w-3.5" />
        </div>
      )}

      <div className={`max-w-[85%] rounded-xl p-4 transition-all ${
        isAssistant
          ? 'bg-[#1c1511] text-[#f2e9e4] shadow-sm'
          : 'bg-[#9b2915] text-[#f2e9e4] shadow-md'
      }`}>
        <div className="space-y-1">
          {renderMarkdown(msg.content)}
        </div>

        {msg.contextInfo?.zoomLink && (
          <div className="mt-3 pt-2">
            <a
              href={msg.contextInfo.zoomLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#9b2915] hover:bg-[#852312] px-3 py-1.5 text-xs font-bold text-white transition"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Abrir Sala Zoom</span>
            </a>
          </div>
        )}

        {msg.suggestedActions && msg.suggestedActions.length > 0 && (
          <div className="mt-3 pt-2 flex flex-wrap gap-1.5">
            {msg.suggestedActions.map((action, aIdx) => (
              <button
                key={aIdx}
                onClick={() => onSendAction(action)}
                className="inline-flex items-center gap-1 rounded-lg bg-[#140e0b] hover:bg-[#201511] px-2.5 py-1 text-[11px] font-medium text-[#c7b8b0] hover:text-[#e89005] transition active:scale-95"
              >
                <span>{action}</span>
                <ArrowRight className="h-2.5 w-2.5 opacity-60" />
              </button>
            ))}
          </div>
        )}

        <div className={`text-[10px] mt-1.5 font-mono ${
          isAssistant ? 'text-[#8e7c74]' : 'text-white/70 text-right'
        }`}>
          {msg.timestamp}
        </div>
      </div>

      {!isAssistant && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1c1511] text-[#c7b8b0] mt-0.5">
          <User className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
};
