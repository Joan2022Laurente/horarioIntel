'use client';

import React from 'react';
import { CleanDeliverableItem } from '@/lib/tasks/instruction-cleaner';
import { 
  FileText, 
  Presentation, 
  Video, 
  Code2, 
  ExternalLink, 
  CheckCircle2, 
  Paperclip 
} from 'lucide-react';

interface DeliverableChipsListProps {
  items: CleanDeliverableItem[];
  title?: string;
}

export const DeliverableChipsList: React.FC<DeliverableChipsListProps> = ({
  items,
  title = 'Entregables Requeridos'
}) => {
  if (items.length === 0) return null;

  const getItemBadge = (item: CleanDeliverableItem) => {
    switch (item.type) {
      case 'slides':
        return {
          icon: <Presentation className="h-4 w-4 text-[#3a86ff] shrink-0" />,
          bg: 'bg-[#3a86ff]/15 text-[#60a5fa]',
          tag: 'Diapositivas PPTX'
        };
      case 'doc':
        return {
          icon: <FileText className="h-4 w-4 text-[#ff5722] shrink-0" />,
          bg: 'bg-[#ff5722]/15 text-[#ff7043]',
          tag: 'Documento / Informe'
        };
      case 'video':
        return {
          icon: <Video className="h-4 w-4 text-[#e63946] shrink-0" />,
          bg: 'bg-[#e63946]/15 text-[#ff6b6b]',
          tag: 'Video / Grabación'
        };
      case 'code':
        return {
          icon: <Code2 className="h-4 w-4 text-[#bbf451] shrink-0" />,
          bg: 'bg-[#bbf451]/15 text-[#bbf451]',
          tag: 'Código / Repositorio'
        };
      case 'link':
        return {
          icon: <ExternalLink className="h-4 w-4 text-[#7075ff] shrink-0" />,
          bg: 'bg-[#7075ff]/15 text-[#a594fd]',
          tag: 'Enlace / URL'
        };
      default:
        return {
          icon: <Paperclip className="h-4 w-4 text-[#ffb703] shrink-0" />,
          bg: 'bg-white/10 text-white',
          tag: 'Archivo Requerido'
        };
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#bbf451] text-[#0a0a0c] font-black text-[11px]">
          ✓
        </span>
        <span className="text-[11px] font-black uppercase tracking-wider text-white">
          {title} ({items.length})
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const badge = getItemBadge(item);
          return (
            <div
              key={item.id}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl ${badge.bg} transition-transform hover:scale-[1.02] shadow-sm`}
            >
              {badge.icon}
              <span className="text-xs font-black tracking-tight">{item.label}</span>
              <span className="text-[10px] font-mono opacity-60 uppercase ml-0.5">
                {badge.tag}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
