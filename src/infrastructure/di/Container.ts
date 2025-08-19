import { FirebaseBoardRepository } from '../repositories/FirebaseBoardRepository';
import { FirebaseUserRepository } from '../repositories/FirebaseUserRepository';
import { FirebaseNoteRepository } from '../repositories/FirebaseNoteRepository';
import { BoardRepository } from '@/domain/repositories/BoardRepository';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { NoteRepository } from '@/domain/repositories/NoteRepository';
import { BoardUseCase } from '@/application/use-cases/BoardUseCase';

class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeServices();
  }

  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  private initializeServices() {
    // Repositories
    const boardRepository = new FirebaseBoardRepository();
    const userRepository = new FirebaseUserRepository(); // Would need to implement
    const noteRepository = new FirebaseNoteRepository(); // Would need to implement

    // Use Cases
    const boardUseCase = new BoardUseCase(boardRepository, userRepository);

    // Register services
    this.services.set('BoardRepository', boardRepository);
    this.services.set('UserRepository', userRepository);
    this.services.set('NoteRepository', noteRepository);
    this.services.set('BoardUseCase', boardUseCase);
  }

  public get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as T;
  }

  public register<T>(serviceName: string, service: T): void {
    this.services.set(serviceName, service);
  }
}

// Export singleton instance
export const container = ServiceContainer.getInstance();

// Convenience exports
export const getBoardUseCase = () => container.get<BoardUseCase>('BoardUseCase');
export const getBoardRepository = () => container.get<BoardRepository>('BoardRepository');
export const getUserRepository = () => container.get<UserRepository>('UserRepository');
export const getNoteRepository = () => container.get<NoteRepository>('NoteRepository');