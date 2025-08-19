import { BoardCanvas } from '@/components/board/BoardCanvas';
import { AuthProvider } from '@/contexts/AuthContext';
import { BoardProvider } from '@/contexts/BoardContext';

export default function Home() {
  return (
    <AuthProvider>
      <BoardProvider>
        <div className="h-screen bg-gray-50">
          <BoardCanvas />
        </div>
      </BoardProvider>
    </AuthProvider>
  );
}
