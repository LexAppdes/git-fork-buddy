import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { InlineDateTimePicker } from "@/components/ui/date-time-picker";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { isBefore, startOfDay } from "date-fns";
import { Folder, Calendar as CalendarIcon } from "lucide-react";


interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "urgent";
  completed: Date | null; // null = not completed, Date = completion timestamp
  cancelled: Date | null; // null = not cancelled, Date = cancellation timestamp
  dueDate?: Date;
  area?: string;
  project?: string;
  created: Date; // automatically set when task is created
  timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY";
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  selectedTask?: Task | null;
  onToggleTask: (taskId: string) => void;
  onUpdateTaskTimeframe: (
    taskId: string,
    timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY"
  ) => void;
  onUpdateTaskDueDate?: (taskId: string, date: Date | undefined) => void;
  areas: Array<{
    id: string;
    name: string;
    color: string;
    taskCount: number;
  }>;
  selectedAreas?: string[];
  projects?: Array<{
    id: string;
    title: string;
    area: string;
  }>;
  onProjectAssignment?: (task: Task, projectId: string) => void;
}

const getPriorityCheckboxColor = (priority: string, cancelled: boolean = false) => {
  const baseClasses = cancelled ? "cancelled" : "";
  switch (priority) {
    case "urgent":
      return `priority-checkbox checkbox-urgent ${baseClasses}`.trim();
    case "medium":
      return `priority-checkbox checkbox-medium ${baseClasses}`.trim();
    case "low":
      return `priority-checkbox checkbox-low ${baseClasses}`.trim();
    default:
      return `priority-checkbox checkbox-medium ${baseClasses}`.trim();
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

const formatSimpleDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
};

const isTaskOverdue = (task: Task) => {
  if (!task.dueDate || task.completed !== null || task.cancelled !== null) return false;
  return isBefore(task.dueDate, startOfDay(new Date()));
};

const ClickableDueDate = ({
  date,
  taskId,
  onDateChange,
  className = "text-xs text-muted-foreground"
}: {
  date: Date;
  taskId: string;
  onDateChange?: (taskId: string, date: Date | undefined) => void;
  className?: string;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!onDateChange) {
    return <span className={className}>{formatSimpleDate(date)}</span>;
  }

  return (
    <InlineDateTimePicker
      date={date}
      onDateChange={(newDate) => onDateChange(taskId, newDate)}
      align="start"
      showTime={false}
      allowClear={true}
    >
      <span
        className={cn("cursor-pointer hover:text-foreground transition-colors", className)}
        onClick={handleClick}
      >
        {formatSimpleDate(date)}
      </span>
    </InlineDateTimePicker>
  );
};

const TaskCard = ({
  task,
  onTaskClick,
  onToggleTask,
  onUpdateTaskDueDate,
  areas,
  projects,
  onProjectAssignment,
  selectedTask
}: {
  task: Task;
  onTaskClick: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTaskDueDate?: (taskId: string, date: Date | undefined) => void;
  areas: any[];
  projects?: Array<{
    id: string;
    title: string;
    area: string;
  }>;
  onProjectAssignment?: (task: Task, projectId: string) => void;
  selectedTask?: Task | null;
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", task.id);
  };

  const getAreaFromProject = (projectId?: string) => {
    if (!projectId) return undefined;
    const project = projects?.find(p => p.id === projectId);
    return project?.area;
  };

  return (
    <div
      className={cn("bg-card rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer mb-2", (task.completed !== null || task.cancelled !== null) && "opacity-60", selectedTask?.id === task.id && "bg-primary/10 border border-primary/20")}
      onClick={() => onTaskClick(task)}
      draggable
      onDragStart={handleDragStart}
    >
      <div className="flex items-center gap-3 mb-2">
        <input
          type="checkbox"
          checked={task.completed !== null || task.cancelled !== null}
          className={cn("w-4 h-4 text-primary rounded border-border focus:ring-primary", getPriorityCheckboxColor(task.priority, task.cancelled !== null))}
          onChange={() => onToggleTask(task.id)}
          onClick={e => e.stopPropagation()}
        />
        <div className="flex-1">
          <h4 className={cn("text-card-foreground text-sm", (task.completed !== null || task.cancelled !== null) && "line-through")}>
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          {task.dueDate ? (
            <ClickableDueDate
              date={task.dueDate}
              taskId={task.id}
              onDateChange={onUpdateTaskDueDate}
              className={cn("text-xs text-muted-foreground", isTaskOverdue(task) && "text-red-500")}
            />
          ) : (
            <InlineDateTimePicker
              date={task.dueDate}
              onDateChange={(date) => {
                if (onUpdateTaskDueDate) {
                  onUpdateTaskDueDate(task.id, date);
                }
              }}
              align="start"
              showTime={false}
              allowClear={true}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <CalendarIcon className="w-3 h-3 text-muted-foreground" />
              </Button>
            </InlineDateTimePicker>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getAreaFromProject(task.project) && (
              <span className={cn("text-xs text-white px-2 py-1 rounded", areas.find(a => a.id === getAreaFromProject(task.project))?.color || "bg-muted")}>
                {areas.find(a => a.id === getAreaFromProject(task.project))?.name}
              </span>
            )}
          </div>
          <div className="flex items-center">
            {task.project ? (
              <span className="text-xs text-gray-500">
                {projects?.find(p => p.id === task.project)?.title || 'Project'}
              </span>
            ) : (
              <Select
                value="none"
                onValueChange={(value) => {
                  if (onProjectAssignment) {
                    // Call the project assignment with the task and new project value
                    onProjectAssignment(task, value);
                  }
                }}
              >
                <SelectTrigger
                  className="h-5 w-5 p-0 border-none bg-transparent hover:bg-muted rounded flex items-center justify-center [&_svg:last-child]:hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Folder className="w-3 h-3 text-muted-foreground" />
                </SelectTrigger>
                <SelectContent onClick={(e) => e.stopPropagation()}>
                  <SelectItem value="none">No project</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const KanbanColumn = ({
  timeframe,
  tasks,
  onTaskClick,
  onToggleTask,
  onUpdateTaskTimeframe,
  onUpdateTaskDueDate,
  areas,
  projects,
  onProjectAssignment,
  selectedTask
}: {
  timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY";
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onToggleTask: (taskId: string) => void;
  onUpdateTaskTimeframe: (taskId: string, timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY") => void;
  onUpdateTaskDueDate?: (taskId: string, date: Date | undefined) => void;
  areas: any[];
  projects?: Array<{
    id: string;
    title: string;
    area: string;
  }>;
  onProjectAssignment?: (task: Task, projectId: string) => void;
  selectedTask?: Task | null;
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

  return (
    <div 
      className={cn("flex-1 min-w-0 bg-[#f3f3f3] rounded-lg transition-colors", getColumnColor(), isDragOver && "bg-muted/50")} 
      onDragOver={handleDragOver} 
      onDragLeave={handleDragLeave} 
      onDrop={handleDrop}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{timeframe}</h3>
          <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
            {tasks.length}
          </span>
        </div>
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
              onToggleTask={onToggleTask}
              onUpdateTaskDueDate={onUpdateTaskDueDate}
              areas={areas}
              projects={projects}
              onProjectAssignment={onProjectAssignment}
              selectedTask={selectedTask}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export function KanbanBoard({
  tasks,
  onTaskClick,
  onToggleTask,
  onUpdateTaskTimeframe,
  onUpdateTaskDueDate,
  areas,
  selectedAreas: controlledSelectedAreas,
  projects,
  onProjectAssignment,
  selectedTask,
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
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId) 
        : [...prev, areaId]
    );
  };

  return (
    <div className="h-full w-full bg-[#fafafa] p-4 border border-[#21222c]/0">
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
        {timeframes.map(timeframe => (
          <KanbanColumn
            key={timeframe}
            timeframe={timeframe}
            tasks={tasksByTimeframe[timeframe] || []}
            onTaskClick={onTaskClick}
            onToggleTask={onToggleTask}
            onUpdateTaskTimeframe={onUpdateTaskTimeframe}
            onUpdateTaskDueDate={onUpdateTaskDueDate}
            areas={areas}
            projects={projects}
            onProjectAssignment={onProjectAssignment}
            selectedTask={selectedTask}
          />
        ))}
      </div>
    </div>
  );
}
