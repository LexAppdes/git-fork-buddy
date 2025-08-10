import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
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
interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTaskTimeframe: (
    taskId: string,
    timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY"
  ) => void;
  areas: Array<{
    id: string;
    name: string;
    color: string;
    taskCount: number;
  }>;
  selectedAreas?: string[];
}
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "border-l-red-500";
    case "medium":
      return "border-l-amber-500";
    case "low":
      return "border-l-green-500";
    default:
      return "border-l-border";
  }
};
const formatTaskDate = (date: Date) => {
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return "Today";
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};
const TaskCard = ({
  task,
  onTaskClick,
  onToggleTask,
  areas
}: {
  task: Task;
  onTaskClick: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  areas: any[];
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id);
  };
  return <div className={cn("bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 cursor-pointer mb-2", getPriorityColor(task.priority), task.completed && "opacity-60")} onClick={() => onTaskClick(task)} draggable onDragStart={handleDragStart}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <input type="checkbox" checked={task.completed} className="mt-1 w-4 h-4 text-primary rounded border-border focus:ring-primary" onChange={() => onToggleTask(task.id)} onClick={e => e.stopPropagation()} />
          <div className="flex-1">
            <h4 className={cn("font-medium text-card-foreground text-sm", task.completed && "line-through")}>
              {task.title}
            </h4>
            {task.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {task.dueDate && <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                  {formatTaskDate(task.dueDate)}
                </span>}
              {task.area && <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                  {areas.find(a => a.id === task.area)?.name}
                </span>}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-6 w-6 p-0" onClick={e => e.stopPropagation()}>
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </div>
    </div>;
};
const KanbanColumn = ({
  timeframe,
  tasks,
  onTaskClick,
  onToggleTask,
  onUpdateTaskTimeframe,
  areas
}: {
  timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY";
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTaskTimeframe: (taskId: string, timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY") => void;
  areas: any[];
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    onUpdateTaskTimeframe(taskId, timeframe);
  };
  const getColumnColor = () => {
    switch (timeframe) {
      case "NOW":
        return "border-t-red-500";
      case "NEXT":
        return "border-t-amber-500";
      case "LATER":
        return "border-t-blue-500";
      case "SOMEDAY":
        return "border-t-green-500";
      default:
        return "border-t-border";
    }
  };
  return <div className={cn("flex-1 min-w-0 bg-[#f3f3f3] rounded-lg transition-colors", getColumnColor(), isDragOver && "bg-muted/50")} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{timeframe}</h3>
          <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
            {tasks.length}
          </span>
        </div>
        <div className="space-y-2">
          {tasks.map(task => <TaskCard key={task.id} task={task} onTaskClick={onTaskClick} onToggleTask={onToggleTask} areas={areas} />)}
        </div>
      </div>
    </div>;
};
export function KanbanBoard({
  tasks,
  onTaskClick,
  onToggleTask,
  onUpdateTaskTimeframe,
  areas,
  selectedAreas: controlledSelectedAreas,
}: KanbanBoardProps) {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const timeframes = ["NOW", "NEXT", "LATER", "SOMEDAY"] as const;

  // Use controlled selected areas if provided
  const effectiveSelectedAreas = controlledSelectedAreas ?? selectedAreas;

  // Filter tasks based on selected areas
  const filteredTasks =
    effectiveSelectedAreas.length === 0
      ? tasks
      : tasks.filter(
          (task) => task.area && effectiveSelectedAreas.includes(task.area)
        );

  // Group filtered tasks by timeframe
  const tasksByTimeframe = filteredTasks.reduce((acc, task) => {
    if (!acc[task.timeframe]) {
      acc[task.timeframe] = [];
    }
    acc[task.timeframe].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev => prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]);
  };
  return <div className="h-full w-full bg-[#fafafa] p-4 border border-[#21222c]/0">
      {/* Tags - aligned left in top controls */}
      {controlledSelectedAreas === undefined && (
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            {areas.map((area) => (
              <Badge
                key={area.id}
                variant={selectedAreas.includes(area.id) ? "default" : "outline"}
                onClick={() => toggleArea(area.id)}
                className="cursor-pointer hover:opacity-80 transition-opacity bg-white"
              >
                {area.name} ({area.taskCount})
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 h-full">
        {timeframes.map(timeframe => <KanbanColumn key={timeframe} timeframe={timeframe} tasks={tasksByTimeframe[timeframe] || []} onTaskClick={onTaskClick} onToggleTask={onToggleTask} onUpdateTaskTimeframe={onUpdateTaskTimeframe} areas={areas} />)}
      </div>
    </div>;
}
