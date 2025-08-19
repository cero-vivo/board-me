export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: AuthProvider;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  preferences: UserPreferences;
  subscription?: Subscription;
}

export type AuthProvider = 
  | 'google' 
  | 'microsoft' 
  | 'apple' 
  | 'github' 
  | 'facebook';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationSettings;
  canvas: CanvasSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  collaborators: boolean;
  comments: boolean;
  reminders: boolean;
}

export interface CanvasSettings {
  defaultZoom: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showRulers: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
}

export interface Subscription {
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired';
  expiresAt?: Date;
  features: string[];
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserProfile {
  bio?: string;
  website?: string;
  location?: string;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
}