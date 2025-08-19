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
  limit,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { Note, TodoItem } from '@/domain/entities/Note';
import { NoteRepository, NoteQueryOptions, TodoQueryOptions, NoteStats, TodoStats } from '@/domain/repositories/NoteRepository';
import { firebaseService } from '../firebase/config';

export class FirebaseNoteRepository implements NoteRepository {
  private db = firebaseService.db;

  async create(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Note> {
    const notesRef = collection(this.db, 'notes');
    const newNoteRef = doc(notesRef);
    
    const noteData = {
      ...note,
      id: newNoteRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
    };

    await setDoc(newNoteRef, noteData);
    
    return {
      ...note,
      id: newNoteRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
  }

  async findById(id: string): Promise<Note | null> {
    const noteRef = doc(this.db, 'notes', id);
    const noteDoc = await getDoc(noteRef);
    
    if (!noteDoc.exists()) {
      return null;
    }

    return this.mapToNote(noteDoc.data());
  }

  async findByBoardId(boardId: string): Promise<Note[]> {
    const q = query(collection(this.db, 'notes'), where('boardId', '==', boardId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToNote(doc.data()));
  }

  async findByUserId(userId: string, options?: NoteQueryOptions): Promise<Note[]> {
    let q = query(collection(this.db, 'notes'), where('createdBy', '==', userId));

    if (options?.orderBy) {
      q = query(q, orderBy(options.orderBy, options.orderDirection || 'desc'));
    }

    if (options?.limit) {
      q = query(q, orderBy('createdAt', 'desc'), limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToNote(doc.data()));
  }

  async update(id: string, updates: Partial<Note>): Promise<Note> {
    const noteRef = doc(this.db, 'notes', id);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(noteRef, updateData);
    
    const updatedNote = await this.findById(id);
    if (!updatedNote) {
      throw new Error('Note not found after update');
    }

    return updatedNote;
  }

  async delete(id: string): Promise<void> {
    const noteRef = doc(this.db, 'notes', id);
    await deleteDoc(noteRef);
  }

  async createTodo(todo: Omit<TodoItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<TodoItem> {
    const todosRef = collection(this.db, 'todos');
    const newTodoRef = doc(todosRef);
    
    const todoData = {
      ...todo,
      id: newTodoRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newTodoRef, todoData);
    
    return {
      ...todo,
      id: newTodoRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async findTodosByNoteId(noteId: string): Promise<TodoItem[]> {
    const q = query(collection(this.db, 'todos'), where('noteId', '==', noteId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToTodoItem(doc.data()));
  }

  async findTodosByUserId(userId: string, options?: TodoQueryOptions): Promise<TodoItem[]> {
    let q = query(collection(this.db, 'todos'), where('createdBy', '==', userId));

    if (options?.completed !== undefined) {
      q = query(q, where('completed', '==', options.completed));
    }

    if (options?.priority && options.priority.length > 0) {
      q = query(q, where('priority', 'in', options.priority));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToTodoItem(doc.data()));
  }

  async updateTodo(id: string, updates: Partial<TodoItem>): Promise<TodoItem> {
    const todoRef = doc(this.db, 'todos', id);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(todoRef, updateData);
    
    const updatedTodo = await this.getTodo(id);
    if (!updatedTodo) {
      throw new Error('Todo not found after update');
    }

    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<void> {
    const todoRef = doc(this.db, 'todos', id);
    await deleteDoc(todoRef);
  }

  async moveNote(noteId: string, newParentId?: string): Promise<void> {
    const noteRef = doc(this.db, 'notes', noteId);
    await updateDoc(noteRef, {
      parentId: newParentId || null,
      updatedAt: serverTimestamp(),
    });
  }

  async reorderNotes(noteIds: string[], boardId: string): Promise<void> {
    const batch = [];
    
    for (let i = 0; i < noteIds.length; i++) {
      const noteRef = doc(this.db, 'notes', noteIds[i]);
      batch.push(updateDoc(noteRef, {
        order: i,
        updatedAt: serverTimestamp(),
      }));
    }

    await Promise.all(batch);
  }

  async search(searchQuery: string, userId: string): Promise<Note[]> {
    const q = query(
      collection(this.db, 'notes'),
      where('createdBy', '==', userId),
      where('title', '>=', searchQuery),
      where('title', '<=', searchQuery + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToNote(doc.data()));
  }

  async findByTag(tag: string, userId: string): Promise<Note[]> {
    const q = query(
      collection(this.db, 'notes'),
      where('createdBy', '==', userId),
      where('tags', 'array-contains', tag)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToNote(doc.data()));
  }

  async findByType(type: string, userId: string): Promise<Note[]> {
    const q = query(
      collection(this.db, 'notes'),
      where('createdBy', '==', userId),
      where('type', '==', type)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToNote(doc.data()));
  }

  async addCollaborator(noteId: string, userId: string, role: 'viewer' | 'editor' | 'admin'): Promise<void> {
    const noteRef = doc(this.db, 'notes', noteId);
    await updateDoc(noteRef, {
      collaborators: [...(await this.getCollaborators(noteId)), { userId, role }],
      updatedAt: serverTimestamp(),
    });
  }

  async removeCollaborator(noteId: string, userId: string): Promise<void> {
    const noteRef = doc(this.db, 'notes', noteId);
    const collaborators = await this.getCollaborators(noteId);
    const updatedCollaborators = collaborators.filter(c => c.userId !== userId);
    
    await updateDoc(noteRef, {
      collaborators: updatedCollaborators,
      updatedAt: serverTimestamp(),
    });
  }

  async getCollaborators(noteId: string): Promise<any[]> {
    const note = await this.findById(noteId);
    return note?.collaborators || [];
  }

  subscribeToNotes(boardId: string, callback: (notes: Note[]) => void): () => void {
    const notesRef = collection(this.db, 'notes');
    const q = query(notesRef, where('boardId', '==', boardId));
    
    return onSnapshot(q, (querySnapshot) => {
      const notes = querySnapshot.docs.map(doc => this.mapToNote(doc.data()));
      callback(notes);
    });
  }

  subscribeToTodos(noteId: string, callback: (todos: TodoItem[]) => void): () => void {
    const todosRef = collection(this.db, 'todos');
    const q = query(todosRef, where('noteId', '==', noteId));
    
    return onSnapshot(q, (querySnapshot) => {
      const todos = querySnapshot.docs.map(doc => this.mapToTodoItem(doc.data()));
      callback(todos);
    });
  }

  async batchUpdateNotes(updates: Array<{ id: string; updates: Partial<Note> }>): Promise<void> {
    const batch = [];
    
    for (const update of updates) {
      const noteRef = doc(this.db, 'notes', update.id);
      batch.push(updateDoc(noteRef, {
        ...update.updates,
        updatedAt: serverTimestamp(),
      }));
    }

    await Promise.all(batch);
  }

  async batchUpdateTodos(updates: Array<{ id: string; updates: Partial<TodoItem> }>): Promise<void> {
    const batch = [];
    
    for (const update of updates) {
      const todoRef = doc(this.db, 'todos', update.id);
      batch.push(updateDoc(todoRef, {
        ...update.updates,
        updatedAt: serverTimestamp(),
      }));
    }

    await Promise.all(batch);
  }

  async getNoteStats(userId: string): Promise<NoteStats> {
    const notes = await this.findByUserId(userId);
    
    const byType: Record<string, number> = {};
    const byTag: Record<string, number> = {};
    
    notes.forEach(note => {
      byType[note.type] = (byType[note.type] || 0) + 1;
      
      // Skip tags for now as they're not in the Note interface
    });

    return {
      total: notes.length,
      byType,
      byTag,
      recent: notes.filter(n => 
        new Date().getTime() - n.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
      ).length,
      archived: 0, // Placeholder until archived property is added
    };
  }

  async getTodoStats(userId: string): Promise<TodoStats> {
    const todos = await this.findTodosByUserId(userId);
    
    const byPriority: Record<string, number> = {};
    
    todos.forEach(todo => {
      byPriority[todo.priority] = (byPriority[todo.priority] || 0) + 1;
    });

    const now = new Date();
    return {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      pending: todos.filter(t => !t.completed).length,
      overdue: todos.filter(t => !t.completed && t.dueDate && t.dueDate < now).length,
      byPriority,
    };
  }

  private async getTodo(id: string): Promise<TodoItem | null> {
    const todoRef = doc(this.db, 'todos', id);
    const todoDoc = await getDoc(todoRef);
    
    if (!todoDoc.exists()) {
      return null;
    }

    return this.mapToTodoItem(todoDoc.data());
  }

  private mapToNote(data: any): Note {
    return {
      id: data.id,
      title: data.title,
      content: data.content || { blocks: [] },
      type: data.type,
      boardId: data.boardId,
      position: data.position || { x: 0, y: 0 },
      size: data.size || { width: 200, height: 100 },
      parentId: data.parentId,
      children: data.children || [],
      properties: data.properties || {},
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
      lastModifiedBy: data.lastModifiedBy || data.createdBy,
      version: data.version || 1,
      isPublic: data.isPublic || false,
      collaborators: data.collaborators || [],
      comments: data.comments || [],
    };
  }

  private mapToTodoItem(data: any): TodoItem {
    return {
      id: data.id,
      text: data.text,
      completed: data.completed || false,
      completedAt: data.completedAt?.toDate(),
      completedBy: data.completedBy,
      dueDate: data.dueDate?.toDate(),
      priority: data.priority || 'medium',
      assignees: data.assignees || [],
      tags: data.tags || [],
      order: data.order || 0,
      subtasks: data.subtasks || [],
      description: data.description || { blocks: [] },
      attachments: data.attachments || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      createdBy: data.createdBy,
    };
  }
}