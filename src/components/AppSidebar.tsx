import { useState } from "react";
import { 
  Menu, 
  Search, 
  BookOpen, 
  Home, 
  StickyNote, 
  Tag, 
  CheckSquare, 
  Bookmark 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sidebarItems = [
  { id: "journal", label: "Journal", icon: BookOpen },
  { id: "home", label: "Home", icon: Home },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "tags", label: "Tags", icon: Tag },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "highlights", label: "Highlights", icon: Bookmark },
];

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "bg-[#F6F4F1] min-h-screen flex flex-col transition-all duration-300",
        isCollapsed ? "w-14" : "w-[215px]"
      )}
    >
      {/* Header with controls */}
      <div className="p-3">
        <div className={cn(
          "flex items-center",
          isCollapsed ? "flex-col gap-2" : "gap-2"
        )}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {!isCollapsed && (
            <button
              className="p-2 hover:bg-black/5 rounded-lg transition-colors flex-1 flex items-center justify-center"
              title="Search"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {isCollapsed && (
            <button
              className="p-2 hover:bg-black/5 rounded-lg transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center rounded-lg text-left transition-all duration-200",
                    isCollapsed
                      ? "justify-center p-2.5"
                      : "gap-3 px-3 py-2.5",
                    isActive
                      ? "bg-orange-500 text-white"
                      : "text-gray-700 hover:bg-black/5"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
