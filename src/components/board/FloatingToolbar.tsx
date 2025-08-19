'use client';

import { MousePointer2, Pen, Square, Type, Hand, ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingToolbarProps {
  currentTool: 'select' | 'pen' | 'rectangle' | 'text' | 'hand';
  onToolChange: (tool: 'select' | 'pen' | 'rectangle' | 'text' | 'hand') => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onResetZoom: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  hasSelection?: boolean;
}

export function FloatingToolbar({ 
  currentTool, 
  onToolChange, 
  zoom, 
  onZoomChange, 
  onResetZoom,
  onUndo,
  onRedo,
  onDelete,
  canUndo = false,
  canRedo = false,
  hasSelection = false
}: FloatingToolbarProps) {
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select (V)' },
    { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
    { id: 'pen', icon: Pen, label: 'Draw (P)' },
    { id: 'text', icon: Type, label: 'Text (T)' },
    { id: 'hand', icon: Hand, label: 'Pan (H)' },
  ] as const;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant="ghost"
              size="sm"
              onClick={() => onToolChange(tool.id)}
              className={cn(
                "p-2 hover:bg-gray-100",
                currentTool === tool.id && "bg-blue-100 text-blue-600"
              )}
              title={tool.label}
            >
              <tool.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 px-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
            className="p-2 hover:bg-gray-100"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetZoom}
            className="px-3 py-2 text-xs font-medium hover:bg-gray-100 min-w-[60px]"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onZoomChange(Math.min(5, zoom + 0.1))}
            className="p-2 hover:bg-gray-100"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Undo/Redo Controls */}
        <div className="flex items-center gap-1 border-l border-gray-200 pl-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "p-2 hover:bg-gray-100",
              !canUndo && "text-gray-300 cursor-not-allowed"
            )}
            title="Undo (Cmd+Z)"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className={cn(
              "p-2 hover:bg-gray-100",
              !canRedo && "text-gray-300 cursor-not-allowed"
            )}
            title="Redo (Cmd+Y)"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="flex items-center gap-1 border-l border-gray-200 pl-1">
          {hasSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="p-2 hover:bg-red-50 text-red-600"
              title="Delete selected (Delete)"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetZoom}
            className="p-2 hover:bg-gray-100"
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}