import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { User, UserPreferences, Subscription, AuthProvider } from '@/domain/entities/User';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { firebaseService } from '../firebase/config';

export class FirebaseUserRepository implements UserRepository {
  private db = firebaseService.db;

  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const userRef = doc(this.db, 'users', user.id);
    
    const userData = {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, userData);
    
    return {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async findById(id: string): Promise<User | null> {
    const userRef = doc(this.db, 'users', id);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    return this.mapToUser(userDoc.data());
  }

  async findByEmail(email: string): Promise<User | null> {
    const q = query(collection(this.db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    return this.mapToUser(querySnapshot.docs[0].data());
  }

  async findByProvider(provider: string, providerId: string): Promise<User | null> {
    const q = query(
      collection(this.db, 'users'),
      where('provider', '==', provider),
      where('providerId', '==', providerId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    return this.mapToUser(querySnapshot.docs[0].data());
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const userRef = doc(this.db, 'users', id);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);
    
    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('User not found after update');
    }

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const userRef = doc(this.db, 'users', id);
    await deleteDoc(userRef);
  }

  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      preferences: preferences,
      updatedAt: serverTimestamp(),
    });
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user.preferences;
  }

  async updateSubscription(userId: string, subscription: Subscription): Promise<void> {
    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      subscription: subscription,
      updatedAt: serverTimestamp(),
    });
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    const user = await this.findById(userId);
    return user?.subscription || null;
  }

  async updateProfile(userId: string, profile: any): Promise<void> {
    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      profile: profile,
      updatedAt: serverTimestamp(),
    });
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.findById(userId);
    return user || null;
  }

  async search(searchQuery: string): Promise<User[]> {
    const q = query(
      collection(this.db, 'users'),
      orderBy('displayName'),
      where('displayName', '>=', searchQuery),
      where('displayName', '<=', searchQuery + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToUser(doc.data()));
  }

  async recordLogin(userId: string): Promise<void> {
    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  async getActivity(userId: string, days: number): Promise<any[]> {
    // Placeholder for activity tracking
    return [];
  }

  async updateSettings(userId: string, settings: any): Promise<void> {
    const userRef = doc(this.db, 'users', userId);
    await updateDoc(userRef, {
      settings: settings,
      updatedAt: serverTimestamp(),
    });
  }

  async getSettings(userId: string): Promise<any> {
    const user = await this.findById(userId);
    return user || null;
  }

  private mapToUser(data: any): User {
    return {
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      provider: data.provider as AuthProvider,
      isEmailVerified: data.isEmailVerified || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate(),
      preferences: data.preferences || this.getDefaultPreferences(),
      subscription: data.subscription || null,
    };
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/dd/yyyy',
      timeFormat: '12h',
      notifications: {
        email: true,
        push: true,
        collaborators: true,
        comments: true,
        reminders: true,
      },
      canvas: {
        defaultZoom: 1,
        showGrid: true,
        gridSize: 20,
        snapToGrid: false,
        showRulers: true,
        autoSave: true,
        autoSaveInterval: 5000,
      },
    };
  }
}