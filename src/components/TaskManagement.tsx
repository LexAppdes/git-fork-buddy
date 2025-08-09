import { useState, useEffect } from "react";
import { Calendar, Inbox, Clock, FolderOpen, ChevronDown, ChevronRight, Plus, MoreHorizontal, Filter, ArrowUpDown, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, isToday, isTomorrow, isAfter, startOfDay, isYesterday, differenceInDays } from "date-fns";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Badge } from "@/components/ui/badge";
import { ProjectManagement } from "@/components/ProjectManagement";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "urgent";
  completed: boolean;
  dueDate?: Date;
  area?: string;
  completedAt?: Date;
  timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY";
}

interface Area {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

const today = new Date();
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Review quarterly reports",
    priority: "urgent",
    completed: false,
    dueDate: today,
    area: "work",
    timeframe: "NOW"
  }
];

const mockAreas: Area[] = [
  {
    id: "work",
    name: "Work",
    color: "bg-primary",
    taskCount: 8
  }
];

export function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeView, setActiveView] = useState("today");

  const taskViews = [
    { id: "today", label: "Today", icon: Calendar, count: 6 },
    { id: "upcoming", label: "Upcoming", icon: Clock, count: 7 },
    { id: "areas", label: "Tasks by Area", icon: FolderOpen, count: 18 },
    { id: "projects", label: "Projects", icon: FolderOpen, count: 14 },
    { id: "inbox", label: "Inbox", icon: Inbox, count: 12 },
    { id: "completed", label: "Completed", icon: Calendar, count: 5 }
  ];

  const toggleTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => 
      task.id === taskId ? {
        ...task,
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : undefined
      } : task
    ));
  };

  const renderTaskList = (tasks: Task[]) => (
    <div className="space-y-3">
      {tasks.map(task => (
        <div key={task.id} className="bg-card border border-border rounded-lg p-4 shadow-soft">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <div className="flex-1">
                <h4 className={cn("font-medium text-card-foreground", task.completed && "line-through")}>
                  {task.title}
                </h4>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full bg-background">
      <div className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="font-bold text-foreground text-lg">Task Management</h1>
          <nav className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit">
            {taskViews.map(view => {
              const Icon = view.icon;
              const isActive = activeView === view.id;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {view.label}
                  <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                    {view.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-6 h-[calc(100%-140px)] overflow-auto">
        {activeView === "projects" ? (
          <ProjectManagement />
        ) : (
          <div className="max-w-4xl mx-auto">
            {renderTaskList(tasks)}
          </div>
        )}
      </div>
    </div>
  );
}