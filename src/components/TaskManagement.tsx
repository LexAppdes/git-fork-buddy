import { useState, useEffect } from "react";
import { Calendar, Inbox, Clock, FolderOpen, ChevronDown, ChevronRight, Plus, Filter, ArrowUpDown, CalendarIcon, Folder } from "lucide-react";
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
import { format, isToday, isTomorrow, isAfter, startOfDay, endOfDay, isYesterday, differenceInDays, isBefore } from "date-fns";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Badge } from "@/components/ui/badge";
import { ProjectManagement } from "@/components/ProjectManagement";
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "urgent";
  completed: Date | null; // null = not completed, Date = completion timestamp
  dueDate?: Date;
  area?: string;
  project?: string;
  created: Date; // automatically set when task is created
  timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY";
}
interface Area {
  id: string;
  name: string;
  color: string;
  taskCount: number;
}
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

// Helper dates for created timestamps
const oneWeekAgo = new Date(today);
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const fiveDaysAgo = new Date(today);
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
const mockTasks: Task[] = [{
  id: "1",
  title: "Review quarterly reports",
  priority: "urgent",
  completed: null,
  dueDate: today,
  area: "work",
  project: "1", // Website Redesign
  created: fiveDaysAgo,
  timeframe: "NOW"
}, {
  id: "2",
  title: "Prepare presentation slides",
  priority: "medium",
  completed: null,
  dueDate: tomorrow,
  area: "work",
  project: "2", // Mobile App Development
  created: threeDaysAgo,
  timeframe: "NEXT"
}, {
  id: "3",
  title: "Call dentist for appointment",
  priority: "low",
  completed: null,
  created: oneWeekAgo,
  timeframe: "LATER"
}, {
  id: "4",
  title: "Plan weekend trip",
  priority: "low",
  completed: yesterday,
  created: oneWeekAgo,
  timeframe: "SOMEDAY"
}, {
  id: "5",
  title: "Update project documentation",
  priority: "medium",
  completed: null,
  area: "work",
  created: fiveDaysAgo,
  timeframe: "LATER"
}, {
  id: "6",
  title: "Morning workout",
  priority: "medium",
  completed: null,
  dueDate: today,
  area: "health",
  created: today,
  timeframe: "NOW"
}, {
  id: "7",
  title: "Team standup meeting",
  priority: "urgent",
  completed: null,
  dueDate: today,
  area: "work",
  created: today,
  timeframe: "NOW"
}, {
  id: "8",
  title: "Grocery shopping",
  priority: "low",
  completed: null,
  dueDate: today,
  area: "chores",
  created: yesterday,
  timeframe: "NOW"
}, {
  id: "9",
  title: "Read psychology book",
  priority: "medium",
  completed: null,
  dueDate: today,
  area: "psychology",
  created: threeDaysAgo,
  timeframe: "NEXT"
}, {
  id: "10",
  title: "Complete expense report",
  priority: "urgent",
  completed: null,
  dueDate: nextWeek,
  area: "work",
  created: fiveDaysAgo,
  timeframe: "NEXT"
}, {
  id: "11",
  title: "Weekly team meeting",
  priority: "medium",
  completed: today,
  area: "work",
  created: yesterday,
  timeframe: "NOW"
}, {
  id: "12",
  title: "Buy groceries for dinner",
  priority: "low",
  completed: today,
  area: "chores",
  created: today,
  timeframe: "NOW"
}, {
  id: "13",
  title: "Review code changes",
  priority: "medium",
  completed: twoDaysAgo,
  area: "work",
  created: threeDaysAgo,
  timeframe: "NEXT"
}, {
  id: "14",
  title: "Plan family outing",
  priority: "urgent",
  completed: twoDaysAgo,
  area: "family",
  created: oneWeekAgo,
  timeframe: "LATER"
}, {
  id: "15",
  title: "Submit monthly report",
  priority: "medium",
  completed: yesterday,
  dueDate: yesterday,
  area: "work",
  created: fiveDaysAgo,
  timeframe: "NOW"
}, {
  id: "16",
  title: "Overdue task from yesterday",
  priority: "urgent",
  completed: null,
  dueDate: yesterday,
  area: "work",
  created: twoDaysAgo,
  timeframe: "NOW"
}, {
  id: "17",
  title: "Very overdue task",
  priority: "medium",
  completed: null,
  dueDate: twoDaysAgo,
  created: fiveDaysAgo,
  timeframe: "NOW"
}, {
  id: "18",
  title: "Random idea to explore",
  priority: "low",
  completed: null,
  created: yesterday,
  timeframe: "SOMEDAY"
}, {
  id: "19",
  title: "Unorganized task",
  priority: "medium",
  completed: null,
  created: today,
  timeframe: "LATER"
}, {
  id: "20",
  title: "Quick note to self",
  priority: "low",
  completed: null,
  created: threeDaysAgo,
  timeframe: "SOMEDAY"
}];
const mockAreas: Area[] = [{
  id: "work",
  name: "Work",
  color: "bg-primary",
  taskCount: 8
}, {
  id: "health",
  name: "Health",
  color: "bg-emerald-500",
  taskCount: 5
}, {
  id: "self-care",
  name: "Self-care",
  color: "bg-rose-400",
  taskCount: 3
}, {
  id: "psychology",
  name: "Psychology",
  color: "bg-destructive",
  taskCount: 2
}, {
  id: "fun",
  name: "Fun",
  color: "bg-orange-500",
  taskCount: 4
}, {
  id: "family",
  name: "Family",
  color: "bg-green-500",
  taskCount: 3
}, {
  id: "chores",
  name: "Chores",
  color: "bg-yellow-500",
  taskCount: 2
}, {
  id: "order",
  name: "Order",
  color: "bg-purple-500",
  taskCount: 1
}];

