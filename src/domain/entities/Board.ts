export interface Board {
  id: string;
  title: string;
  elements: CanvasElement[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isPublic: boolean;
  collaborators: string[];
  tags: string[];
  version: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  
  // Style properties
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  
  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder';
  textAlign?: 'left' | 'center' | 'right';
  
  // Drawing properties
  points?: Point[];
  path?: string;
  
  // Image properties
  src?: string;
  alt?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type ElementType = 
  | 'rectangle' 
  | 'circle' 
  | 'text' 
  | 'pen' 
  | 'arrow' 
  | 'image' 
  | 'sticky_note' 
  | 'connector';

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export interface BoardBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}