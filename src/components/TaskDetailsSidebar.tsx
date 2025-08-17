import { useCallback, useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SimpleDatePicker } from "@/components/ui/simple-date-picker";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "urgent";
  completed: Date | null;
  dueDate?: Date;
  timeInterval?: string; // time interval in HH:MM-HH:MM format
  area?: string;
  project?: string;
  step?: string;
  created: Date;
  timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY";
}

interface Project {
  id: string;
  title: string;
  area: string;
}

interface Area {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}

interface TaskDetailsSidebarProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdateTask: (updates: Partial<Task>) => void;
  projects: Project[];
  areas: Area[];
  getAreaFromProject: (projectId?: string) => string | undefined;
}

const formatDateTime = (date: Date) => {
  // Only show time if it's not midnight (00:00) or if there's an end time
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0 || (date as any).__endTime;

  if (hasTime) {
    const timeStr = format(date, "dd.MM.yyyy HH:mm");
    // Add end time if available
    if ((date as any).__endTime) {
      const endTime = (date as any).__endTime;
      return `${timeStr} - ${endTime.hour.toString().padStart(2, '0')}:${endTime.minute.toString().padStart(2, '0')}`;
    }
    return timeStr;
  } else {
    // Just show the date without time
    return format(date, "dd.MM.yyyy");
  }
};

const formatDueDateWithInterval = (date: Date, timeInterval?: string) => {
  const dateStr = format(date, "dd.MM.yyyy");
  if (timeInterval) {
    return `${dateStr} ${timeInterval}`;
  }
  return dateStr;
};

const getPriorityCheckboxColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "priority-checkbox checkbox-urgent";
    case "medium":
      return "priority-checkbox checkbox-medium";
    case "low":
      return "priority-checkbox checkbox-low";
    default:
      return "priority-checkbox checkbox-medium";
  }
};

