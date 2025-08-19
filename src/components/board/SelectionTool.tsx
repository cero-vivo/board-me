'use client';

import { useState } from 'react';
import { CanvasElement } from '@/types/board';

interface SelectionToolProps {
  elements: CanvasElement[];
  selectedElements: string[];
  onSelectionChange: (ids: string[]) => void;
}

export function SelectionTool({ elements, selectedElements, onSelectionChange }: SelectionToolProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Selection logic will be implemented here
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Selection logic will be implemented here
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  return (
    <div
      className="absolute inset-0"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Selection box rendering */}
      {isSelecting && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-30"
          style={{
            left: selectionBox.x,
            top: selectionBox.y,
            width: selectionBox.width,
            height: selectionBox.height,
          }}
        />
      )}
    </div>
  );
}