const mockProjects = [
  { id: "1", title: "Website Redesign", area: "work" },
  { id: "2", title: "Mobile App Development", area: "work" },
  { id: "3", title: "Morning Fitness Routine", area: "health" },
  { id: "4", title: "Home Organization", area: "order" },
  { id: "5", title: "Family Vacation Planning", area: "family" }
];

const projectAreas = [
  { id: "work", name: "Work", color: "bg-primary", taskCount: 1 },
  { id: "health", name: "Health", color: "bg-emerald-500", taskCount: 1 },
  { id: "self-care", name: "Self-care", color: "bg-rose-400", taskCount: 1 },
  { id: "psychology", name: "Psychology", color: "bg-destructive", taskCount: 1 },
  { id: "fun", name: "Fun", color: "bg-orange-500", taskCount: 1 },
  { id: "family", name: "Family", color: "bg-green-500", taskCount: 1 },
  { id: "chores", name: "Chores", color: "bg-yellow-500", taskCount: 1 },
  { id: "order", name: "Order", color: "bg-purple-500", taskCount: 1 }
];
const formatTaskDate = (date: Date) => {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
};

const formatTodayViewDate = (date: Date) => {
  const today = new Date();
  if (isToday(date)) {
    return format(date, "dd.MM");
  } else if (date < today) {
    const daysDiff = differenceInDays(today, date);
    return `${daysDiff} d`;
  }
  return format(date, "dd.MM");
};

const formatSimpleDate = (date: Date) => {
  return format(date, "dd.MM.yy");
};

const formatCreatedDate = (date: Date) => {
  return format(date, "dd.MM.yyyy");
};

const formatCompletedTime = (date: Date) => {
  return format(date, "HH:mm");
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
      return "bg-secondary text-secondary-foreground";
  }
};

const isTaskOverdue = (task: Task) => {
  if (!task.dueDate || task.completed !== null) return false;
  return isBefore(task.dueDate, startOfDay(new Date()));
};

const formatDateTime = (date: Date) => {
  return format(date, "dd.MM.yyyy HH:mm");
};

