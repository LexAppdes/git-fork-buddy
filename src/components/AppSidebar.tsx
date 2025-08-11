import { useState } from "react";
import { StickyNote, PenTool, CheckSquare, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sidebarItems = [
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "whiteboards", label: "Whiteboards", icon: PenTool },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
];

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  return (
    <div className="w-64 bg-sidebar-bg border-r border-border min-h-screen flex flex-col">
      <div className="p-6 bg-[#f3f3f3]">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Planner
        </h1>
      </div>

      <nav className="flex-1 p-4 bg-[#f3f3f3]">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-medium"
                      : "text-foreground hover:bg-sidebar-hover hover:text-primary"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
