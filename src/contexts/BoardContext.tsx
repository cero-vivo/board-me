'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Board, CanvasElement } from '@/types/board';

interface BoardContextType {
  currentBoard: Board | null;
  elements: CanvasElement[];
  loading: boolean;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  createBoard: (title: string) => void;
  loadBoard: (id: string) => void;
}

const BoardContext = createContext<BoardContextType>({
  currentBoard: null,
  elements: [],
  loading: false,
  addElement: () => {},
  updateElement: () => {},
  deleteElement: () => {},
  createBoard: () => {},
  loadBoard: () => {},
});

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load initial board or create a new one
    const loadInitialBoard = async () => {
      const mockBoard: Board = {
        id: '1',
        title: 'My First Board',
        elements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: '1',
      };
      
      setCurrentBoard(mockBoard);
      setElements(mockBoard.elements);
    };

    loadInitialBoard();
  }, []);

  const addElement = (element: CanvasElement) => {
    setElements(prev => [...prev, element]);
    
    // In a real app, this would save to Firestore
    if (currentBoard) {
      const updatedBoard = {
        ...currentBoard,
        elements: [...currentBoard.elements, element],
        updatedAt: new Date(),
      };
      setCurrentBoard(updatedBoard);
    }
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setElements(prev => 
      prev.map(el => el.id === id ? { ...el, ...updates } : el)
    );
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
  };

  const createBoard = (title: string) => {
    const newBoard: Board = {
      id: Date.now().toString(),
      title,
      elements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '1',
    };
    
    setCurrentBoard(newBoard);
    setElements([]);
  };

  const loadBoard = (id: string) => {
    // In a real app, this would load from Firestore
    const mockBoard: Board = {
      id,
      title: `Board ${id}`,
      elements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: '1',
    };
    
    setCurrentBoard(mockBoard);
    setElements(mockBoard.elements);
  };

  return (
    <BoardContext.Provider
      value={{
        currentBoard,
        elements,
        loading,
        addElement,
        updateElement,
        deleteElement,
        createBoard,
        loadBoard,
      }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};