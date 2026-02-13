export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'moderator' | 'admin';
  preferences: {
    theme: 'dark' | 'light' | 'auto';
    notifications: boolean;
    soundEffects: boolean;
  };
  stats: {
    totalWatchTime: number;
    roomsCreated: number;
    roomsJoined: number;
    messagesSent: number;
  };
  lastLogin?: string;
  createdAt: string;
}

export interface Room {
  code: string;
  name: string;
  description: string;
  host: string | User;
  participantCount: number;
  maxParticipants: number;
  isPrivate: boolean;
  videoUrl: string | null;
  videoState: VideoState;
  settings: RoomSettings;
  isActive: boolean;
  createdAt: string;
}

export interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  lastUpdated: string;
}

export interface RoomSettings {
  isPrivate: boolean;
  maxParticipants: number;
  allowChat: boolean;
  allowVideo: boolean;
  allowVoice: boolean;
  allowScreenShare: boolean;
  hostOnlyControls: boolean;
  requireApproval: boolean;
}

export interface Participant {
  user?: string;
  socketId: string;
  username: string;
  avatar: string | null;
  isHost: boolean;
  isCoHost: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
  peerId: string | null;
}

export interface Message {
  _id?: string;
  user?: string;
  username: string;
  avatar: string | null;
  message: string;
  type: 'text' | 'system' | 'emoji' | 'gif';
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AdminStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    banned: number;
  };
  rooms: {
    total: number;
    active: number;
    newToday: number;
  };
}

export interface SystemStats {
  uptime: number;
  memory: {
    used: number;
    total: number;
    free: number;
  };
  cpu: number[];
  platform: string;
  nodeVersion: string;
  environment: string;
}

export interface WebRTCState {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isVideoOn: boolean;
  isMuted: boolean;
  isScreenSharing: boolean;
}
