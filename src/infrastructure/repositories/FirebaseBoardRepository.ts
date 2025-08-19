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
  startAfter,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Board, CanvasElement } from '@/domain/entities/Board';
import { BoardRepository, QueryOptions, ElementQueryOptions } from '@/domain/repositories/BoardRepository';
import { firebaseService } from '../firebase/config';

export class FirebaseBoardRepository implements BoardRepository {
  private db = firebaseService.db;
  private storage = firebaseService.storage;

  async create(board: Omit<Board, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<Board> {
    const boardsRef = collection(this.db, 'boards');
    const newBoardRef = doc(boardsRef);
    
    const boardData = {
      ...board,
      id: newBoardRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
    };

    await setDoc(newBoardRef, boardData);
    
    return {
      ...board,
      id: newBoardRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    };
  }

  async findById(id: string): Promise<Board | null> {
    const boardRef = doc(this.db, 'boards', id);
    const boardDoc = await getDoc(boardRef);
    
    if (!boardDoc.exists()) {
      return null;
    }

    const data = boardDoc.data();
    return this.mapToBoard(data);
  }

  async findByUserId(userId: string, options?: QueryOptions): Promise<Board[]> {
    let q = query(
      collection(this.db, 'boards'),
      where('userId', '==', userId)
    );

    if (options?.orderBy) {
      q = query(q, orderBy(options.orderBy, options.orderDirection || 'desc'));
    }

    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToBoard(doc.data()));
  }

  async update(id: string, updates: Partial<Board>): Promise<Board> {
    const boardRef = doc(this.db, 'boards', id);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(boardRef, updateData);
    
    const updatedBoard = await this.findById(id);
    if (!updatedBoard) {
      throw new Error('Board not found after update');
    }

    return updatedBoard;
  }

  async delete(id: string): Promise<void> {
    const boardRef = doc(this.db, 'boards', id);
    await deleteDoc(boardRef);
  }

  async addElement(
    boardId: string,
    element: Omit<CanvasElement, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CanvasElement> {
    const elementsRef = collection(this.db, 'boards', boardId, 'elements');
    const newElementRef = doc(elementsRef);
    
    const elementData = {
      ...element,
      id: newElementRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newElementRef, elementData);
    
    return {
      ...element,
      id: newElementRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateElement(
    boardId: string,
    elementId: string,
    updates: Partial<CanvasElement>
  ): Promise<CanvasElement> {
    const elementRef = doc(this.db, 'boards', boardId, 'elements', elementId);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(elementRef, updateData);
    
    const updatedElement = await this.getElement(boardId, elementId);
    if (!updatedElement) {
      throw new Error('Element not found after update');
    }

    return updatedElement;
  }

  async deleteElement(boardId: string, elementId: string): Promise<void> {
    const elementRef = doc(this.db, 'boards', boardId, 'elements', elementId);
    await deleteDoc(elementRef);
  }

  async getElements(boardId: string, options?: ElementQueryOptions): Promise<CanvasElement[]> {
    let q = query(collection(this.db, 'boards', boardId, 'elements'));

    if (options?.bounds) {
      q = query(
        q,
        where('x', '>=', options.bounds.minX),
        where('x', '<=', options.bounds.maxX),
        where('y', '>=', options.bounds.minY),
        where('y', '<=', options.bounds.maxY)
      );
    }

    if (options?.types) {
      q = query(q, where('type', 'in', options.types));
    }

    if (options?.limit) {
      q = query(q, limit(options.limit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToCanvasElement(doc.data()));
  }

  async batchUpdateElements(
    boardId: string,
    elements: Partial<CanvasElement>[]
  ): Promise<void> {
    const batch = [];
    
    for (const element of elements) {
      if (element.id) {
        const elementRef = doc(this.db, 'boards', boardId, 'elements', element.id);
        batch.push(updateDoc(elementRef, {
          ...element,
          updatedAt: serverTimestamp(),
        }));
      }
    }

    await Promise.all(batch);
  }

  subscribeToBoard(boardId: string, callback: (board: Board) => void): () => void {
    const boardRef = doc(this.db, 'boards', boardId);
    
    return onSnapshot(boardRef, (doc) => {
      if (doc.exists()) {
        callback(this.mapToBoard(doc.data()));
      }
    });
  }

  subscribeToElements(
    boardId: string,
    callback: (elements: CanvasElement[]) => void
  ): () => void {
    const elementsRef = collection(this.db, 'boards', boardId, 'elements');
    
    return onSnapshot(elementsRef, (querySnapshot) => {
      const elements = querySnapshot.docs.map(doc => this.mapToCanvasElement(doc.data()));
      callback(elements);
    });
  }

  async search(searchQuery: string, userId: string): Promise<Board[]> {
    // This would need to be implemented with full-text search
    // For now, we'll do a simple title search
    const q = query(
      collection(this.db, 'boards'),
      where('userId', '==', userId),
      where('title', '>=', searchQuery),
      where('title', '<=', searchQuery + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToBoard(doc.data()));
  }

  async findByTag(tag: string, userId: string): Promise<Board[]> {
    const q = query(
      collection(this.db, 'boards'),
      where('userId', '==', userId),
      where('tags', 'array-contains', tag)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.mapToBoard(doc.data()));
  }

  async addCollaborator(
    boardId: string,
    userId: string,
    role: 'viewer' | 'editor' | 'admin'
  ): Promise<void> {
    const boardRef = doc(this.db, 'boards', boardId);
    await updateDoc(boardRef, {
      collaborators: arrayUnion(userId),
    });
  }

  async removeCollaborator(boardId: string, userId: string): Promise<void> {
    const boardRef = doc(this.db, 'boards', boardId);
    await updateDoc(boardRef, {
      collaborators: arrayRemove(userId),
    });
  }

  async getCollaborators(boardId: string): Promise<string[]> {
    const board = await this.findById(boardId);
    return board?.collaborators || [];
  }

  private async getElement(boardId: string, elementId: string): Promise<CanvasElement | null> {
    const elementRef = doc(this.db, 'boards', boardId, 'elements', elementId);
    const elementDoc = await getDoc(elementRef);
    
    if (!elementDoc.exists()) {
      return null;
    }

    return this.mapToCanvasElement(elementDoc.data());
  }

  private mapToBoard(data: any): Board {
    return {
      id: data.id,
      title: data.title,
      elements: data.elements || [],
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      userId: data.userId,
      isPublic: data.isPublic || false,
      collaborators: data.collaborators || [],
      tags: data.tags || [],
      version: data.version || 1,
    };
  }

  private mapToCanvasElement(data: any): CanvasElement {
    return {
      id: data.id,
      type: data.type,
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height,
      rotation: data.rotation || 0,
      zIndex: data.zIndex || 0,
      opacity: data.opacity || 1,
      visible: data.visible !== false,
      locked: data.locked || false,
      fill: data.fill,
      stroke: data.stroke,
      strokeWidth: data.strokeWidth || 1,
      strokeStyle: data.strokeStyle || 'solid',
      text: data.text,
      fontSize: data.fontSize || 16,
      fontFamily: data.fontFamily || 'sans-serif',
      fontWeight: data.fontWeight || 'normal',
      textAlign: data.textAlign || 'left',
      points: data.points,
      path: data.path,
      src: data.src,
      alt: data.alt,
      metadata: data.metadata || {},
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }
}