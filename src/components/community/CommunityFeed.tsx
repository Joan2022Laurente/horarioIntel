'use client';

import React, { useState } from 'react';
import { 
  ThumbsUp, 
  Plus, 
  Sparkles, 
  Send, 
  BookOpen, 
  MessageSquare
} from 'lucide-react';
import { PostRow, PostCategory } from '@/types/community';
import { ProcessedCourse } from '@/types/utp';
import { useAgent } from '@/context/AgentContext';

interface CommunityFeedProps {
  courses: ProcessedCourse[];
  onAskAi?: (prompt: string) => void;
}

const INITIAL_POSTS: PostRow[] = [
  {
    id: 'post-1',
    author_id: 'usr-1',
    author: {
      id: 'usr-1',
      student_code: 'U19302911',
      full_name: 'Carlos Benítez',
      email: 'cbenitez@utp.edu.pe',
      career: 'Ingeniería de Sistemas',
      campus: 'Campus Digital',
      cycle: 8,
      reputation_score: 180,
      created_at: '',
      updated_at: '',
    },
    course_id: '100000ST61',
    category: 'PROJECT_RECRUITMENT',
    title: 'Buscamos 1 integrante Backend para el entregable APF1 de Desarrollo Web',
    content: 'Somos 2 alumnos trabajando con React + Next.js y Tailwind. Buscamos a alguien que maneje PostgreSQL / Supabase o APIs en Node para completar el equipo de 3.',
    media_urls: [],
    upvotes_count: 14,
    comments_count: 5,
    has_user_upvoted: false,
    created_at: 'Hace 2 horas',
    updated_at: '',
  },
  {
    id: 'post-2',
    author_id: 'usr-2',
    author: {
      id: 'usr-2',
      student_code: 'U21301289',
      full_name: 'Andrea Rivas',
      email: 'arivas@utp.edu.pe',
      career: 'Ingeniería de Software',
      campus: 'Torre Lima Centro',
      cycle: 7,
      reputation_score: 150,
      created_at: '',
      updated_at: '',
    },
    course_id: '100000SI12',
    category: 'STUDY_TIPS',
    title: 'Resumen de las 4 Dimensiones de ITIL 4 para la PC1 de Gestión TI',
    content: 'Les comparto los puntos clave que siempre entran en la PC1: 1. Organizaciones y Personas, 2. Información y Tecnología, 3. Socios y Proveedores, 4. Flujos de Valor y Procesos.',
    media_urls: [],
    upvotes_count: 29,
    comments_count: 8,
    has_user_upvoted: true,
    created_at: 'Hace 4 horas',
    updated_at: '',
  }
];

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  courses,
  onAskAi,
}) => {
  const { askAgent } = useAgent();
  const handleAsk = onAskAi || askAgent;
  const [posts, setPosts] = useState<PostRow[]>(INITIAL_POSTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCourse, setPostCourse] = useState(courses[0]?.name || '');
  const [postCategory, setPostCategory] = useState<PostCategory>('ACADEMIC_QUESTION');

  const handleToggleUpvote = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextUpvoted = !p.has_user_upvoted;
        return {
          ...p,
          has_user_upvoted: nextUpvoted,
          upvotes_count: nextUpvoted ? p.upvotes_count + 1 : Math.max(0, p.upvotes_count - 1)
        };
      }
      return p;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPost: PostRow = {
      id: `post-${Date.now()}`,
      author_id: 'me',
      author: {
        id: 'me',
        student_code: 'MI_CODIGO',
        full_name: 'Tú',
        email: 'yo@utp.edu.pe',
        career: 'Ingeniería',
        campus: 'Campus Digital',
        cycle: 7,
        reputation_score: 100,
        created_at: '',
        updated_at: '',
      },
      course_id: postCourse,
      category: postCategory,
      title: postTitle,
      content: postContent,
      media_urls: [],
      upvotes_count: 1,
      comments_count: 0,
      has_user_upvoted: true,
      created_at: 'Ahora mismo',
      updated_at: '',
    };

    setPosts(prev => [newPost, ...prev]);
    setIsCreatingPost(false);
    setPostTitle('');
    setPostContent('');
  };

  const filteredPosts = selectedCategory === 'ALL'
    ? posts
    : posts.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6 text-white animate-in fade-in duration-150">
      
      {/* Header - Clean Title (Zero Icon) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Comunidad & Foro Académico
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Resuelve dudas de clase, comparte resúmenes y encuentra compañeros de equipo por asignatura.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingPost(!isCreatingPost)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-purple)] hover:bg-[var(--accent-purple-hover)] px-4 py-2 text-xs font-black text-white transition active:scale-95 shadow-none"
        >
          <Plus className="h-4 w-4" />
          <span>{isCreatingPost ? 'Cancelar' : 'Crear Publicación'}</span>
        </button>
      </div>

      {/* Categorías Filter */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar text-xs">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
            selectedCategory === 'ALL' 
              ? 'bg-white text-black' 
              : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
          }`}
        >
          Todos los Posts
        </button>
        <button
          onClick={() => setSelectedCategory('PROJECT_RECRUITMENT')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
            selectedCategory === 'PROJECT_RECRUITMENT' 
              ? 'bg-[var(--accent-orange)] text-white' 
              : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
          }`}
        >
          Equipos para Proyectos
        </button>
        <button
          onClick={() => setSelectedCategory('STUDY_TIPS')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
            selectedCategory === 'STUDY_TIPS' 
              ? 'bg-[var(--accent-lime)] text-black' 
              : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
          }`}
        >
          Tips y Exámenes
        </button>
        <button
          onClick={() => setSelectedCategory('ACADEMIC_QUESTION')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
            selectedCategory === 'ACADEMIC_QUESTION' 
              ? 'bg-[var(--accent-purple)] text-white' 
              : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
          }`}
        >
          Dudas de Asignatura
        </button>
      </div>

      {/* Modal / Formulario de Nuevo Post */}
      {isCreatingPost && (
        <form onSubmit={handleCreatePost} className="rounded-3xl bg-[var(--surface-card)] border border-[var(--badge-purple-border)] p-5 space-y-4 shadow-none animate-in zoom-in-95">
          <h3 className="text-xs font-black text-[var(--badge-purple-text)] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Publicar en la Comunidad UTP</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Categoría</label>
              <select
                value={postCategory}
                onChange={e => setPostCategory(e.target.value as PostCategory)}
                className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-purple)]"
              >
                <option value="ACADEMIC_QUESTION">Duda Académica</option>
                <option value="PROJECT_RECRUITMENT">Reclutamiento de Equipo</option>
                <option value="STUDY_TIPS">Tips de Estudio</option>
                <option value="CAMPUS_LIFE">Vida Universitaria</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Curso Relacionado</label>
              <select
                value={postCourse}
                onChange={e => setPostCourse(e.target.value)}
                className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-purple)]"
              >
                {courses.map(c => (
                  <option key={c.courseId} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-neutral-400 font-semibold">Título</label>
            <input 
              type="text" 
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
              placeholder="Ej: ¿Alguien tiene dudas sobre la pregunta 3 de la guía de Desarrollo Web?"
              required
              className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-purple)]"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-neutral-400 font-semibold">Contenido del Post</label>
            <textarea 
              rows={4}
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder="Escribe los detalles de tu consulta o propuesta..."
              required
              className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl p-3 text-white focus:outline-none focus:border-[var(--accent-purple)]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-purple)] px-5 py-2 text-xs font-black text-white hover:bg-[var(--accent-purple-hover)] transition active:scale-95 shadow-none"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Publicar</span>
            </button>
          </div>
        </form>
      )}

      {/* Feed List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div 
            key={post.id}
            className="rounded-3xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] p-5 sm:p-6 space-y-4 shadow-none transition-all"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-[var(--badge-purple-bg)] border border-[var(--badge-purple-border)] text-[var(--badge-purple-text)] font-black flex items-center justify-center text-xs">
                  {post.author?.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{post.author?.full_name}</p>
                  <p className="text-[10px] text-neutral-400">{post.author?.career} • {post.created_at}</p>
                </div>
              </div>

              {post.course_id && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-neutral-300 bg-[var(--surface-subtle)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-full">
                  <BookOpen className="h-3 w-3 text-[var(--accent-yellow)]" />
                  <span>{post.course_id}</span>
                </span>
              )}
            </div>

            {/* Post Body */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white hover:text-[var(--badge-purple-text)] transition-colors cursor-pointer">
                {post.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleUpvote(post.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition active:scale-90 shadow-none ${
                    post.has_user_upvoted
                      ? 'bg-[var(--accent-purple)] text-white'
                      : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
                  }`}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{post.upvotes_count}</span>
                </button>

                <button 
                  onClick={() => handleAsk(`Analiza este post de la comunidad y dame la mejor respuesta académica: "${post.title} - ${post.content}"`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-subtle)] hover:bg-[var(--surface-muted)] border border-[var(--border-subtle)] text-neutral-300 hover:text-white transition shadow-none"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{post.comments_count} respuestas</span>
                </button>
              </div>

              <button 
                onClick={() => handleAsk(`¿Qué recomendaciones darías para este post de la comunidad: "${post.title}"?`)}
                className="inline-flex items-center gap-1 text-neutral-400 hover:text-[var(--accent-lime)] transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Responder con IA</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