const getTimeframeColor = (timeframe: string) => {
  switch (timeframe) {
    case "NOW":
      return "bg-red-500 text-white";
    case "NEXT":
      return "bg-amber-500 text-white";
    case "LATER":
      return "bg-blue-500 text-white";
    case "SOMEDAY":
      return "bg-green-500 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export function TaskDetailsSidebar({
  isOpen,
  task,
  onClose,
  onUpdateTask,
  projects,
  areas,
  getAreaFromProject
}: TaskDetailsSidebarProps) {
  const [activeTab, setActiveTab] = useState<"description" | "activity">("description");

  // Define all callbacks at the top level
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    onUpdateTask({ title: e.target.value }), [onUpdateTask]);

  const handleToggleComplete = useCallback(() =>
    onUpdateTask({ completed: task?.completed ? null : new Date() }),
    [onUpdateTask, task?.completed]);

  const handleTimeframeChange = useCallback((value: string) =>
    onUpdateTask({ timeframe: value as Task["timeframe"] }), [onUpdateTask]);

  const handlePriorityChange = useCallback((value: string) =>
    onUpdateTask({ priority: value as Task["priority"] }), [onUpdateTask]);

  const handleProjectChange = useCallback((value: string) => {
    const projectId = value === "none" ? undefined : value;
    const areaId = getAreaFromProject(projectId);
    onUpdateTask({
      project: projectId,
      area: areaId
    });
  }, [onUpdateTask, getAreaFromProject]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) =>
    onUpdateTask({ description: e.target.value }), [onUpdateTask]);

  const handleDueDateChange = useCallback((date: Date | undefined) =>
    onUpdateTask({ dueDate: date }), [onUpdateTask]);

  if (!isOpen || !task) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-border z-50 overflow-hidden flex flex-col">
      {/* Header with close button only */}
      <div className="flex items-center justify-end p-3 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="flex-shrink-0 p-1"
        >
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F0ff7feed0287480faa22906cf0d03d18%2F9fed35037c8942f2aa181ae25d26611c?format=webp&width=800"
            alt="Close"
            className="w-5 h-5"
          />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {/* Title and checkbox row */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            checked={task.completed !== null}
            className={cn("w-4 h-4 text-primary rounded border-border focus:ring-primary",
              getPriorityCheckboxColor(task.priority))}
            onChange={handleToggleComplete}
          />
          <Input
            value={task.title}
            onChange={handleTitleChange}
            className="text-lg leading-[22px] font-semibold border-none p-0 h-auto focus-visible:ring-0 bg-transparent flex-1"
          />
        </div>

        {/* Properties with horizontal layout */}
        <div className="space-y-3 mb-4">
          {/* Timeframe */}
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground w-20">Timeframe</span>
            <Select
              value={task.timeframe}
              onValueChange={handleTimeframeChange}
            >
              <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                <span className={cn("text-xs px-2 py-1 rounded font-medium uppercase", getTimeframeColor(task.timeframe))}>
                  {task.timeframe}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOW">NOW</SelectItem>
                <SelectItem value="NEXT">NEXT</SelectItem>
                <SelectItem value="LATER">LATER</SelectItem>
                <SelectItem value="SOMEDAY">SOMEDAY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground w-20">Priority</span>
            <Select
              value={task.priority}
              onValueChange={handlePriorityChange}
            >
              <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F871cdad99f0e4f7383e2724856d9c17b%2F63cf4952854846e5994e15d4c2b9fc7e?format=webp&width=800"
                  alt="Priority flag"
                  className="w-5 h-5"
                  style={{
                    filter: task.priority === "urgent"
                      ? "brightness(0) saturate(100%) invert(18%) sepia(95%) saturate(7434%) hue-rotate(2deg) brightness(102%) contrast(107%)"
                      : task.priority === "medium"
                      ? "brightness(0) saturate(100%) invert(70%) sepia(70%) saturate(421%) hue-rotate(13deg) brightness(104%) contrast(94%)"
                      : "brightness(0) saturate(100%) invert(47%) sepia(96%) saturate(1288%) hue-rotate(204deg) brightness(97%) contrast(94%)"
                  }}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F871cdad99f0e4f7383e2724856d9c17b%2F63cf4952854846e5994e15d4c2b9fc7e?format=webp&width=800"
                      alt="Low priority"
                      className="w-4 h-4"
                      style={{
                        filter: "brightness(0) saturate(100%) invert(47%) sepia(96%) saturate(1288%) hue-rotate(204deg) brightness(97%) contrast(94%)"
                      }}
                    />
                    <span>Low</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F871cdad99f0e4f7383e2724856d9c17b%2F63cf4952854846e5994e15d4c2b9fc7e?format=webp&width=800"
                      alt="Medium priority"
                      className="w-4 h-4"
                      style={{
                        filter: "brightness(0) saturate(100%) invert(70%) sepia(70%) saturate(421%) hue-rotate(13deg) brightness(104%) contrast(94%)"
                      }}
                    />
                    <span>Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F871cdad99f0e4f7383e2724856d9c17b%2F63cf4952854846e5994e15d4c2b9fc7e?format=webp&width=800"
                      alt="High priority"
                      className="w-4 h-4"
                      style={{
                        filter: "brightness(0) saturate(100%) invert(18%) sepia(95%) saturate(7434%) hue-rotate(2deg) brightness(102%) contrast(107%)"
                      }}
                    />
                    <span>High</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Area */}
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground w-20">Area</span>
            <div>
              {getAreaFromProject(task.project) ? (
                <span className={cn(
                  "text-xs text-white px-2 py-1 rounded",
                  areas.find(a => a.id === getAreaFromProject(task.project))?.color || "bg-muted"
                )}>
                  {areas.find(a => a.id === getAreaFromProject(task.project))?.name}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">No area</span>
              )}
            </div>
          </div>

          {/* Project */}
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground w-20">Project</span>
            <Select
              value={task.project || "none"}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                <span className="text-sm font-medium text-foreground">
                  {task.project ? projects.find(p => p.id === task.project)?.title || 'Unknown Project' : 'No project'}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground w-20">Due Date</span>
            <SimpleDatePicker
              date={task.dueDate}
              onDateChange={handleDueDateChange}
              align="start"
              side="left"
            >
              <span className="text-sm font-medium text-foreground cursor-pointer hover:text-primary">
                {task.dueDate ? formatDueDateWithInterval(task.dueDate, task.timeInterval) : 'No due date'}
              </span>
            </SimpleDatePicker>
          </div>

          {/* Completed Date (if task is completed) */}
          {task.completed !== null && (
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground w-20">Completed</span>
              <span className="text-sm font-medium text-foreground">
                {formatDateTime(task.completed)}
              </span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-4"></div>

        {/* Tabs */}
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab("description")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "description"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "activity"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 mb-4">
          {activeTab === "description" ? (
            <Textarea
              value={task.description || ""}
              onChange={handleDescriptionChange}
              rows={3}
              className="min-h-[100px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 py-0"
            />
          ) : (
            <div className="text-sm text-muted-foreground">
              Activity feed coming soon...
            </div>
          )}
        </div>

        {/* Bottom row: Created and Task ID - Fixed at bottom */}
        <div className="flex items-center justify-between pt-4 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">Created</span>
            <span className="text-xs text-muted-foreground">
              {formatDateTime(task.created)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-medium text-foreground">Task ID</span>
            <code className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-mono">
              {task.id}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
