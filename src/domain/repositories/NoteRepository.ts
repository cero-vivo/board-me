import { Note, TodoItem } from '../entities/Note';

export interface NoteRepository {
  // Note operations
  create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Note>;
  findById(id: string): Promise<Note | null>;
  findByBoardId(boardId: string): Promise<Note[]>;
  findByUserId(userId: string, options?: NoteQueryOptions): Promise<Note[]>;
  update(id: string, updates: Partial<Note>): Promise<Note>;
  delete(id: string): Promise<void>;
  
  // Todo operations
  createTodo(todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<TodoItem>;
  findTodosByNoteId(noteId: string): Promise<TodoItem[]>;
  findTodosByUserId(userId: string, options?: TodoQueryOptions): Promise<TodoItem[]>;
  updateTodo(id: string, updates: Partial<TodoItem>): Promise<TodoItem>;
  deleteTodo(id: string): Promise<void>;
  
  // Hierarchy operations
  moveNote(noteId: string, newParentId?: string): Promise<void>;
  reorderNotes(noteIds: string[], boardId: string): Promise<void>;
  
  // Search and filtering
  search(query: string, userId: string): Promise<Note[]>;
  findByTag(tag: string, userId: string): Promise<Note[]>;
  findByType(type: string, userId: string): Promise<Note[]>;
  
  // Collaboration
  addCollaborator(noteId: string, userId: string, role: 'viewer' | 'editor' | 'admin'): Promise<void>;
  removeCollaborator(noteId: string, userId: string): Promise<void>;
  getCollaborators(noteId: string): Promise<string[]>;
  
  // Real-time subscriptions
  subscribeToNotes(boardId: string, callback: (notes: Note[]) => void): () => void;
  subscribeToTodos(noteId: string, callback: (todos: TodoItem[]) => void): () => void;
  
  // Bulk operations
  batchUpdateNotes(updates: Array<{ id: string; updates: Partial<Note> }>): Promise<void>;
  batchUpdateTodos(updates: Array<{ id: string; updates: Partial<TodoItem> }>): Promise<void>;
  
  // Analytics
  getNoteStats(userId: string): Promise<NoteStats>;
  getTodoStats(userId: string): Promise<TodoStats>;
}

export interface NoteQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'title';
  orderDirection?: 'asc' | 'desc';
  includeDeleted?: boolean;
  type?: string[];
  tags?: string[];
}

export interface TodoQueryOptions {
  limit?: number;
  offset?: number;
  completed?: boolean;
  priority?: string[];
  dueBefore?: Date;
  dueAfter?: Date;
  assignees?: string[];
}

export interface NoteStats {
  total: number;
  byType: Record<string, number>;
  byTag: Record<string, number>;
  recent: number;
  archived: number;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byPriority: Record<string, number>;
}