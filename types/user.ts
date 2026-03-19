export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
  teamId: string | null;
  teamName: string | null;
  registeredAt: string;
  flagsCaptured: number;
  userRank: number;
  usernameChangeCount: number;
}

export interface UsernameValidation {
  isValid: boolean;
  error?: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  data?: Partial<UserProfile>;
}
