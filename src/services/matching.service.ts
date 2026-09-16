import { StudyBeaconRow, SquadRequestRow, NetworkingProfileRow, MatchIntent } from '@/types/matching';

export interface IMatchingService {
  getActiveBeacons(campus?: string, courseId?: string): Promise<StudyBeaconRow[]>;
  publishBeacon(data: Omit<StudyBeaconRow, 'id' | 'current_collaborators' | 'status' | 'created_at'>): Promise<StudyBeaconRow>;
  sendSquadRequest(senderId: string, receiverId: string, courseId?: string, message?: string): Promise<SquadRequestRow>;
  getNetworkingProfile(studentId: string): Promise<NetworkingProfileRow | null>;
}

export class MatchingService implements IMatchingService {
  async getActiveBeacons(_campus?: string, _courseId?: string): Promise<StudyBeaconRow[]> {
    return [];
  }

  async publishBeacon(data: Omit<StudyBeaconRow, 'id' | 'current_collaborators' | 'status' | 'created_at'>): Promise<StudyBeaconRow> {
    return {
      ...data,
      id: `bcn_${Date.now()}`,
      current_collaborators: 1,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };
  }

  async sendSquadRequest(senderId: string, receiverId: string, courseId?: string, message?: string): Promise<SquadRequestRow> {
    return {
      id: `sqd_${Date.now()}`,
      sender_id: senderId,
      receiver_id: receiverId,
      course_id: courseId,
      message,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
  }

  async getNetworkingProfile(studentId: string): Promise<NetworkingProfileRow | null> {
    return {
      student_id: studentId,
      skills: [],
      interests: [],
      match_intent: 'PROJECT_TEAM' as MatchIntent,
      ghost_mode: false,
      updated_at: new Date().toISOString(),
    };
  }
}

export const matchingService = new MatchingService();