const ClickableDueDate = ({
  date,
  taskId,
  onDateChange,
  formatFunction = formatSimpleDate,
  className = "text-xs text-muted-foreground"
}: {
  date: Date;
  taskId: string;
  onDateChange: (taskId: string, date: Date | undefined) => void;
  formatFunction?: (date: Date) => string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          className={cn("cursor-pointer hover:text-foreground transition-colors", className)}
          onClick={handleClick}
        >
          {formatFunction(date)}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={(selectedDate) => {
            onDateChange(taskId, selectedDate);
            setIsOpen(false);
          }}
          initialFocus
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
};
export function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([...mockTasks]);
  const [activeView, setActiveView] = useState("today");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isAreasExpanded, setIsAreasExpanded] = useState(true);
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({});
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskViewOpen, setIsTaskViewOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "date" | "none">("none");
  const [showCompleted, setShowCompleted] = useState(false);
  const [kanbanSelectedAreas, setKanbanSelectedAreas] = useState<string[]>([]);
  const [selectedProjectAreas, setSelectedProjectAreas] = useState<string[]>([]);
  const [selectedProjectStatuses, setSelectedProjectStatuses] = useState<string[]>([]);
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isSortPopoverOpen, setIsSortPopoverOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    dueDate: undefined as Date | undefined,
    area: "",
    project: "",
    timeframe: "NOW" as Task["timeframe"]
  });
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditingTask({...task});
    setIsTaskViewOpen(true);
    setIsEditing(true); // Start in edit mode
  };

  const getAreaFromProject = (projectId?: string) => {
    if (!projectId) return undefined;
    const project = mockProjects.find(p => p.id === projectId);
    return project?.area;
  };

  const handleProjectAssignment = (task: Task, newProjectId: string) => {
    const projectId = newProjectId === "none" ? undefined : newProjectId;
    const areaId = getAreaFromProject(projectId);

    setTasks(prevTasks => prevTasks.map(t =>
      t.id === task.id ? {
        ...t,
        project: projectId,
        area: areaId
      } : t
    ));
  };

  const handleDialogClose = () => {
    // Auto-save changes when closing
    if (editingTask) {
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === editingTask.id ? editingTask : task
      ));
      setSelectedTask(editingTask);
    }
    setIsTaskViewOpen(false);
    setIsEditing(false);
  };

  const updateEditingTask = (updates: Partial<Task>) => {
    if (editingTask) {
      setEditingTask({...editingTask, ...updates});
    }
  };
  const toggleTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? {
      ...task,
      completed: task.completed === null ? new Date() : null
    } : task));
  };
  const updateTaskTimeframe = (taskId: string, timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY") => {
    setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? {
      ...task,
      timeframe
    } : task));
  };
  
  const updateTaskDueDate = (taskId: string, dueDate: Date | undefined) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? {
      ...task,
      dueDate
    } : task));
  };
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Urgent";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Unknown";
    }
  };
  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-amber-500 text-white";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };
  const taskViews = [{
    id: "today",
    label: "Today",
    icon: Calendar,
    count: 6
  }, {
    id: "upcoming",
    label: "Upcoming",
    icon: Clock,
    count: 7
  }, {
    id: "areas",
    label: "by Area",
    icon: FolderOpen,
    count: 18
  }, {
    id: "projects",
    label: "Projects",
    icon: FolderOpen,
    count: 14
  }, {
    id: "goals",
    label: "Goals",
    icon: FolderOpen,
    count: 8
  }, {
    id: "inbox",
    label: "Inbox",
    icon: Inbox,
    count: 12
  }, {
    id: "completed",
    label: "Completed",
    icon: Calendar,
    count: 5
  }];

  // Auto-select first area when switching to areas view
  useEffect(() => {
    if (activeView === "areas" && !selectedArea && mockAreas.length > 0) {
      setSelectedArea(mockAreas[0].id);
    }
  }, [activeView, selectedArea]);
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
  const filterAndSortTasks = (tasks: Task[]) => {
    // Apply completion filter for all views except completed view
    let filteredTasks = tasks;
    if (activeView === "today" && showCompleted) {
      // In Today view, when showing completed tasks, only show those completed today
      filteredTasks = tasks.filter(task =>
        (task.completed === null && task.dueDate && task.dueDate <= endOfDay(new Date())) ||
        (task.completed !== null && isToday(task.completed))
      );
          } else if (activeView === "upcoming" && showCompleted) {
        // In Upcoming view, when showing completed tasks, only show those completed today or later
        filteredTasks = tasks.filter(task =>
        task.completed === null ||
        (task.completed !== null && task.completed >= startOfDay(new Date()))
      );
          } else if (activeView !== "completed" && !showCompleted) {
        filteredTasks = tasks.filter(task => task.completed === null);
    }
    return [...filteredTasks].sort((a, b) => {
      // Primary sort: For all views except "completed", unchecked tasks come first
      if (activeView !== "completed") {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1; // unchecked first, checked last
        }
      }

      // Secondary sort: Apply selected sorting option
      if (sortBy === "priority") {
        const priorityOrder = {
          urgent: 3,
          medium: 2,
          low: 1
        };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === "date") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return 0;
    });
  };
  const getRelativeTimeGroup = (date: Date) => {
    const now = new Date();
    if (isYesterday(date)) return "yesterday";
    if (isToday(date)) return "today";
    if (isTomorrow(date)) return "tomorrow";
    const daysDiff = differenceInDays(date, now);
    if (daysDiff > 0 && daysDiff <= 7) return "next 7 days";
    if (daysDiff > 7 && daysDiff <= 30) return "next 30 days";
    if (daysDiff > 30) return "later";

    // For past dates that aren't yesterday
    return "yesterday";
  };
  const renderUpcomingView = () => {
    // Get all tasks with due dates (including today and future), then apply completion filtering
    let upcomingTasks = tasks.filter(task => task.dueDate);

    // Apply completion filter specifically for upcoming view
    if (!showCompleted) {
      upcomingTasks = upcomingTasks.filter(task => task.completed === null);
    } else {
      // When showing completed, only show those completed today or later
      upcomingTasks = upcomingTasks.filter(task =>
        task.completed === null ||
        (task.completed !== null && task.completed >= startOfDay(new Date()))
      );
    }
    const tasksByTimeGroup = upcomingTasks.reduce((acc, task) => {
      if (!task.dueDate) return acc;
      const group = getRelativeTimeGroup(task.dueDate);
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
    const groupOrder = ["yesterday", "today", "tomorrow", "next 7 days", "next 30 days", "later"];
    const groupLabels = {
      "yesterday": "Yesterday",
      "today": "Today",
      "tomorrow": "Tomorrow",
      "next 7 days": "Next 7 Days",
      "next 30 days": "Next 30 Days",
      "later": "Later"
    };
    const toggleGroup = (groupId: string) => {
      setExpandedAreas(prev => ({
        ...prev,
        [groupId]: !prev[groupId]
      }));
    };
    return <div className="space-y-6">
        {groupOrder.map(group => {
        const tasks = tasksByTimeGroup[group];
        if (!tasks || tasks.length === 0) return null;
        const isExpanded = expandedAreas[group] !== false; // default to expanded

        return <div key={group} className="space-y-0">
              <button onClick={() => toggleGroup(group)} className="flex items-center gap-2 hover:bg-muted/50 p-2 rounded-lg transition-colors w-full text-left group">
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" /> : <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {groupLabels[group as keyof typeof groupLabels]}
                </h3>
                <span className="text-sm text-muted-foreground">({tasks.length})</span>
              </button>
              
              {isExpanded && <div className="space-y-0 animate-fade-in">
                   {tasks.map(task => <div key={task.id} className={cn("rounded-lg p-2 hover:bg-card  hover:shadow-soft transition-all duration-200 ml-6 cursor-pointer", task.completed !== null && "opacity-60")} onClick={() => handleTaskClick(task)}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={task.completed !== null} className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority))} onChange={() => toggleTask(task.id)} onClick={e => e.stopPropagation()} />
                                                  <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className={cn("text-card-foreground", task.completed !== null && "line-through")}>
                                  {task.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                {task.project ? (
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                    {mockProjects.find(p => p.id === task.project)?.title}
                                  </span>
                                ) : (
                                  <Select
                                    value="none"
                                    onValueChange={(value) => handleProjectAssignment(task, value)}
                                  >
                                    <SelectTrigger
                                      className="h-6 w-6 p-0 border-none bg-transparent hover:bg-muted rounded"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Folder className="w-3 h-3 text-muted-foreground" />
                                    </SelectTrigger>
                                    <SelectContent onClick={(e) => e.stopPropagation()}>
                                      <SelectItem value="none">No project</SelectItem>
                                      {mockProjects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                          {project.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                                {task.area && <span className={cn("text-xs text-white px-2 py-1 rounded", mockAreas.find(a => a.id === task.area)?.color || "bg-muted")}>
                                    {mockAreas.find(a => a.id === task.area)?.name}
                                  </span>}
                                {task.dueDate && <ClickableDueDate
                                  date={task.dueDate}
                                  taskId={task.id}
                                  onDateChange={updateTaskDueDate}
                                  formatFunction={(date) => format(date, "dd.MM")}
                                  className={cn("text-xs text-muted-foreground", isTaskOverdue(task) && "text-red-500")}
                                />}
                              </div>
                          </div>
                        </div>
                      </div>
                    </div>)}
                </div>}
            </div>;
      })}
      </div>;
  };
  const renderCompletedView = () => {
    const completedTasks = tasks.filter(task => task.completed !== null);
    const tasksByDate = completedTasks.reduce((acc, task) => {
      if (!task.completed) return acc;
      const dateKey = format(task.completed, "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    }, {} as Record<string, Task[]>);

    // Sort dates newest first
    const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const toggleGroup = (dateKey: string) => {
      setExpandedAreas(prev => ({
        ...prev,
        [dateKey]: !prev[dateKey]
      }));
    };
    return <div className="space-y-6">
        {sortedDates.map(dateKey => {
        const tasks = tasksByDate[dateKey];
        const date = new Date(dateKey);
        const isExpanded = expandedAreas[dateKey] !== false; // default to expanded

        return <div key={dateKey} className="space-y-0">
              <button onClick={() => toggleGroup(dateKey)} className="flex items-center gap-2 hover:bg-muted/50 p-2 rounded-lg transition-colors w-full text-left group">
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" /> : <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {format(date, "EEE dd.MM.yyyy")}
                </h3>
                <span className="text-sm text-muted-foreground">({tasks.length})</span>
              </button>
              
              {isExpanded && <div className="space-y-0 animate-fade-in">
                  {filterAndSortTasks(tasks).map(task => <div key={task.id} className={cn("rounded-lg p-2 hover:bg-card  hover:shadow-soft transition-all duration-200 ml-6 cursor-pointer opacity-60")} onClick={() => handleTaskClick(task)}>
                      <div className="flex items-center gap-3">
                        {task.completed && <span className="text-xs text-muted-foreground font-medium w-12 text-right">
                          {formatCompletedTime(task.completed)}
                        </span>}
                        <input type="checkbox" checked={task.completed !== null} className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority))} onChange={() => toggleTask(task.id)} onClick={e => e.stopPropagation()} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-card-foreground line-through">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 ml-2">
                              {task.project ? (
                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                  {mockProjects.find(p => p.id === task.project)?.title}
                                </span>
                              ) : (
                                <Select
                                  value="none"
                                  onValueChange={(value) => handleProjectAssignment(task, value)}
                                >
                                  <SelectTrigger
                                    className="h-6 w-6 p-0 border-none bg-transparent hover:bg-muted rounded"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Folder className="w-3 h-3 text-muted-foreground" />
                                  </SelectTrigger>
                                  <SelectContent onClick={(e) => e.stopPropagation()}>
                                    <SelectItem value="none">No project</SelectItem>
                                    {mockProjects.map((project) => (
                                      <SelectItem key={project.id} value={project.id}>
                                        {project.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              {task.area && <span className={cn("text-xs text-white px-2 py-1 rounded", mockAreas.find(a => a.id === task.area)?.color || "bg-muted")}>
                                  {mockAreas.find(a => a.id === task.area)?.name}
                                </span>}
                              <span className={cn("text-xs px-2 py-1 rounded font-medium uppercase", getTimeframeColor(task.timeframe))}>
                                {task.timeframe}
                              </span>
                            </div>
                          </div>
                          {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                        </div>
                      </div>
                    </div>)}
                </div>}
            </div>;
      })}
      </div>;
  };
  const renderInboxView = () => {
    let inboxTasks = tasks.filter(task => !task.dueDate && !task.area);

    // Apply completion filter
    if (showCompleted) {
      // In Inbox view, when showing completed tasks, only show those completed today
      inboxTasks = inboxTasks.filter(task =>
        task.completed === null ||
        (task.completed !== null && isToday(task.completed))
      );
    } else {
      inboxTasks = inboxTasks.filter(task => task.completed === null);
    }

    // Sort by created date, newest first, with uncompleted tasks first
    const sortedTasks = [...inboxTasks].sort((a, b) => {
      // Primary sort: uncompleted tasks first
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Secondary sort: by created date, newest first
      return b.created.getTime() - a.created.getTime();
    });

    return <div className="space-y-0">
      {sortedTasks.map(task => <div key={task.id} className={cn("rounded-lg p-2 hover:bg-card  hover:shadow-soft transition-all duration-200 cursor-pointer", task.completed !== null && "opacity-60")} onClick={() => handleTaskClick(task)}>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium w-20 text-right">
              {formatCreatedDate(task.created)}
            </span>
            <input type="checkbox" checked={task.completed !== null} className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority))} onChange={() => toggleTask(task.id)} onClick={e => e.stopPropagation()} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className={cn("text-card-foreground", task.completed !== null && "line-through")}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-2 ml-2">
                  {task.project ? (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {mockProjects.find(p => p.id === task.project)?.title}
                    </span>
                  ) : (
                    <Select
                      value="none"
                      onValueChange={(value) => handleProjectAssignment(task, value)}
                    >
                      <SelectTrigger
                        className="h-6 w-6 p-0 border-none bg-transparent hover:bg-muted rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Folder className="w-3 h-3 text-muted-foreground" />
                      </SelectTrigger>
                      <SelectContent onClick={(e) => e.stopPropagation()}>
                        <SelectItem value="none">No project</SelectItem>
                        {mockProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Select
                    value={task.timeframe}
                    onValueChange={(value) => updateTaskTimeframe(task.id, value as Task["timeframe"])}
                  >
                    <SelectTrigger className={cn("w-20 h-7 text-xs border-none px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity [&>svg]:hidden font-medium uppercase flex items-center justify-center", getTimeframeColor(task.timeframe))}>
                      <SelectValue className="text-center w-full" />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      <SelectItem value="NOW">Now</SelectItem>
                      <SelectItem value="NEXT">Next</SelectItem>
                      <SelectItem value="LATER">Later</SelectItem>
                      <SelectItem value="SOMEDAY">Someday</SelectItem>
                    </SelectContent>
                  </Select>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-muted"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0"
                      align="end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CalendarComponent
                        mode="single"
                        selected={task.dueDate}
                        onSelect={(date) => updateTaskDueDate(task.id, date)}
                        initialFocus
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
            </div>
          </div>
        </div>)}
    </div>;
  };

  const renderTaskList = (tasks: Task[]) => <div className="space-y-0">
      {tasks.map(task => <div key={task.id} className={cn("rounded-lg p-2 hover:bg-card  hover:shadow-soft transition-all duration-200 cursor-pointer", task.completed !== null && "opacity-60")} onClick={() => handleTaskClick(task)}>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={task.completed !== null} className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority))} onChange={() => toggleTask(task.id)} onClick={e => e.stopPropagation()} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                                  <h3 className={cn("text-card-foreground", task.completed !== null && "line-through")}>
                    {task.title}
                  </h3>
                <div className="flex items-center gap-2 ml-2">
                  {task.project ? (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      {mockProjects.find(p => p.id === task.project)?.title}
                    </span>
                  ) : (
                    <Select
                      value="none"
                      onValueChange={(value) => handleProjectAssignment(task, value)}
                    >
                      <SelectTrigger
                        className="h-6 w-6 p-0 border-none bg-transparent hover:bg-muted rounded"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Folder className="w-3 h-3 text-muted-foreground" />
                      </SelectTrigger>
                      <SelectContent onClick={(e) => e.stopPropagation()}>
                        <SelectItem value="none">No project</SelectItem>
                        {mockProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {task.dueDate && <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                      <ClickableDueDate
                        date={task.dueDate}
                        taskId={task.id}
                        onDateChange={updateTaskDueDate}
                        formatFunction={formatTaskDate}
                        className={cn("cursor-pointer hover:opacity-80 transition-opacity", isTaskOverdue(task) && "text-red-500")}
                      />
                    </span>}
                  {task.area && <span className={cn("text-xs text-white px-2 py-1 rounded", mockAreas.find(a => a.id === task.area)?.color || "bg-muted")}>
                      {mockAreas.find(a => a.id === task.area)?.name}
                    </span>}
                  <span className={cn("text-xs px-2 py-1 rounded font-medium uppercase", getTimeframeColor(task.timeframe))}>
                    {task.timeframe}
                  </span>
                </div>
              </div>
              {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
            </div>
          </div>
        </div>)}
    </div>;
  const renderTodayView = () => {
    const todayTasks = tasks.filter(task => task.dueDate && task.dueDate <= endOfDay(new Date()));
    const tasksByArea = todayTasks.reduce((acc, task) => {
      const areaId = task.area || 'no-area';
      if (!acc[areaId]) {
        acc[areaId] = [];
      }
      acc[areaId].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
    const toggleArea = (areaId: string) => {
      setExpandedAreas(prev => ({
        ...prev,
        [areaId]: !prev[areaId]
      }));
    };
    return <div className="space-y-6">
        {Object.entries(tasksByArea).map(([areaId, tasks]) => {
        const area = mockAreas.find(a => a.id === areaId);
        const areaName = area?.name || (areaId === 'no-area' ? 'No area' : areaId);
        const areaColor = area?.color || 'bg-muted';
        const isExpanded = expandedAreas[areaId] !== false; // default to expanded

        return <div key={areaId} className="space-y-0">
              <button onClick={() => toggleArea(areaId)} className="flex items-center gap-2 hover:bg-muted/50 p-2 rounded-lg transition-colors w-full text-left group">
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" /> : <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
                <div className={cn("w-3 h-3 rounded-full", areaColor)} />
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{areaName}</h3>
                <span className="text-sm text-muted-foreground">({tasks.length})</span>
              </button>
              
              {isExpanded && <div className="space-y-0 animate-fade-in">
                   {filterAndSortTasks(tasks).map(task => <div key={task.id} className={cn("rounded-lg p-2 hover:bg-card  hover:shadow-soft transition-all duration-200 ml-6 cursor-pointer", task.completed !== null && "opacity-60")} onClick={() => handleTaskClick(task)}>
                       <div className="flex items-center gap-3">
                         <input type="checkbox" checked={task.completed !== null} className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority))} onChange={() => toggleTask(task.id)} onClick={e => e.stopPropagation()} />
                         <div className="flex-1">
                           <div className="flex items-center justify-between">
                             <h4 className={cn("text-card-foreground", task.completed !== null && "line-through")}>
                               {task.title}
                             </h4>
                             <div className="flex items-center gap-2">
                               {task.project && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                 {mockProjects.find(p => p.id === task.project)?.title}
                               </span>}
                               {task.dueDate && <ClickableDueDate
                                 date={task.dueDate}
                                 taskId={task.id}
                                 onDateChange={updateTaskDueDate}
                                 formatFunction={formatTodayViewDate}
                                 className={cn("text-xs text-muted-foreground font-medium", isTaskOverdue(task) && "text-red-500")}
                               />}
                             </div>
                           </div>
                           {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                         </div>
                       </div>
                     </div>)}
                </div>}
            </div>;
      })}
      </div>;
  };
  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(), // Simple ID generation
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      priority: newTask.priority,
      completed: null,
      dueDate: newTask.dueDate,
      area: newTask.area || undefined,
      project: newTask.project || undefined,
      created: new Date(),
      timeframe: newTask.timeframe
    };

    setTasks(prevTasks => [...prevTasks, task]);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: undefined,
      area: "",
      project: "",
      timeframe: "NOW"
    });
    setIsNewTaskDialogOpen(false);
  };
  const resetNewTaskForm = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: undefined,
      area: "",
      project: "",
      timeframe: "NOW"
    });
  };
  const renderAreasView = () => <div className="h-full">
      <KanbanBoard tasks={filterAndSortTasks(tasks)} onTaskClick={handleTaskClick} onToggleTask={toggleTask} onUpdateTaskTimeframe={updateTaskTimeframe} onUpdateTaskDueDate={updateTaskDueDate} areas={mockAreas} selectedAreas={kanbanSelectedAreas} projects={mockProjects} onProjectAssignment={handleProjectAssignment} />
    </div>;
  const getFilteredTasks = () => {
    switch (activeView) {
      case "today":
        return tasks.filter(task => task.dueDate && task.dueDate <= endOfDay(new Date()));
      case "upcoming":
        return tasks.filter(task => task.dueDate && !isToday(task.dueDate));
      case "inbox":
        return tasks.filter(task => !task.dueDate && !task.area);
      case "completed":
        return tasks.filter(task => task.completed !== null);
      default:
        return tasks;
    }
  };
  return <div className="bg-[#fafafa]">
      {/* Header with title */}
      <div className="bg-card">
        <div className="flex items-center justify-between px-6 py-[18px] pb-5 bg-white border-[#e2e2e2]">
          <nav className="flex items-center gap-1 rounded-lg w-fit">
            {taskViews.map(view => {
            const isActive = activeView === view.id;
            return <button key={view.id} onClick={() => setActiveView(view.id)} className={cn("flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 nav-button-hover", isActive ? "text-foreground shadow-soft nav-button-active" : "text-muted-foreground hover:text-foreground")}>
                  <span>{view.label}</span>
                </button>;
          })}
          </nav>
        </div>
        
        {/* Navigation tabs */}
        <div className="px-6 py-3 bg-[#fafafa] border-[#21222c]/0">
          <div className="flex items-center justify-between">
            {/* Left: Tags (Areas) */}
            <div className="flex flex-wrap items-center gap-2">
              {activeView === "areas" &&
                mockAreas.map((area) => (
                  <Badge
                    key={area.id}
                    variant={kanbanSelectedAreas.includes(area.id) ? "default" : "outline"}
                    onClick={() =>
                      setKanbanSelectedAreas((prev) =>
                        prev.includes(area.id)
                          ? prev.filter((id) => id !== area.id)
                          : [...prev, area.id]
                      )
                    }
                    className="cursor-pointer hover:opacity-80 transition-opacity px-[10px] py-1 flex items-center gap-2"
                  >
                    <div className={cn("w-2 h-2 rounded-full", area.color)} />
                    {area.name}
                  </Badge>
                ))}
              {activeView === "projects" &&
                projectAreas.map((area) => (
                  <Badge
                    key={area.id}
                    variant={selectedProjectAreas.includes(area.id) ? "default" : "outline"}
                    onClick={() =>
                      setSelectedProjectAreas((prev) =>
                        prev.includes(area.id)
                          ? prev.filter((id) => id !== area.id)
                          : [...prev, area.id]
                      )
                    }
                    className="cursor-pointer hover:opacity-80 transition-opacity px-[10px] py-1 flex items-center gap-2"
                  >
                    <div className={cn("w-2 h-2 rounded-full", area.color)} />
                    {area.name}
                  </Badge>
                ))}
              {activeView === "goals" &&
                projectAreas.map((area) => (
                  <Badge
                    key={area.id}
                    variant={selectedProjectAreas.includes(area.id) ? "default" : "outline"}
                    onClick={() =>
                      setSelectedProjectAreas((prev) =>
                        prev.includes(area.id)
                          ? prev.filter((id) => id !== area.id)
                          : [...prev, area.id]
                      )
                    }
                    className="cursor-pointer hover:opacity-80 transition-opacity px-[10px] py-1 flex items-center gap-2"
                  >
                    <div className={cn("w-2 h-2 rounded-full", area.color)} />
                    {area.name}
                  </Badge>
                ))}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
              <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
                <PopoverTrigger asChild>
                  <div
                    onMouseEnter={() => setIsFilterPopoverOpen(true)}
                    onMouseLeave={() => {
                      setTimeout(() => {
                        const content = document.querySelector('.filter-popover-content:hover');
                        if (!content) {
                          setIsFilterPopoverOpen(false);
                        }
                      }, 150);
                    }}
                  >
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-48 p-0 filter-popover-content" 
                  align="end"
                  onMouseEnter={() => setIsFilterPopoverOpen(true)}
                  onMouseLeave={() => {
                    setTimeout(() => {
                      setIsFilterPopoverOpen(false);
                    }, 150);
                  }}
                >
                   <div className="p-2">
                     <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Filter</div>
                     <div className="space-y-2">
                       {activeView === "projects" ? (
                         // Project status filters
                         <>
                           {["lead", "active", "finished", "archive"].map((status) => (
                             <div key={status} className="flex items-center space-x-2 px-2">
                               <Checkbox
                                 id={`status-${status}`}
                                 checked={selectedProjectStatuses.includes(status)}
                                 onCheckedChange={(checked) => {
                                   if (checked) {
                                     setSelectedProjectStatuses(prev => [...prev, status]);
                                   } else {
                                     setSelectedProjectStatuses(prev => prev.filter(s => s !== status));
                                   }
                                 }}
                               />
                               <Label
                                 htmlFor={`status-${status}`}
                                 className="text-sm font-normal cursor-pointer capitalize"
                               >
                                 {status}
                               </Label>
                             </div>
                           ))}
                         </>
                       ) : (
                         // Task completion filter
                         <div className="flex items-center space-x-2 px-2">
                           <Checkbox
                             id="show-completed"
                             checked={showCompleted}
                             onCheckedChange={(checked) =>
                               setShowCompleted(checked as boolean)
                             }
                           />
                           <Label
                             htmlFor="show-completed"
                             className="text-sm font-normal cursor-pointer"
                           >
                             Show completed
                           </Label>
                         </div>
                       )}
                     </div>
                   </div>
                </PopoverContent>
              </Popover>
              <Popover open={isSortPopoverOpen} onOpenChange={setIsSortPopoverOpen}>
                <PopoverTrigger asChild>
                  <div
                    onMouseEnter={() => setIsSortPopoverOpen(true)}
                    onMouseLeave={() => {
                      setTimeout(() => {
                        const content = document.querySelector('.sort-popover-content:hover');
                        if (!content) {
                          setIsSortPopoverOpen(false);
                        }
                      }, 150);
                    }}
                  >
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-48 p-0 sort-popover-content" 
                  align="end"
                  onMouseEnter={() => setIsSortPopoverOpen(true)}
                  onMouseLeave={() => {
                    setTimeout(() => {
                      setIsSortPopoverOpen(false);
                    }, 150);
                  }}
                >
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Sort by</div>
                    <div className="space-y-1">
                      <Button
                        variant={sortBy === "none" ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSortBy("none")}
                      >
                        None
                      </Button>
                      <Button
                        variant={sortBy === "priority" ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSortBy("priority")}
                      >
                        Priority
                      </Button>
                      <Button
                        variant={sortBy === "date" ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSortBy("date")}
                      >
                        Date
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {activeView === "projects" ? (
                <Button
                  className="gap-2"
                  size="sm"
                  onClick={() => setIsNewProjectDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              ) : (
                <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="gap-2"
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                      New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={(e) =>
                            setNewTask((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder="Enter task title"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={(e) =>
                            setNewTask((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Enter task description (optional)"
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={(value) =>
                            setNewTask((prev) => ({
                              ...prev,
                              priority: value as Task["priority"],
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="area">Area</Label>
                        <Select
                          value={newTask.area}
                          onValueChange={(value) =>
                            setNewTask((prev) => ({
                              ...prev,
                              area: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockAreas.map((area) => (
                              <SelectItem key={area.id} value={area.id}>
                                {area.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="project">Project</Label>
                        <Select
                          value={newTask.project}
                          onValueChange={(value) =>
                            setNewTask((prev) => ({
                              ...prev,
                              project: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockProjects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="timeframe">Timeframe</Label>
                        <Select
                          value={newTask.timeframe}
                          onValueChange={(value) =>
                            setNewTask((prev) => ({
                              ...prev,
                              timeframe: value as Task["timeframe"],
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeframe" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NOW">Now</SelectItem>
                            <SelectItem value="NEXT">Next</SelectItem>
                            <SelectItem value="LATER">Later</SelectItem>
                            <SelectItem value="SOMEDAY">Someday</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newTask.dueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newTask.dueDate ? (
                                format(newTask.dueDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={newTask.dueDate}
                              onSelect={(date) =>
                                setNewTask((prev) => ({
                                  ...prev,
                                  dueDate: date,
                                }))
                              }
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>
                        Create Task
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Areas navigation for "tasks by area" view */}
        {activeView === "areas"}
      </div>

      {/* Main Task Content */}
      <div className={cn("overflow-auto bg-[#fafafa]", activeView === "areas" ? "h-[calc(100%-140px)]" : "p-6 h-[calc(100%-140px)]")}>
        {activeView === "projects" ? (
          <div className="h-full -m-6">
            <ProjectManagement
              selectedAreas={selectedProjectAreas}
              selectedStatuses={selectedProjectStatuses}
              isNewProjectDialogOpen={isNewProjectDialogOpen}
              onNewProjectDialogChange={setIsNewProjectDialogOpen}
            />
          </div>
        ) : activeView === "goals" ? (
          <div className="h-full -m-6">
            <ProjectManagement
              selectedAreas={selectedProjectAreas}
              selectedStatuses={selectedProjectStatuses}
              isNewProjectDialogOpen={isNewProjectDialogOpen}
              onNewProjectDialogChange={setIsNewProjectDialogOpen}
            />
          </div>
        ) : activeView === "areas" ? (
          renderAreasView()
        ) : (
          <div className="max-w-4xl mx-auto">
            {activeView === "today" ? renderTodayView() : activeView === "upcoming" ? renderUpcomingView() : activeView === "completed" ? renderCompletedView() : activeView === "inbox" ? renderInboxView() : renderTaskList(filterAndSortTasks(getFilteredTasks()))}
          </div>
        )}
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={isTaskViewOpen} onOpenChange={(open) => open ? setIsTaskViewOpen(true) : handleDialogClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {editingTask && <>
                  <div className={cn("w-1 h-6 rounded-full", editingTask.priority === "urgent" ? "bg-destructive" : editingTask.priority === "medium" ? "bg-amber-500" : "bg-muted")} />
                  <Input
                    value={editingTask.title}
                    onChange={(e) => updateEditingTask({ title: e.target.value })}
                    className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                  />
                </>}
            </DialogTitle>
          </DialogHeader>

          {editingTask && <div className="space-y-6 py-4">
              {/* Status and Priority */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingTask.completed !== null}
                    className={cn("w-4 h-4 text-primary rounded border-border focus:ring-primary", getPriorityCheckboxColor(editingTask.priority))}
                    onChange={() => updateEditingTask({ completed: editingTask.completed ? null : new Date() })}
                  />
                  <span className="text-sm font-medium">
                    {editingTask.completed !== null ? "Completed" : "Pending"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value) => updateEditingTask({ priority: value as Task["priority"] })}
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
                  value={editingTask.description || ""}
                  onChange={(e) => updateEditingTask({ description: e.target.value })}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              {/* Due Date */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Due Date</h4>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !editingTask.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editingTask.dueDate ? (
                        format(editingTask.dueDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={editingTask.dueDate}
                      onSelect={(date) => updateEditingTask({ dueDate: date })}
                      initialFocus
                      className="p-3"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Area */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Area</h4>
                <Select
                  value={editingTask.area || "none"}
                  onValueChange={(value) => updateEditingTask({ area: value === "none" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No area</SelectItem>
                    {mockAreas.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Project</h4>
                <Select
                  value={editingTask.project || "none"}
                  onValueChange={(value) => updateEditingTask({ project: value === "none" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {mockProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timeframe */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Timeframe</h4>
                <Select
                  value={editingTask.timeframe}
                  onValueChange={(value) => updateEditingTask({ timeframe: value as Task["timeframe"] })}
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

              {/* Created Date */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Created</h4>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(editingTask.created)}
                </span>
              </div>

              {/* Completed Date */}
              {editingTask.completed !== null && <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Completed</h4>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(editingTask.completed)}
                </span>
              </div>}

              {/* Task ID */}
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Task ID</h4>
                <code className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-mono">
                  {editingTask.id}
                </code>
              </div>
            </div>}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button onClick={handleDialogClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}
