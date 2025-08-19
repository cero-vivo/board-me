'use client';

import { useRef, useState, useEffect } from 'react';
import { useBoard } from '@/hooks/useBoard';
import { CanvasElement } from '@/types/board';
import { FloatingToolbar } from './FloatingToolbar';

export function BoardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'select' | 'pen' | 'rectangle' | 'text' | 'hand'>('select');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const { elements, addElement, updateElement, deleteElement } = useBoard();

  // Initialize history on first load
  useEffect(() => {
    if (elements.length > 0 && history.length === 0) {
      setHistory([elements]);
      setHistoryIndex(0);
    }
  }, [elements, history.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw all elements
    elements.forEach(element => {
      drawElement(ctx, element);
    });

    // Draw current element being created
    if (currentElement) {
      drawElement(ctx, currentElement);
    }

    ctx.restore();
  }, [elements, zoom, pan, currentElement]);



  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Handle Cmd+Z/Ctrl+Z and Cmd+Y/Ctrl+Y
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              // Redo: Cmd+Shift+Z
              redo();
            } else {
              // Undo: Cmd+Z
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            // Redo: Cmd+Y
            redo();
            break;
        }
        return;
      }

      // Handle Delete key for selected elements
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelected();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setTool('select');
          break;
        case 'r':
          setTool('rectangle');
          break;
        case 'p':
          setTool('pen');
          break;
        case 't':
          setTool('text');
          break;
        case 'h':
          setTool('hand');
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElements, elements]);

  const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    const isSelected = selectedElements.includes(element.id);
    
    switch (element.type) {
      case 'rectangle':
        ctx.fillStyle = element.fill || '#3b82f6';
        ctx.fillRect(element.x, element.y, element.width, element.height);
        if (isSelected) {
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);
        }
        break;
      case 'text':
        ctx.font = '16px sans-serif';
        ctx.fillStyle = element.fill || '#1f2937';
        ctx.fillText(element.text || '', element.x, element.y);
        if (isSelected) {
          const textWidth = ctx.measureText(element.text || '').width;
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2;
          ctx.strokeRect(element.x - 2, element.y - 16, textWidth + 4, 20);
        }
        break;
      case 'pen':
        if (element.points && element.points.length > 1) {
          ctx.strokeStyle = element.stroke || '#3b82f6';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          element.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
          if (isSelected) {
            // Draw selection outline for pen strokes
            const minX = Math.min(...element.points.map(p => p.x));
            const maxX = Math.max(...element.points.map(p => p.x));
            const minY = Math.min(...element.points.map(p => p.y));
            const maxY = Math.max(...element.points.map(p => p.y));
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10);
            ctx.setLineDash([]);
          }
        }
        break;
    }
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  };

  const saveToHistory = (currentElements: CanvasElement[]) => {
    const newHistory = [...history.slice(0, historyIndex + 1), [...currentElements]];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousState = history[newIndex];
      // Clear all current elements and add previous state
      elements.forEach(el => deleteElement(el.id));
      previousState.forEach(el => addElement(el));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = history[newIndex];
      // Clear all current elements and add next state
      elements.forEach(el => deleteElement(el.id));
      nextState.forEach(el => addElement(el));
    }
  };

  const isPointInElement = (point: { x: number; y: number }, element: CanvasElement) => {
    switch (element.type) {
      case 'rectangle':
        return (
          point.x >= element.x &&
          point.x <= element.x + element.width &&
          point.y >= element.y &&
          point.y <= element.y + element.height
        );
      case 'text':
        // Approximate text bounds
        return (
          point.x >= element.x &&
          point.x <= element.x + 100 && // Approximate width
          point.y >= element.y - 16 &&
          point.y <= element.y + 4
        );
      case 'pen':
        if (!element.points || element.points.length === 0) return false;
        // Check if point is near any stroke point
        const threshold = 10;
        return element.points.some(p => 
          Math.abs(p.x - point.x) < threshold && Math.abs(p.y - point.y) < threshold
        );
      default:
        return false;
    }
  };

  const getElementAtPoint = (point: { x: number; y: number }) => {
    // Check elements in reverse order (top to bottom)
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (isPointInElement(point, element)) {
        return element;
      }
    }
    return null;
  };

  const handleDeleteSelected = () => {
    if (selectedElements.length > 0) {
      const remainingElements = elements.filter(el => !selectedElements.includes(el.id));
      saveToHistory(remainingElements);
      selectedElements.forEach(id => deleteElement(id));
      setSelectedElements([]);
    }
  };

  const [textInput, setTextInput] = useState({
    visible: false,
    x: 0,
    y: 0,
    value: ''
  });

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'text') return;

    const { x, y } = getCanvasCoordinates(e);
    setTextInput({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      value: ''
    });
  };

  const handleTextSubmit = () => {
    if (textInput.value.trim()) {
      const { x, y } = getCanvasCoordinates({
        clientX: textInput.x,
        clientY: textInput.y
      } as React.MouseEvent<HTMLCanvasElement>);
      
      addElement({
        id: Date.now().toString(),
        type: 'text',
        x,
        y,
        width: 100,
        height: 20,
        text: textInput.value,
        fill: '#1f2937'
      });
      saveToHistory([...elements, {
        id: Date.now().toString(),
        type: 'text',
        x,
        y,
        width: 100,
        height: 20,
        text: textInput.value,
        fill: '#1f2937'
      }]);
    }
    setTextInput({ visible: false, x: 0, y: 0, value: '' });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e);

    if (tool === 'hand') {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (tool === 'select') {
      const clickedElement = getElementAtPoint({ x, y });
      if (clickedElement) {
        if (e.shiftKey) {
          // Add to selection with Shift
          setSelectedElements(prev => 
            prev.includes(clickedElement.id) 
              ? prev.filter(id => id !== clickedElement.id)
              : [...prev, clickedElement.id]
          );
        } else {
          // Single selection
          setSelectedElements([clickedElement.id]);
        }
      } else {
        // Clear selection when clicking empty space
        if (!e.shiftKey) {
          setSelectedElements([]);
        }
      }
      return;
    }
    
    setIsDrawing(true);
    
    const newElement: CanvasElement = {
      id: Date.now().toString(),
      type: tool as 'rectangle' | 'pen',
      x,
      y,
      width: 0,
      height: 0,
      fill: tool === 'rectangle' ? '#3b82f6' : undefined,
      stroke: tool === 'pen' ? '#3b82f6' : '#1f2937',
      strokeWidth: 2,
      points: tool === 'pen' ? [{ x, y }] : undefined
    };
    
    setCurrentElement(newElement);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing || !currentElement) return;

    const { x, y } = getCanvasCoordinates(e);

    if (tool === 'rectangle') {
      const width = x - currentElement.x;
      const height = y - currentElement.y;
      setCurrentElement(prev => prev ? { ...prev, width, height } : null);
    } else if (tool === 'pen' && currentElement.points) {
      setCurrentElement(prev => prev ? {
        ...prev,
        points: [...(prev.points || []), { x, y }]
      } : null);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (currentElement && isDrawing) {
      if (currentElement.type === 'rectangle' && (currentElement.width > 5 || currentElement.height > 5)) {
        addElement(currentElement);
        saveToHistory([...elements, currentElement]);
      } else if (currentElement.type === 'pen' && currentElement.points && currentElement.points.length > 1) {
        addElement(currentElement);
        saveToHistory([...elements, currentElement]);
      }
    }
    
    setIsDrawing(false);
    setCurrentElement(null);
  };

  const getCursorStyle = () => {
    switch (tool) {
      case 'select': return 'cursor-default';
      case 'pen': return 'cursor-crosshair';
      case 'rectangle': return 'cursor-crosshair';
      case 'text': return 'cursor-text';
      case 'hand': return isPanning ? 'cursor-grabbing' : 'cursor-grab';
      default: return 'cursor-default';
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-hidden">
      <FloatingToolbar 
        currentTool={tool} 
        onToolChange={setTool}
        zoom={zoom}
        onZoomChange={setZoom}
        onResetZoom={() => {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        }}
        onUndo={undo}
        onRedo={redo}
        onDelete={handleDeleteSelected}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        hasSelection={selectedElements.length > 0}
      />

      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${getCursorStyle()}`}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={(e) => {
          e.preventDefault();
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;

          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          
          const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
          const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
          
          // Zoom towards mouse position
          const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
          const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);
          
          setZoom(newZoom);
          setPan({ x: newPanX, y: newPanY });
        }}
      />

      {/* Text Input Overlay */}
      {textInput.visible && (
        <div 
          className="absolute z-50 bg-white border border-gray-300 rounded shadow-lg p-2"
          style={{ left: textInput.x, top: textInput.y }}
        >
          <input
            type="text"
            value={textInput.value}
            onChange={(e) => setTextInput(prev => ({ ...prev, value: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTextSubmit();
              if (e.key === 'Escape') setTextInput({ visible: false, x: 0, y: 0, value: '' });
            }}
            placeholder="Enter text..."
            className="px-2 py-1 border-none outline-none text-sm"
            autoFocus
          />
          <div className="flex gap-1 mt-1">
            <button onClick={handleTextSubmit} className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
              Add
            </button>
            <button onClick={() => setTextInput({ visible: false, x: 0, y: 0, value: '' })} className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Tooltip */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 text-xs text-gray-600">
        <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
        <div>V: Select | R: Rectangle | P: Pen | T: Text | H: Hand</div>
        <div>Cmd+Z: Undo | Cmd+Y: Redo | Delete: Remove selected</div>
        <div>Shift+Click: Multi-select | Mouse wheel: Zoom</div>
      </div>
    </div>
  );
}