'use client';

import { useState } from 'react';
import { ChevronLeft, Plus, Home, FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="font-semibold text-lg">BoardMe</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center"
            )}
          >
            <Plus className="h-4 w-4 mr-2" />
            {!isCollapsed && "New Board"}
          </Button>
        </div>

        <nav className="px-2">
          <SidebarItem icon={Home} label="Home" active isCollapsed={isCollapsed} />
          <SidebarItem icon={FileText} label="Pages" isCollapsed={isCollapsed} />
          <SidebarItem icon={Settings} label="Settings" isCollapsed={isCollapsed} />
        </nav>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  isCollapsed: boolean;
}

function SidebarItem({ icon: Icon, label, active, isCollapsed }: SidebarItemProps) {
  return (
    <div className={cn(
      "flex items-center px-2 py-2 rounded-md cursor-pointer transition-colors",
      active ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"
    )}>
      <Icon className="h-4 w-4" />
      {!isCollapsed && <span className="ml-3 text-sm">{label}</span>}
    </div>
  );
}