export interface Point {
  x: number;
  y: number;
}

export interface CanvasElement {
  id: string;
  type: 'rectangle' | 'text' | 'pen' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  points?: Point[];
  fontSize?: number;
  fontFamily?: string;
}

export interface Board {
  id: string;
  title: string;
  elements: CanvasElement[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: 'google' | 'microsoft' | 'apple' | 'github' | 'facebook';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'todo';
  boardId: string;
  position: { x: number; y: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  noteId: string;
  order: number;
}