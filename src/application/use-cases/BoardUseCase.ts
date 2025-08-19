import { Board } from '@/domain/entities/Board';
import { BoardRepository } from '@/domain/repositories/BoardRepository';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { CanvasElement } from '@/domain/entities/Board';

export class BoardUseCase {
  constructor(
    private boardRepository: BoardRepository,
    private userRepository: UserRepository
  ) {}

  async createBoard(userId: string, title: string): Promise<Board> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const board = await this.boardRepository.create({
      title,
      elements: [],
      userId,
      isPublic: false,
      collaborators: [],
      tags: [],
    });

    return board;
  }

  async getBoard(userId: string, boardId: string): Promise<Board> {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw new Error('Board not found');
    }

    // Check if user has access to this board
    if (board.userId !== userId && !board.collaborators.includes(userId)) {
      throw new Error('Access denied');
    }

    return board;
  }

  async getUserBoards(userId: string, limit?: number): Promise<Board[]> {
    return this.boardRepository.findByUserId(userId, {
      limit,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
    });
  }

  async updateBoard(userId: string, boardId: string, updates: Partial<Board>): Promise<Board> {
    const board = await this.getBoard(userId, boardId);
    
    if (board.userId !== userId) {
      throw new Error('Only the owner can update the board');
    }

    return this.boardRepository.update(boardId, updates);
  }

  async deleteBoard(userId: string, boardId: string): Promise<void> {
    const board = await this.getBoard(userId, boardId);
    
    if (board.userId !== userId) {
      throw new Error('Only the owner can delete the board');
    }

    await this.boardRepository.delete(boardId);
  }

  async addElement(
    userId: string,
    boardId: string,
    element: Omit<CanvasElement, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CanvasElement> {
    const board = await this.getBoard(userId, boardId);
    
    return this.boardRepository.addElement(boardId, element);
  }

  async updateElement(
    userId: string,
    boardId: string,
    elementId: string,
    updates: Partial<CanvasElement>
  ): Promise<CanvasElement> {
    const board = await this.getBoard(userId, boardId);
    
    return this.boardRepository.updateElement(boardId, elementId, updates);
  }

  async deleteElement(userId: string, boardId: string, elementId: string): Promise<void> {
    const board = await this.getBoard(userId, boardId);
    
    await this.boardRepository.deleteElement(boardId, elementId);
  }

  async searchBoards(userId: string, query: string): Promise<Board[]> {
    return this.boardRepository.search(query, userId);
  }

  async addCollaborator(
    userId: string,
    boardId: string,
    collaboratorId: string,
    role: 'viewer' | 'editor' | 'admin' = 'viewer'
  ): Promise<void> {
    const board = await this.getBoard(userId, boardId);
    
    if (board.userId !== userId) {
      throw new Error('Only the owner can add collaborators');
    }

    const collaborator = await this.userRepository.findById(collaboratorId);
    if (!collaborator) {
      throw new Error('Collaborator not found');
    }

    await this.boardRepository.addCollaborator(boardId, collaboratorId, role);
  }

  async removeCollaborator(
    userId: string,
    boardId: string,
    collaboratorId: string
  ): Promise<void> {
    const board = await this.getBoard(userId, boardId);
    
    if (board.userId !== userId) {
      throw new Error('Only the owner can remove collaborators');
    }

    await this.boardRepository.removeCollaborator(boardId, collaboratorId);
  }

  async exportBoard(userId: string, boardId: string, format: 'pdf' | 'png' | 'svg'): Promise<string> {
    const board = await this.getBoard(userId, boardId);
    
    // Implementation would depend on export service
    // This is a placeholder for the actual export logic
    throw new Error('Export functionality not implemented yet');
  }
}