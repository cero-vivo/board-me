import { Board, CanvasElement } from '../entities/Board';

export interface BoardRepository {
  // Board operations
  create(board: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Board>;
  findById(id: string): Promise<Board | null>;
  findByUserId(userId: string, options?: QueryOptions): Promise<Board[]>;
  update(id: string, updates: Partial<Board>): Promise<Board>;
  delete(id: string): Promise<void>;
  
  // Element operations
  addElement(boardId: string, element: Omit<CanvasElement, 'id' | 'createdAt' | 'updatedAt'>): Promise<CanvasElement>;
  updateElement(boardId: string, elementId: string, updates: Partial<CanvasElement>): Promise<CanvasElement>;
  deleteElement(boardId: string, elementId: string): Promise<void>;
  getElements(boardId: string, options?: ElementQueryOptions): Promise<CanvasElement[]>;
  
  // Bulk operations
  batchUpdateElements(boardId: string, elements: Partial<CanvasElement>[]): Promise<void>;
  
  // Real-time subscriptions
  subscribeToBoard(boardId: string, callback: (board: Board) => void): () => void;
  subscribeToElements(boardId: string, callback: (elements: CanvasElement[]) => void): () => void;
  
  // Search and filtering
  search(query: string, userId: string): Promise<Board[]>;
  findByTag(tag: string, userId: string): Promise<Board[]>;
  
  // Collaboration
  addCollaborator(boardId: string, userId: string, role: 'viewer' | 'editor' | 'admin'): Promise<void>;
  removeCollaborator(boardId: string, userId: string): Promise<void>;
  getCollaborators(boardId: string): Promise<string[]>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'title';
  orderDirection?: 'asc' | 'desc';
  includeDeleted?: boolean;
}

export interface ElementQueryOptions {
  bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  types?: string[];
  limit?: number;
}