import { User, UserPreferences, Subscription } from '../entities/User';

export interface UserRepository {
  // User operations
  create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByProvider(provider: string, providerId: string): Promise<User | null>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  
  // Preferences
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void>;
  getPreferences(userId: string): Promise<UserPreferences>;
  
  // Subscription management
  updateSubscription(userId: string, subscription: Subscription): Promise<void>;
  getSubscription(userId: string): Promise<Subscription | null>;
  
  // Profile management
  updateProfile(userId: string, profile: UserProfile): Promise<void>;
  getProfile(userId: string): Promise<UserProfile>;
  
  // Search and filtering
  search(query: string): Promise<User[]>;
  
  // Activity tracking
  recordLogin(userId: string): Promise<void>;
  getActivity(userId: string, days: number): Promise<UserActivity[]>;
  
  // Settings
  updateSettings(userId: string, settings: Partial<UserSettings>): Promise<void>;
  getSettings(userId: string): Promise<UserSettings>;
}

export interface UserProfile {
  bio?: string;
  website?: string;
  location?: string;
  timezone?: string;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  isVerified?: boolean;
}

export interface UserActivity {
  date: Date;
  action: string;
  metadata?: Record<string, any>;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  collaborators: boolean;
  comments: boolean;
  marketing: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'connections';
  showEmail: boolean;
  allowCollaboration: boolean;
}