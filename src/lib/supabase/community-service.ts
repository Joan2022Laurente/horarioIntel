import { supabase } from './client';
import { PostRow, PostCategory } from '@/types/community';

export async function fetchCommunityPosts(): Promise<PostRow[]> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Error fetching posts:', error);
      return [];
    }

    return (data || []).map((p) => ({
      id: p.id,
      author_id: p.author_id || 'usr-author',
      author: {
        id: p.author_id || 'usr-author',
        student_code: p.author_code || 'U20202020',
        full_name: p.author_name,
        email: '',
        career: p.author_career || 'Ingeniería',
        campus: 'Campus Digital',
        cycle: 7,
        reputation_score: 150,
        created_at: p.created_at,
        updated_at: p.created_at,
      },
      course_id: p.course_id,
      category: p.category as PostCategory,
      title: p.title,
      content: p.content,
      media_urls: Array.isArray(p.media_urls) ? p.media_urls : [],
      upvotes_count: p.upvotes_count || 0,
      comments_count: p.comments_count || 0,
      has_user_upvoted: false,
      created_at: new Date(p.created_at).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      updated_at: p.updated_at,
    }));
  } catch (e) {
    console.warn('[Supabase] Error in fetchCommunityPosts:', e);
    return [];
  }
}

export async function createCommunityPostInDb(params: {
  authorName: string;
  authorCode: string;
  authorCareer: string;
  courseId: string;
  category: PostCategory;
  title: string;
  content: string;
}): Promise<PostRow | null> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .insert([
        {
          author_name: params.authorName,
          author_code: params.authorCode,
          author_career: params.authorCareer,
          course_id: params.courseId,
          category: params.category,
          title: params.title,
          content: params.content,
          upvotes_count: 1,
          comments_count: 0,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.warn('[Supabase] Error creating community post:', error);
      return null;
    }

    return {
      id: data.id,
      author_id: data.author_id || 'me',
      author: {
        id: data.author_id || 'me',
        student_code: data.author_code || params.authorCode,
        full_name: data.author_name,
        email: '',
        career: data.author_career || params.authorCareer,
        campus: 'Campus Digital',
        cycle: 7,
        reputation_score: 100,
        created_at: data.created_at,
        updated_at: data.created_at,
      },
      course_id: data.course_id,
      category: data.category as PostCategory,
      title: data.title,
      content: data.content,
      media_urls: [],
      upvotes_count: 1,
      comments_count: 0,
      has_user_upvoted: true,
      created_at: 'Ahora mismo',
      updated_at: data.created_at,
    };
  } catch (e) {
    console.warn('[Supabase] Error in createCommunityPostInDb:', e);
    return null;
  }
}

export async function togglePostUpvoteInDb(postId: string, isUpvoting: boolean): Promise<boolean> {
  try {
    const { data: current, error: fetchErr } = await supabase
      .from('community_posts')
      .select('upvotes_count')
      .eq('id', postId)
      .single();

    if (fetchErr || !current) return false;

    const newCount = isUpvoting
      ? current.upvotes_count + 1
      : Math.max(0, current.upvotes_count - 1);

    const { error: updateErr } = await supabase
      .from('community_posts')
      .update({ upvotes_count: newCount })
      .eq('id', postId);

    return !updateErr;
  } catch (e) {
    console.warn('[Supabase] Error in togglePostUpvoteInDb:', e);
    return false;
  }
}
