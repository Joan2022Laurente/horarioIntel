import { supabase } from './client';
import { StudyBeaconRow } from '@/types/matching';

export async function fetchActiveBeacons(): Promise<StudyBeaconRow[]> {
  try {
    const { data, error } = await supabase
      .from('study_beacons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Error fetching beacons:', error);
      return [];
    }

    return (data || []).map((b) => ({
      id: b.id,
      host_id: b.host_id,
      host: {
        id: b.host_id || 'usr-host',
        student_code: b.host_code || 'U20202020',
        full_name: b.host_name,
        email: '',
        career: b.host_career || 'Ingeniería',
        campus: 'Campus Digital',
        cycle: 7,
        reputation_score: 120,
        created_at: b.created_at,
        updated_at: b.created_at,
      },
      course_id: b.course_id,
      location_name: b.location_name,
      objective: b.objective,
      max_collaborators: b.max_collaborators || 4,
      current_collaborators: b.current_collaborators || 1,
      status: b.status as any,
      expires_at: b.expires_at,
      created_at: b.created_at,
    }));
  } catch (e) {
    console.warn('[Supabase] Error in fetchActiveBeacons:', e);
    return [];
  }
}

export async function createBeaconInDb(params: {
  hostName: string;
  hostCode: string;
  hostCareer: string;
  courseId: string;
  courseName: string;
  locationName: string;
  objective: string;
  maxCollaborators?: number;
}): Promise<StudyBeaconRow | null> {
  try {
    const expiresAt = new Date(Date.now() + 60 * 60000).toISOString();
    const { data, error } = await supabase
      .from('study_beacons')
      .insert([
        {
          host_name: params.hostName,
          host_code: params.hostCode,
          host_career: params.hostCareer,
          course_id: params.courseId,
          course_name: params.courseName,
          location_name: params.locationName,
          objective: params.objective,
          max_collaborators: params.maxCollaborators || 4,
          current_collaborators: 1,
          status: 'ACTIVE',
          expires_at: expiresAt,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      console.warn('[Supabase] Error creating beacon:', error);
      return null;
    }

    return {
      id: data.id,
      host_id: data.host_id || 'me',
      host: {
        id: data.host_id || 'me',
        student_code: data.host_code || params.hostCode,
        full_name: data.host_name,
        email: '',
        career: data.host_career || params.hostCareer,
        campus: 'Campus Digital',
        cycle: 7,
        reputation_score: 100,
        created_at: data.created_at,
        updated_at: data.created_at,
      },
      course_id: data.course_id,
      location_name: data.location_name,
      objective: data.objective,
      max_collaborators: data.max_collaborators,
      current_collaborators: data.current_collaborators,
      status: data.status as any,
      expires_at: data.expires_at,
      created_at: data.created_at,
    };
  } catch (e) {
    console.warn('[Supabase] Error in createBeaconInDb:', e);
    return null;
  }
}

export async function joinBeaconInDb(beaconId: string): Promise<boolean> {
  try {
    const { data: current, error: fetchErr } = await supabase
      .from('study_beacons')
      .select('current_collaborators, max_collaborators')
      .eq('id', beaconId)
      .single();

    if (fetchErr || !current) return false;

    if (current.current_collaborators >= current.max_collaborators) return false;

    const nextCount = current.current_collaborators + 1;
    const nextStatus = nextCount >= current.max_collaborators ? 'FULL' : 'ACTIVE';

    const { error: updateErr } = await supabase
      .from('study_beacons')
      .update({
        current_collaborators: nextCount,
        status: nextStatus,
      })
      .eq('id', beaconId);

    return !updateErr;
  } catch (e) {
    console.warn('[Supabase] Error in joinBeaconInDb:', e);
    return false;
  }
}
