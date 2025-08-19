'use client';

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function ZoomControls({ zoom, onZoomChange }: ZoomControlsProps) {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom * 1.2, 5));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom / 1.2, 0.1));
  };

  const handleResetZoom = () => {
    onZoomChange(1);
  };

  return (
    <div className="flex gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        className="p-2"
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleResetZoom}
        className="px-3 text-sm font-medium"
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        className="p-2"
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  );
}