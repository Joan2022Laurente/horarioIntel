'use client';

import React from 'react';
import { CleanDeliverableItem } from '@/lib/tasks/instruction-cleaner';
import { 
  FileText, 
  Presentation, 
  Video, 
  Code2, 
  ExternalLink, 
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
          icon: <Presentation className="h-4 w-4 text-[var(--badge-blue-text)] shrink-0" />,
          bg: 'bg-[var(--badge-blue-bg)] border border-[var(--badge-blue-border)] text-[var(--badge-blue-text)]',
          tag: 'Diapositivas PPTX'
        };
      case 'doc':
        return {
          icon: <FileText className="h-4 w-4 text-[var(--badge-orange-text)] shrink-0" />,
          bg: 'bg-[var(--badge-orange-bg)] border border-[var(--badge-orange-border)] text-[var(--badge-orange-text)]',
          tag: 'Documento / Informe'
        };
      case 'video':
        return {
          icon: <Video className="h-4 w-4 text-[var(--badge-red-text)] shrink-0" />,
          bg: 'bg-[var(--badge-red-bg)] border border-[var(--badge-red-border)] text-[var(--badge-red-text)]',
          tag: 'Video / Grabación'
        };
      case 'code':
        return {
          icon: <Code2 className="h-4 w-4 text-[var(--badge-lime-text)] shrink-0" />,
          bg: 'bg-[var(--badge-lime-bg)] border border-[var(--badge-lime-border)] text-[var(--badge-lime-text)]',
          tag: 'Código / Repositorio'
        };
      case 'link':
        return {
          icon: <ExternalLink className="h-4 w-4 text-[var(--badge-purple-text)] shrink-0" />,
          bg: 'bg-[var(--badge-purple-bg)] border border-[var(--badge-purple-border)] text-[var(--badge-purple-text)]',
          tag: 'Enlace / URL'
        };
      default:
        return {
          icon: <Paperclip className="h-4 w-4 text-[var(--badge-yellow-text)] shrink-0" />,
          bg: 'bg-[var(--badge-yellow-bg)] border border-[var(--badge-yellow-border)] text-[var(--badge-yellow-text)]',
          tag: 'Archivo Requerido'
        };
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-lime)] text-[#0a0a0c] font-black text-[11px]">
          ✓
        </span>
        <span className="text-xs font-bold text-white">
          {title} ({items.length})
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const badge = getItemBadge(item);
          return (
            <div
              key={item.id}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl ${badge.bg} transition-transform hover:scale-[1.02] shadow-none`}
            >
              {badge.icon}
              <span className="text-xs font-bold tracking-tight">{item.label}</span>
              <span className="text-[10px] font-mono opacity-75 ml-0.5">
                • {badge.tag}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
