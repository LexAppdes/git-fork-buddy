import { useCallback } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskDateTimePicker } from "@/components/ui/improved-date-time-picker";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "urgent";
  completed: Date | null;
  dueDate?: Date;
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
  return format(date, "dd.MM.yyyy HH:mm");
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

export function TaskDetailsSidebar({
  isOpen,
  task,
  onClose,
  onUpdateTask,
  projects,
  areas,
  getAreaFromProject
}: TaskDetailsSidebarProps) {
  if (!isOpen || !task) {
    return null;
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-border z-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Input
            value={task.title}
            onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => 
              onUpdateTask({ title: e.target.value }), [onUpdateTask])}
            className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
          />
        </div>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Status and Priority Row */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.completed !== null}
              className={cn("w-4 h-4 text-primary rounded border-border focus:ring-primary", 
                getPriorityCheckboxColor(task.priority))}
              onChange={useCallback(() => 
                onUpdateTask({ completed: task.completed ? null : new Date() }), 
                [onUpdateTask, task.completed])}
            />
            <span className="text-sm font-medium">
              {task.completed !== null ? "Completed" : "Pending"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Priority:</span>
            <Select
              value={task.priority}
              onValueChange={useCallback((value: string) => 
                onUpdateTask({ priority: value as Task["priority"] }), [onUpdateTask])}
            >
              <SelectTrigger className="w-24 h-7">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
          <Textarea
            value={task.description || ""}
            onChange={useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => 
              onUpdateTask({ description: e.target.value }), [onUpdateTask])}
            placeholder="Enter task description"
            rows={3}
          />
        </div>

        {/* Due Date */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Due Date</h4>
          <TaskDateTimePicker
            date={task.dueDate}
            onDateChange={useCallback((date: Date | undefined) => 
              onUpdateTask({ dueDate: date }), [onUpdateTask])}
            placeholder="Pick a date"
            align="center"
            side="left"
            allowClear={true}
          />
        </div>

        {/* Timeframe */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Timeframe</h4>
          <Select
            value={task.timeframe}
            onValueChange={useCallback((value: string) => 
              onUpdateTask({ timeframe: value as Task["timeframe"] }), [onUpdateTask])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NOW">Now</SelectItem>
              <SelectItem value="NEXT">Next</SelectItem>
              <SelectItem value="LATER">Later</SelectItem>
              <SelectItem value="SOMEDAY">Someday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Project */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Project</h4>
          <Select
            value={task.project || "none"}
            onValueChange={useCallback((value: string) => {
              const projectId = value === "none" ? undefined : value;
              const areaId = getAreaFromProject(projectId);
              onUpdateTask({
                project: projectId,
                area: areaId
              });
            }, [onUpdateTask, getAreaFromProject])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project" />
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

        {/* Area (read-only, derived from project) */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Area</h4>
          <div className="flex items-center gap-2">
            {getAreaFromProject(task.project) ? (
              <span className={cn(
                "text-xs text-white px-2 py-1 rounded",
                areas.find(a => a.id === getAreaFromProject(task.project))?.color || "bg-muted"
              )}>
                {areas.find(a => a.id === getAreaFromProject(task.project))?.name}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">No area (no project assigned)</span>
            )}
          </div>
        </div>

        {/* Created Date */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Created</h4>
          <span className="text-sm text-muted-foreground">
            {formatDateTime(task.created)}
          </span>
        </div>

        {/* Completed Date */}
        {task.completed !== null && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Completed</h4>
            <span className="text-sm text-muted-foreground">
              {formatDateTime(task.completed)}
            </span>
          </div>
        )}

        {/* Task ID */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Task ID</h4>
          <code className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-mono">
            {task.id}
          </code>
        </div>
      </div>
    </div>
  );
}
