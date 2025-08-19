export interface Note {
  id: string;
  title: string;
  content: NoteContent;
  type: NoteType;
  boardId: string;
  position: Position;
  size: Size;
  
  // Hierarchy
  parentId?: string;
  children: string[];
  
  // Properties
  properties: NoteProperties;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
  version: number;
  
  // Sharing
  isPublic: boolean;
  collaborators: Collaborator[];
  comments: Comment[];
}

export type NoteType = 'note' | 'todo' | 'heading' | 'divider' | 'callout' | 'quote' | 'code';

export interface NoteContent {
  blocks: ContentBlock[];
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: any;
  children?: ContentBlock[];
}

export type BlockType = 
  | 'paragraph'
  | 'heading_1'
  | 'heading_2' 
  | 'heading_3'
  | 'bulleted_list_item'
  | 'numbered_list_item'
  | 'to_do'
  | 'toggle'
  | 'code'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'image'
  | 'video'
  | 'file';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignees: string[];
  tags: string[];
  order: number;
  subtasks: TodoItem[];
  
  // Rich content
  description?: NoteContent;
  attachments: Attachment[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file' | 'link';
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Position {
  x: number;
  y: number;
  z?: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface NoteProperties {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  border?: BorderStyle;
  shadow?: boolean;
  collapsed?: boolean;
  locked?: boolean;
}

export interface BorderStyle {
  color: string;
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface Collaborator {
  userId: string;
  role: 'viewer' | 'editor' | 'admin';
  invitedAt: Date;
  invitedBy: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  replies: Comment[];
}