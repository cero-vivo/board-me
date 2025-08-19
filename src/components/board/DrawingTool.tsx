'use client';

import { MousePointer2, Pen, Square, Type, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DrawingToolProps {
  currentTool: 'select' | 'pen' | 'rectangle' | 'text' | 'hand';
  onToolChange: (tool: 'select' | 'pen' | 'rectangle' | 'text' | 'hand') => void;
}

export function DrawingTool({ currentTool, onToolChange }: DrawingToolProps) {
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'hand', icon: Hand, label: 'Hand' },
  ] as const;

  return (
    <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
      {tools.map((tool) => (
        <Button
          key={tool.id}
          variant="ghost"
          size="sm"
          onClick={() => onToolChange(tool.id)}
          className={cn(
            "p-2",
            currentTool === tool.id && "bg-blue-100 text-blue-600"
          )}
          title={tool.label}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}