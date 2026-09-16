'use client';

import React, { useState, useEffect } from 'react';
import { 
  ThumbsUp, 
  Plus, 
  Sparkles, 
  Send, 
  BookOpen, 
  MessageSquare,
  Loader2
} from 'lucide-react';
import { PostRow, PostCategory } from '@/types/community';
import { ProcessedCourse } from '@/types/utp';
import { useAgent } from '@/context/AgentContext';
import { 
  fetchCommunityPosts, 
  createCommunityPostInDb, 
  togglePostUpvoteInDb 
} from '@/lib/supabase/community-service';

interface CommunityFeedProps {
  courses: ProcessedCourse[];
  onAskAi?: (prompt: string) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  courses,
  onAskAi,
}) => {
  const { askAgent } = useAgent();
  const handleAsk = onAskAi || askAgent;
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCourse, setPostCourse] = useState(courses[0]?.name || '');
  const [postCategory, setPostCategory] = useState<PostCategory>('ACADEMIC_QUESTION');

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true);
      const data = await fetchCommunityPosts();
      setPosts(data);
      setIsLoading(false);
    }
    loadPosts();
  }, []);

  const handleToggleUpvote = async (postId: string) => {
    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;

    const nextUpvoted = !targetPost.has_user_upvoted;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          has_user_upvoted: nextUpvoted,
          upvotes_count: nextUpvoted ? p.upvotes_count + 1 : Math.max(0, p.upvotes_count - 1)
        };
      }
      return p;
    }));

    await togglePostUpvoteInDb(postId, nextUpvoted);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    setIsSubmitting(true);
    const created = await createCommunityPostInDb({
      authorName: 'Joan Laurente',
      authorCode: 'U20202020',
      authorCareer: 'Ingeniería de Software',
      courseId: postCourse,
      category: postCategory,
      title: postTitle.trim(),
      content: postContent.trim(),
    });

    if (created) {
      setPosts(prev => [created, ...prev]);
    } else {
      const fallbackPost: PostRow = {
        id: `post-${Date.now()}`,
        author_id: 'me',
        author: {
          id: 'me',
          student_code: 'U20202020',
          full_name: 'Joan Laurente (Tú)',
          email: 'yo@utp.edu.pe',
          career: 'Ingeniería de Software',
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
      setPosts(prev => [fallbackPost, ...prev]);
    }

    setIsSubmitting(false);
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
          <span>{isCreatingPost ? 'Cancelar' : 'Publicar Consulta'}</span>
        </button>
      </div>

      {/* Formulario rápido para nuevo Post */}
      {isCreatingPost && (
        <form onSubmit={handleCreatePost} className="rounded-3xl bg-[var(--surface-card)] border border-[var(--border-medium)] p-5 space-y-4 shadow-none animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[var(--badge-purple-text)] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Nueva Consulta o Aporte Académico</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Título del Post</label>
              <input 
                type="text" 
                value={postTitle}
                onChange={e => setPostTitle(e.target.value)}
                placeholder="Ej: ¿Alguien tiene modelo de informe APF1?"
                required
                className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-purple)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 font-semibold">Asignatura</label>
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
            <label className="text-neutral-400 font-semibold">Contenido / Consulta</label>
            <textarea 
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder="Explica tu duda o detalle del aporte..."
              rows={3}
              required
              className="w-full bg-[var(--surface-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[var(--accent-purple)]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent-purple)] px-5 py-2 text-xs font-black text-white hover:bg-[var(--accent-purple-hover)] transition active:scale-95 shadow-none disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              <span>{isSubmitting ? 'Publicando...' : 'Publicar en Comunidad'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Categorías de Filtro */}
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
              ? 'bg-[var(--accent-emerald)] text-black' 
              : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
          }`}
        >
          Búsqueda de Grupo
        </button>
        <button
          onClick={() => setSelectedCategory('STUDY_TIPS')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
            selectedCategory === 'STUDY_TIPS' 
              ? 'bg-[var(--accent-yellow)] text-black' 
              : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
          }`}
        >
          Tips de Estudio & Resúmenes
        </button>
        <button
          onClick={() => setSelectedCategory('ACADEMIC_QUESTION')}
          className={`px-3.5 py-1.5 rounded-full font-bold transition whitespace-nowrap shadow-none ${
            selectedCategory === 'ACADEMIC_QUESTION' 
              ? 'bg-[var(--accent-purple)] text-white' 
              : 'bg-[var(--surface-subtle)] border border-[var(--border-subtle)] text-neutral-400 hover:text-white'
          }`}
        >
          Preguntas & Dudas
        </button>
      </div>

      {/* Feed de Posts */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-neutral-400 space-y-2">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-purple)]" />
          <p className="text-xs">Cargando discusiones de la comunidad desde Supabase...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <div 
              key={post.id}
              className="rounded-3xl bg-[var(--surface-card)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] p-5 space-y-4 shadow-none transition-all"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-center font-bold text-white text-xs">
                    {post.author?.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{post.author?.full_name}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">({post.author?.career})</span>
                    </div>
                    <span className="text-[11px] text-neutral-400">{post.created_at}</span>
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
      )}

    </div>
  );
};
