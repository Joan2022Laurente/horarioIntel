'use client';

import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const parseInline = (text: string) => {
    // Procesa negritas (**texto**), código en línea (`código`), cursiva (*texto*), enlaces ([txt](url))
    const tokens = text.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*|\[.*?\]\(.*?\))/g);
    
    return tokens.map((token, idx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={idx} className="font-extrabold text-white">
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={idx}
            className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-xs text-[#bbf451] tracking-normal"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('*') && token.endsWith('*') && !token.startsWith('**')) {
        return (
          <em key={idx} className="italic text-neutral-300">
            {token.slice(1, -1)}
          </em>
        );
      }
      const linkMatch = token.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a
            key={idx}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#3a86ff] hover:text-[#60a5fa] hover:underline font-bold transition"
          >
            {linkMatch[1]}
          </a>
        );
      }
      return token;
    });
  };

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Bloques de código ```
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // Cierre del bloque
        renderedElements.push(
          <pre
            key={`code-${i}`}
            className="rounded-2xl bg-[#16161b] p-3.5 my-2.5 font-mono text-xs text-[#bbf451] overflow-x-auto border border-white/5"
          >
            <code>{codeBlockContent.join('\n')}</code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(rawLine);
      continue;
    }

    // Encabezados H1 - H5
    if (trimmed.startsWith('##### ')) {
      renderedElements.push(
        <h5 key={`h5-${i}`} className="text-xs font-bold text-[#bbf451] uppercase tracking-wider mt-3 mb-1">
          {parseInline(trimmed.replace('##### ', ''))}
        </h5>
      );
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      renderedElements.push(
        <h4 key={`h4-${i}`} className="text-sm font-black text-white mt-3.5 mb-1.5 flex items-center gap-1.5">
          {parseInline(trimmed.replace('#### ', ''))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-base font-black text-white mt-4 mb-2 tracking-tight">
          {parseInline(trimmed.replace('### ', ''))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-lg font-black text-white mt-4 mb-2 tracking-tight">
          {parseInline(trimmed.replace('## ', ''))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      renderedElements.push(
        <h1 key={`h1-${i}`} className="text-xl font-black text-white mt-4 mb-2 tracking-tight">
          {parseInline(trimmed.replace('# ', ''))}
        </h1>
      );
      continue;
    }

    // Listas con viñetas (- , * , 👉 , •)
    if (
      trimmed.startsWith('- ') ||
      trimmed.startsWith('* ') ||
      trimmed.startsWith('• ') ||
      trimmed.startsWith('👉 ')
    ) {
      const isEmojiBullet = trimmed.startsWith('👉 ');
      const bulletText = isEmojiBullet
        ? trimmed.replace('👉 ', '')
        : trimmed.substring(2);

      renderedElements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 text-xs sm:text-sm text-neutral-300 my-1 leading-relaxed pl-2">
          <span className={`${isEmojiBullet ? 'text-amber-400' : 'text-[#bbf451]'} font-bold mt-0.5 select-none shrink-0`}>
            {isEmojiBullet ? '👉' : '•'}
          </span>
          <div className="flex-1">{parseInline(bulletText)}</div>
        </div>
      );
      continue;
    }

    // Listas numeradas (1. 2. 3.)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      renderedElements.push(
        <div key={`num-${i}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300 my-1.5 leading-relaxed pl-1">
          <span className="font-mono font-bold text-neutral-400 shrink-0 text-xs mt-0.5 select-none">
            {numMatch[1]}.
          </span>
          <div className="flex-1">{parseInline(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Blockquotes (> cita)
    if (trimmed.startsWith('> ')) {
      renderedElements.push(
        <blockquote key={`quote-${i}`} className="pl-3 py-1 my-2 border-l-2 border-[#ff5722] bg-white/[0.02] rounded-r-xl text-xs text-neutral-300 italic">
          {parseInline(trimmed.replace('> ', ''))}
        </blockquote>
      );
      continue;
    }

    // Líneas vacías
    if (trimmed === '') {
      renderedElements.push(<div key={`space-${i}`} className="h-1.5" />);
      continue;
    }

    // Párrafos regulares
    renderedElements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-neutral-200 leading-relaxed my-1">
        {parseInline(rawLine)}
      </p>
    );
  }

  return <div className="space-y-0.5">{renderedElements}</div>;
};
