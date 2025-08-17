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
      {/* Header with close button only */}
      <div className="flex items-center justify-end p-4 border-b border-border">
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title and checkbox row */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={task.completed !== null}
            className={cn("w-4 h-4 text-primary rounded border-border focus:ring-primary",
              getPriorityCheckboxColor(task.priority))}
            onChange={useCallback(() =>
              onUpdateTask({ completed: task.completed ? null : new Date() }),
              [onUpdateTask, task.completed])}
          />
          <Input
            value={task.title}
            onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdateTask({ title: e.target.value }), [onUpdateTask])}
            className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0 bg-transparent flex-1"
          />
        </div>

        {/* Properties with left-aligned layout */}
        <div className="space-y-3">
          {/* Timeframe */}
          <div>
            <span className="text-sm text-muted-foreground">Timeframe</span>
            <div className="mt-1">
              <Select
                value={task.timeframe}
                onValueChange={useCallback((value: string) =>
                  onUpdateTask({ timeframe: value as Task["timeframe"] }), [onUpdateTask])}
              >
                <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                  <span className="text-sm font-medium text-foreground">
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
          </div>

          {/* Priority */}
          <div>
            <span className="text-sm text-muted-foreground">Priority</span>
            <div className="mt-1">
              <Select
                value={task.priority}
                onValueChange={useCallback((value: string) =>
                  onUpdateTask({ priority: value as Task["priority"] }), [onUpdateTask])}
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
          </div>

          {/* Area */}
          <div>
            <span className="text-sm text-muted-foreground">Area</span>
            <div className="mt-1">
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
          <div>
            <span className="text-sm text-muted-foreground">Project</span>
            <div className="mt-1">
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
          </div>

          {/* Due Date */}
          <div>
            <span className="text-sm text-muted-foreground">Due Date</span>
            <div className="mt-1">
              <TaskDateTimePicker
                date={task.dueDate}
                onDateChange={useCallback((date: Date | undefined) =>
                  onUpdateTask({ dueDate: date }), [onUpdateTask])}
                placeholder="Pick a date"
                align="start"
                side="left"
                allowClear={true}
              />
            </div>
          </div>

          {/* Completed Date (if task is completed) */}
          {task.completed !== null && (
            <div>
              <span className="text-sm text-muted-foreground">Completed</span>
              <div className="mt-1">
                <span className="text-sm font-medium text-foreground">
                  {formatDateTime(task.completed)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border my-4"></div>

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

        {/* Bottom row: Created and Task ID */}
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
