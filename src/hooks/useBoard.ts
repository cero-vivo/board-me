import { useBoardContext } from '@/contexts/BoardContext';

export const useBoard = () => {
  const context = useBoardContext();
  
  return {
    elements: context.elements,
    currentBoard: context.currentBoard,
    loading: context.loading,
    addElement: context.addElement,
    updateElement: context.updateElement,
    deleteElement: context.deleteElement,
    createBoard: context.createBoard,
    loadBoard: context.loadBoard,
  };
};