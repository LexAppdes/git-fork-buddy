import { useState, useEffect, useCallback } from "react";
import { Calendar, Inbox, Clock, FolderOpen, ChevronDown, ChevronRight, Plus, Filter, ArrowUpDown, CalendarIcon, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { TaskDetailsSidebar } from "@/components/TaskDetailsSidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateTimePicker, InlineDateTimePicker } from "@/components/ui/date-time-picker";
import { SimpleDatePicker, SimpleDatePickerButton } from "@/components/ui/simple-date-picker";
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
  cancelled: Date | null; // null = not cancelled, Date = cancellation timestamp
  dueDate?: Date;
  timeInterval?: string; // time interval in HH:MM-HH:MM format
  area?: string;
  project?: string;
  step?: string;
  created: Date; // automatically set when task is created
  timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY";
}

interface Step {
  id: string;
  title: string;
  projectId: string;
  order: number;
  completed: boolean;
}

interface Project {
  id: string;
  title: string;
  area: string;
  steps?: Step[];
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
  cancelled: null,
  dueDate: today,
  timeInterval: "09:00-11:00",
  area: "work",
  project: "1", // Website Redesign
  created: fiveDaysAgo,
  timeframe: "NOW"
}, {
  id: "2",
  title: "Prepare presentation slides",
  priority: "medium",
  completed: null,
  cancelled: null,
  dueDate: tomorrow,
  timeInterval: "14:30-16:00",
  area: "work",
  project: "2", // Mobile App Development
  created: threeDaysAgo,
  timeframe: "NEXT"
}, {
  id: "3",
  title: "Call dentist for appointment",
  priority: "low",
  completed: null,
  cancelled: null,
  area: "health",
  created: oneWeekAgo,
  timeframe: "LATER"
}, {
  id: "4",
  title: "Plan weekend trip",
  priority: "low",
  completed: yesterday,
  cancelled: null,
  created: oneWeekAgo,
  timeframe: "SOMEDAY"
}, {
  id: "5",
  title: "Update project documentation",
  priority: "medium",
  completed: null,
  cancelled: null,
  area: "work",
  created: fiveDaysAgo,
  timeframe: "LATER"
}, {
  id: "6",
  title: "Morning workout",
  priority: "medium",
  completed: null,
  cancelled: null,
  dueDate: today,
  timeInterval: "07:00-08:00",
  area: "health",
  created: today,
  timeframe: "NOW"
}, {
  id: "7",
  title: "Team standup meeting",
  priority: "urgent",
  completed: null,
  cancelled: null,
  dueDate: today,
  timeInterval: "10:00-10:30",
  area: "work",
  created: today,
  timeframe: "NOW"
}, {
  id: "8",
  title: "Grocery shopping",
  priority: "low",
  completed: null,
  cancelled: null,
  dueDate: today,
  timeInterval: "18:00-19:30",
  area: "chores",
  created: yesterday,
  timeframe: "NOW"
}, {
  id: "9",
  title: "Read psychology book",
  priority: "medium",
  completed: null,
  cancelled: null,
  dueDate: today,
  timeInterval: "20:00-21:00",
  area: "psychology",
  created: threeDaysAgo,
  timeframe: "NEXT"
}, {
  id: "10",
  title: "Complete expense report",
  priority: "urgent",
  completed: null,
  cancelled: null,
  dueDate: nextWeek,
  timeInterval: "14:00-16:00",
  area: "work",
  created: fiveDaysAgo,
  timeframe: "NEXT"
}, {
  id: "11",
  title: "Weekly team meeting",
  priority: "medium",
  completed: today,
  cancelled: null,
  area: "work",
  created: yesterday,
  timeframe: "NOW"
}, {
  id: "12",
  title: "Buy groceries for dinner",
  priority: "low",
  completed: today,
  cancelled: null,
  area: "chores",
  created: today,
  timeframe: "NOW"
}, {
  id: "13",
  title: "Review code changes",
  priority: "medium",
  completed: twoDaysAgo,
  cancelled: null,
  area: "work",
  created: threeDaysAgo,
  timeframe: "NEXT"
}, {
  id: "14",
  title: "Plan family outing",
  priority: "urgent",
  completed: twoDaysAgo,
  cancelled: null,
  area: "family",
  created: oneWeekAgo,
  timeframe: "LATER"
}, {
  id: "15",
  title: "Submit monthly report",
  priority: "medium",
  completed: yesterday,
  cancelled: null,
  dueDate: yesterday,
  timeInterval: "16:00-17:00",
  area: "work",
  created: fiveDaysAgo,
  timeframe: "NOW"
}, {
  id: "16",
  title: "Overdue task from yesterday",
  priority: "urgent",
  completed: null,
  cancelled: null,
  dueDate: yesterday,
  timeInterval: "12:00-13:00",
  area: "work",
  created: twoDaysAgo,
  timeframe: "NOW"
}, {
  id: "17",
  title: "Very overdue task",
  priority: "medium",
  completed: null,
  cancelled: null,
  dueDate: twoDaysAgo,
  timeInterval: "15:30-17:00",
  created: fiveDaysAgo,
  timeframe: "NOW"
}, {
  id: "18",
  title: "Random idea to explore",
  priority: "low",
  completed: null,
  cancelled: null,
  area: "fun",
  created: yesterday,
  timeframe: "SOMEDAY"
}, {
  id: "19",
  title: "Unorganized task",
  priority: "medium",
  completed: null,
  cancelled: null,
  area: "self-care",
  created: today,
  timeframe: "LATER"
}, {
  id: "20",
  title: "Quick note to self",
  priority: "low",
  completed: null,
  cancelled: null,
  area: "psychology",
  created: threeDaysAgo,
  timeframe: "SOMEDAY"
}, {
  id: "21",
  title: "Learn new skill",
  priority: "medium",
  completed: null,
  cancelled: null,
  area: "self-care",
  created: today,
  timeframe: "NOW"
}, {
  id: "22",
  title: "Schedule meeting",
  priority: "urgent",
  completed: null,
  cancelled: null,
  dueDate: tomorrow,
  timeInterval: "11:00-12:00",
  area: "work",
  created: today,
  timeframe: "NEXT"
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

// Import the full project data from ProjectManagement
const mockProjects: Project[] = [
  {
    id: "1",
    title: "Website Redesign",
    area: "work",
    steps: [
      { id: "step-1-1", title: "Discovery & Research", projectId: "1", order: 1, completed: true },
      { id: "step-1-2", title: "Design & Wireframes", projectId: "1", order: 2, completed: false },
      { id: "step-1-3", title: "Development", projectId: "1", order: 3, completed: false },
      { id: "step-1-4", title: "Testing & Launch", projectId: "1", order: 4, completed: false }
    ]
  },
  {
    id: "2",
    title: "Mobile App Development",
    area: "work",
    steps: [
      { id: "step-2-1", title: "Planning", projectId: "2", order: 1, completed: false },
      { id: "step-2-2", title: "UI/UX Design", projectId: "2", order: 2, completed: false },
      { id: "step-2-3", title: "Development", projectId: "2", order: 3, completed: false }
    ]
  },
  {
    id: "3",
    title: "Morning Fitness Routine",
    area: "health",
    steps: [
      { id: "step-3-1", title: "Setup", projectId: "3", order: 1, completed: true },
      { id: "step-3-2", title: "Week 1-4", projectId: "3", order: 2, completed: false }
    ]
  },
  {
    id: "4",
    title: "Home Organization",
    area: "order",
    steps: [
      { id: "step-4-1", title: "Living Room", projectId: "4", order: 1, completed: true },
      { id: "step-4-2", title: "Bedroom", projectId: "4", order: 2, completed: true }
    ]
  },
  {
    id: "5",
    title: "Family Vacation Planning",
    area: "family",
    steps: [
      { id: "step-5-1", title: "Destination Research", projectId: "5", order: 1, completed: true },
      { id: "step-5-2", title: "Booking", projectId: "5", order: 2, completed: true },
      { id: "step-5-3", title: "Packing", projectId: "5", order: 3, completed: true }
    ]
  }
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

const prepareDateForPicker = (date: Date | undefined, timeInterval?: string) => {
  if (!date) return undefined;

  if (timeInterval) {
    // Parse the time interval (e.g., "09:00-11:00")
    const times = timeInterval.split('-');
    if (times.length === 2) {
      const [startTime, endTime] = times;
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const newDate = new Date(date);
      newDate.setHours(startHour, startMinute, 0, 0);

      // Store end time as custom property
      (newDate as any).__endTime = { hour: endHour, minute: endMinute };

      return newDate;
    } else if (times.length === 1) {
      // Single time (start only)
      const [startHour, startMinute] = times[0].split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(startHour, startMinute, 0, 0);
      return newDate;
    }
  }

  // No time interval, return date with time set to 00:00
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
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
  timeInterval,
  taskId,
  onDateChange,
  formatFunction = formatSimpleDate,
  className = "text-xs text-muted-foreground"
}: {
  date: Date;
  timeInterval?: string;
  taskId: string;
  onDateChange: (taskId: string, date: Date | undefined) => void;
  formatFunction?: (date: Date) => string;
  className?: string;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <SimpleDatePicker
      date={prepareDateForPicker(date, timeInterval)}
      onDateChange={(newDate) => onDateChange(taskId, newDate)}
      align="center"
      side="right"
      allowClear={true}
    >
      <span
        className={cn("cursor-pointer hover:text-foreground transition-colors", className)}
        onClick={handleClick}
      >
        {formatFunction(date)}
      </span>
    </SimpleDatePicker>
  );
};
interface TaskManagementProps {
  onTaskSidebarChange?: (isOpen: boolean) => void;
}

export function TaskManagement({ onTaskSidebarChange }: TaskManagementProps = {}) {
  const [tasks, setTasks] = useState<Task[]>([...mockTasks]);
  const [activeView, setActiveView] = useState("today");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isAreasExpanded, setIsAreasExpanded] = useState(true);
  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>({});
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTaskDialogKey, setNewTaskDialogKey] = useState(0);
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
    timeInterval: undefined as string | undefined,
    project: "",
    step: undefined as string | undefined,
    timeframe: "NOW" as Task["timeframe"]
  });
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditingTask({...task});
    setIsTaskViewOpen(true);
    setIsEditing(true); // Start in edit mode
    onTaskSidebarChange?.(true);
  };

  const handleAddTask = (projectId: string, stepId?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: "New Task",
      description: "",
      priority: "medium",
      completed: null,
      cancelled: null,
      dueDate: undefined,
      timeInterval: undefined,
      area: getAreaFromProject(projectId),
      project: projectId,
      step: stepId,
      created: new Date(),
      timeframe: "NOW"
    };

    setTasks(prev => [...prev, newTask]);
  };

  const handleAssignTaskToStep = (taskId: string, stepId: string) => {
    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId ? { ...task, step: stepId } : task
    ));
  };

  const createTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      completed: null,
      cancelled: null,
      dueDate: newTask.dueDate,
      timeInterval: newTask.timeInterval,
      area: getAreaFromProject(newTask.project),
      project: newTask.project,
      step: newTask.step,
      created: new Date(),
      timeframe: newTask.timeframe
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: undefined,
      timeInterval: undefined,
      project: "",
      step: undefined,
      timeframe: "NOW"
    });
    setIsNewTaskDialogOpen(false);
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

  const handleSidebarClose = () => {
    // Auto-save changes when closing
    if (editingTask) {
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === editingTask.id ? editingTask : task
      ));
    }
    setSelectedTask(null);
    setIsTaskViewOpen(false);
    setIsEditing(false);
    setEditingTask(null);
    onTaskSidebarChange?.(false);
  };

  const updateEditingTask = useCallback((updates: Partial<Task>) => {
    setEditingTask(prev => {
      if (!prev) return prev;

      // Check if any of the updates actually change the values
      const hasChanges = Object.keys(updates).some(key => {
        const typedKey = key as keyof Task;
        return prev[typedKey] !== updates[typedKey];
      });

      // Only update if there are actual changes
      if (!hasChanges) return prev;

      const updatedTask = {...prev, ...updates};

      // Immediately sync changes to the main tasks array
      setTasks(prevTasks => prevTasks.map(task =>
        task.id === prev.id ? updatedTask : task
      ));

      return updatedTask;
    });
  }, []);
  const toggleTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        // Cycle: unchecked -> checked -> unchecked
        if (task.cancelled !== null) {
          // If cancelled, go to unchecked
          return { ...task, cancelled: null, completed: null };
        } else if (task.completed === null) {
          // If unchecked, go to checked
          return { ...task, completed: new Date(), cancelled: null };
        } else {
          // If checked, go to unchecked
          return { ...task, completed: null, cancelled: null };
        }
      }
      return task;
    }));
  };

  const cancelTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? {
      ...task,
      completed: null,
      cancelled: new Date()
    } : task));
  };
  const updateTaskTimeframe = (taskId: string, timeframe: "NOW" | "NEXT" | "LATER" | "SOMEDAY") => {
    setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? {
      ...task,
      timeframe
    } : task));
  };
  
  const updateTaskDueDate = useCallback((taskId: string, dueDate: Date | undefined) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        if (dueDate) {
          // Extract time interval from the date object if it has time set
          const hasTime = dueDate.getHours() !== 0 || dueDate.getMinutes() !== 0 || (dueDate as any).__endTime;

          if (hasTime) {
            const startHour = dueDate.getHours().toString().padStart(2, '0');
            const startMinute = dueDate.getMinutes().toString().padStart(2, '0');
            const startTime = `${startHour}:${startMinute}`;

            let timeInterval = startTime;

            if ((dueDate as any).__endTime) {
              const endHour = (dueDate as any).__endTime.hour.toString().padStart(2, '0');
              const endMinute = (dueDate as any).__endTime.minute.toString().padStart(2, '0');
              const endTime = `${endHour}:${endMinute}`;
              timeInterval = `${startTime}-${endTime}`;
            }

            return { ...task, dueDate, timeInterval };
          } else {
            // No time, clear the time interval
            return { ...task, dueDate, timeInterval: undefined };
          }
        } else {
          return { ...task, dueDate: undefined, timeInterval: undefined };
        }
      }
      return task;
    }));
  }, []);

  const handleNewTaskDateChange = useCallback((date: Date | undefined) => {
    setNewTask((prev) => ({
      ...prev,
      dueDate: date,
    }));
  }, []);

  const handleNewTaskTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTask((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  }, []);

  const handleNewTaskDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewTask((prev) => ({
      ...prev,
      description: e.target.value,
    }));
  }, []);

  const handleNewTaskPriorityChange = useCallback((value: string) => {
    setNewTask((prev) => ({
      ...prev,
      priority: value as Task["priority"],
    }));
  }, []);

  const handleNewTaskProjectChange = useCallback((value: string) => {
    setNewTask((prev) => ({
      ...prev,
      project: value,
      step: undefined // Clear step when project changes
    }));
  }, []);

  const handleNewTaskStepChange = useCallback((value: string) => {
    setNewTask((prev) => ({
      ...prev,
      step: value === "none" ? undefined : value,
    }));
  }, []);

  const handleNewTaskTimeframeChange = useCallback((value: string) => {
    setNewTask((prev) => ({
      ...prev,
      timeframe: value as Task["timeframe"],
    }));
  }, []);
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
    icon: Folder,
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

  // Close sidebar when view changes
  useEffect(() => {
    if (isTaskViewOpen) {
      handleSidebarClose();
    }
  }, [activeView]);
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
  const filterAndSortTasks = (tasks: Task[]) => {
    // Apply completion filter for all views except completed view
    let filteredTasks = tasks;
    const isTaskDone = (task: Task) => task.completed !== null || task.cancelled !== null;

    if (activeView === "today" && showCompleted) {
      // In Today view, when showing completed tasks, only show those completed today
      filteredTasks = tasks.filter(task =>
        (!isTaskDone(task) && task.dueDate && task.dueDate <= endOfDay(new Date())) ||
        ((task.completed !== null && isToday(task.completed)) || (task.cancelled !== null && isToday(task.cancelled)))
      );
    } else if (activeView === "upcoming" && showCompleted) {
      // In Upcoming view, when showing completed tasks, only show those completed today or later
      filteredTasks = tasks.filter(task =>
        !isTaskDone(task) ||
        ((task.completed !== null && task.completed >= startOfDay(new Date())) ||
         (task.cancelled !== null && task.cancelled >= startOfDay(new Date())))
      );
    } else if (activeView !== "completed" && !showCompleted) {
      filteredTasks = tasks.filter(task => !isTaskDone(task));
    }

    return [...filteredTasks].sort((a, b) => {
      // Primary sort: For all views except "completed", unchecked tasks come first
      if (activeView !== "completed") {
        const aIsDone = isTaskDone(a);
        const bIsDone = isTaskDone(b);
        if (aIsDone !== bIsDone) {
          return aIsDone ? 1 : -1; // unchecked first, done tasks last
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
        [groupId]: prev[groupId] !== false ? false : true
      }));
    };
    return <div className="space-y-6">
        {groupOrder.map(group => {
        const tasks = tasksByTimeGroup[group];
        if (!tasks || tasks.length === 0) return null;
        const isExpanded = expandedAreas[group] !== false; // default to expanded

        return <div key={group} className="bg-white rounded-[10px] overflow-hidden shadow-sm border border-gray-100">
              <button onClick={() => toggleGroup(group)} className="flex items-center gap-2 hover:bg-muted/50 p-3 transition-colors w-full text-left group">
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" /> : <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {groupLabels[group as keyof typeof groupLabels]}
                </h3>
                <span className="text-sm text-muted-foreground">({tasks.length})</span>
              </button>

              {isExpanded && <div className="space-y-0 animate-fade-in pb-2">
                   {tasks.map(task => <div key={task.id} className={cn("rounded-lg p-2 hover:bg-gray-50 transition-all duration-200 mx-3 cursor-pointer", (task.completed !== null || task.cancelled !== null) && "opacity-60", selectedTask?.id === task.id && "bg-primary/10 border border-primary/20")} onClick={() => handleTaskClick(task)}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={task.completed !== null || task.cancelled !== null} className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority, task.cancelled !== null))} onChange={() => toggleTask(task.id)} onClick={e => e.stopPropagation()} />
                        {task.timeInterval &&
                          <SimpleDatePicker
                            date={prepareDateForPicker(task.dueDate, task.timeInterval)}
                            onDateChange={(newDate) => updateTaskDueDate(task.id, newDate)}
                            align="center"
                            side="right"
                            allowClear={true}
                          >
                            <span
                              className="text-muted-foreground bg-[rgba(238,235,231,1)] px-1.5 py-0.5 rounded text-[10px] cursor-pointer hover:bg-gray-200 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {task.timeInterval}
                            </span>
                          </SimpleDatePicker>
                        }
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className={cn("text-card-foreground", (task.completed !== null || task.cancelled !== null) && "line-through")}>
                                  {task.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                {task.project ? (
                                  <span className="text-xs text-gray-500">
                                    {mockProjects.find(p => p.id === task.project)?.title}
                                  </span>
                                ) : (
                                  <Select
                                    value="none"
                                    onValueChange={(value) => handleProjectAssignment(task, value)}
                                  >
                                    <SelectTrigger
                                      className="h-6 w-6 p-0 border-none bg-transparent hover:bg-muted rounded flex items-center justify-center [&_svg:last-child]:hidden"
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
                                {getAreaFromProject(task.project) && <span className={cn("text-xs text-white px-2 py-1 rounded", mockAreas.find(a => a.id === getAreaFromProject(task.project))?.color || "bg-muted")}>
                                    {mockAreas.find(a => a.id === getAreaFromProject(task.project))?.name}
                                  </span>}
                                {task.dueDate && <ClickableDueDate
                                  date={task.dueDate}
                                  timeInterval={task.timeInterval}
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
    const completedTasks = tasks.filter(task => task.completed !== null || task.cancelled !== null);
    const tasksByDate = completedTasks.reduce((acc, task) => {
      const completionDate = task.completed || task.cancelled;
      if (!completionDate) return acc;
      const dateKey = format(completionDate, "yyyy-MM-dd");
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
        [dateKey]: prev[dateKey] !== false ? false : true
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
                  {filterAndSortTasks(tasks).map(task => <div key={task.id} className={cn("rounded-lg p-2 hover:bg-card  hover:shadow-soft transition-all duration-200 ml-6 cursor-pointer opacity-60", selectedTask?.id === task.id && "bg-primary/10 border border-primary/20")} onClick={() => handleTaskClick(task)}>
                      <div className="flex items-center gap-3">
                        {(task.completed || task.cancelled) && <span className="text-xs text-muted-foreground font-medium w-12 text-right">
                          {formatCompletedTime(task.completed || task.cancelled!)}
                        </span>}
                        <input type="checkbox" checked={task.completed !== null || task.cancelled !== null} className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority, task.cancelled !== null))} onChange={() => toggleTask(task.id)} onClick={e => e.stopPropagation()} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-card-foreground line-through">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 ml-2">
                              {task.project ? (
                                <span className="text-xs text-gray-500">
                                  {mockProjects.find(p => p.id === task.project)?.title}
                                </span>
                              ) : (
                                <Select
                                  value="none"
                                  onValueChange={(value) => handleProjectAssignment(task, value)}
                                >
                                  <SelectTrigger
                                    className="h-6 w-6 p-0 border-none bg-transparent hover:bg-muted rounded flex items-center justify-center [&_svg:last-child]:hidden"
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
                              {getAreaFromProject(task.project) && <span className={cn("text-xs text-white px-2 py-1 rounded", mockAreas.find(a => a.id === getAreaFromProject(task.project))?.color || "bg-muted")}>
                                  {mockAreas.find(a => a.id === getAreaFromProject(task.project))?.name}
                                </span>}
                              <span className={cn("text-xs px-2 py-1 rounded font-medium uppercase", getTimeframeColor(task.timeframe))}>
                                {task.timeframe}
                            </span>
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
  const renderInboxView = () => {
    let inboxTasks = tasks.filter(task => !task.dueDate && !task.project);
    const isTaskDone = (task: Task) => task.completed !== null || task.cancelled !== null;

    // Apply completion filter
    if (showCompleted) {
      // In Inbox view, when showing completed tasks, only show those completed today
      inboxTasks = inboxTasks.filter(task =>
        !isTaskDone(task) ||
        ((task.completed !== null && isToday(task.completed)) ||
         (task.cancelled !== null && isToday(task.cancelled)))
      );
    } else {
      inboxTasks = inboxTasks.filter(task => !isTaskDone(task));
    }

    // Sort by created date, newest first, with uncompleted tasks first
    const sortedTasks = [...inboxTasks].sort((a, b) => {
      // Primary sort: uncompleted tasks first
      const aIsDone = isTaskDone(a);
      const bIsDone = isTaskDone(b);
      if (aIsDone !== bIsDone) {
        return aIsDone ? 1 : -1;
      }
      // Secondary sort: by created date, newest first
      return b.created.getTime() - a.created.getTime();
    });

    return <div className="space-y-0">
      {sortedTasks.map(task => <div key={task.id} className={cn("rounded-lg p-2 hover:bg-card  hover:shadow-soft transition-all duration-200 cursor-pointer", (task.completed !== null || task.cancelled !== null) && "opacity-60", selectedTask?.id === task.id && "bg-primary/10 border border-primary/20")} onClick={() => handleTaskClick(task)}>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-medium w-20 text-right">
              {formatCreatedDate(task.created)}
            </span>
            <input type="checkbox" checked={task.completed !== null || task.cancelled !== null} className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority, task.cancelled !== null))} onChange={() => toggleTask(task.id)} onClick={e => e.stopPropagation()} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className={cn("text-card-foreground", (task.completed !== null || task.cancelled !== null) && "line-through")}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-2 ml-2">
                  {task.project ? (
                    <span className="text-xs text-gray-500">
                      {mockProjects.find(p => p.id === task.project)?.title}
                    </span>
                  ) : (
                    <Select
                      value="none"
                      onValueChange={(value) => handleProjectAssignment(task, value)}
                    >
                      <SelectTrigger
                        className="h-6 w-6 p-0 border-none bg-transparent hover:bg-muted rounded flex items-center justify-center [&_svg:last-child]:hidden"
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

                  <SimpleDatePicker
                    date={task.dueDate}
                    onDateChange={(date) => updateTaskDueDate(task.id, date)}
                    align="center"
                    side="left"
                    allowClear={true}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 hover:bg-muted"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </SimpleDatePicker>
                </div>
              </div>
            </div>
          </div>
        </div>)}
    </div>;
  };

  const renderTaskList = (tasks: Task[]) => <div className="space-y-0">
      {tasks.map(task => <div key={task.id} className={cn("rounded-lg p-2 hover:bg-card  hover:shadow-soft transition-all duration-200 cursor-pointer", (task.completed !== null || task.cancelled !== null) && "opacity-60", selectedTask?.id === task.id && "bg-primary/10 border border-primary/20")} onClick={() => handleTaskClick(task)}>
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={task.completed !== null || task.cancelled !== null} className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority, task.cancelled !== null))} onChange={() => toggleTask(task.id)} onClick={e => e.stopPropagation()} />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                                  <h3 className={cn("text-card-foreground", (task.completed !== null || task.cancelled !== null) && "line-through")}>
                    {task.title}
                  </h3>
                <div className="flex items-center gap-2 ml-2">
                  {task.project ? (
                    <span className="text-xs text-gray-500">
                      {mockProjects.find(p => p.id === task.project)?.title}
                    </span>
                  ) : (
                    <Select
                      value="none"
                      onValueChange={(value) => handleProjectAssignment(task, value)}
                    >
                      <SelectTrigger
                        className="h-6 w-6 p-0 border-none bg-transparent hover:bg-muted rounded flex items-center justify-center [&_svg:last-child]:hidden"
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
                        timeInterval={task.timeInterval}
                        taskId={task.id}
                        onDateChange={updateTaskDueDate}
                        formatFunction={formatTaskDate}
                        className={cn("cursor-pointer hover:opacity-80 transition-opacity", isTaskOverdue(task) && "text-red-500")}
                      />
                    </span>}
                  {getAreaFromProject(task.project) && <span className={cn("text-xs text-white px-2 py-1 rounded", mockAreas.find(a => a.id === getAreaFromProject(task.project))?.color || "bg-muted")}>
                      {mockAreas.find(a => a.id === getAreaFromProject(task.project))?.name}
                    </span>}
                  <span className={cn("text-xs px-2 py-1 rounded font-medium uppercase", getTimeframeColor(task.timeframe))}>
                    {task.timeframe}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>)}
    </div>;
  const renderTodayView = () => {
    const todayTasks = tasks.filter(task => task.dueDate && task.dueDate <= endOfDay(new Date()));
    const tasksByArea = todayTasks.reduce((acc, task) => {
      const areaId = getAreaFromProject(task.project) || 'no-area';
      if (!acc[areaId]) {
        acc[areaId] = [];
      }
      acc[areaId].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
    const toggleArea = (areaId: string) => {
      setExpandedAreas(prev => ({
        ...prev,
        [areaId]: prev[areaId] !== false ? false : true
      }));
    };
    return <div className="space-y-6">
        {Object.entries(tasksByArea).map(([areaId, tasks]) => {
        const area = mockAreas.find(a => a.id === areaId);
        const areaName = area?.name || (areaId === 'no-area' ? 'No area' : areaId);
        const areaColor = area?.color || 'bg-muted';
        const isExpanded = expandedAreas[areaId] !== false; // default to expanded

        // Debug logging for No area group
        if (areaId === 'no-area') {
          console.log('No area tasks:', tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed, cancelled: t.cancelled, project: t.project, area: getAreaFromProject(t.project) })));
        }

        return <div key={areaId} className="bg-white rounded-[10px] overflow-hidden shadow-sm border border-gray-100">
              <button onClick={() => toggleArea(areaId)} className="flex items-center gap-2 hover:bg-muted/50 p-3 transition-colors w-full text-left group">
                {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" /> : <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />}
                <div className={cn("w-3 h-3 rounded-full", areaColor)} />
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors flex-1">{areaName}</h3>

                {/* Progress bar and task numbers */}
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${tasks.length > 0 ? (tasks.filter(t => t.completed !== null || t.cancelled !== null).length / tasks.length) * 100 : 0}%`,
                        transition: 'width 0.3s ease-out'
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {tasks.filter(t => t.completed !== null || t.cancelled !== null).length} / {tasks.length}
                  </span>
                </div>
              </button>

              {isExpanded && <div className="space-y-0 animate-fade-in pb-2">
                   {filterAndSortTasks(tasks).map(task => <div key={task.id} className={cn("rounded-lg p-2 hover:bg-gray-50 transition-all duration-200 mx-3 cursor-pointer", (task.completed !== null || task.cancelled !== null) && "opacity-60", selectedTask?.id === task.id && "bg-primary/10 border border-primary/20")} onClick={() => handleTaskClick(task)}>
                       <div className="flex items-center gap-3">
                         <input type="checkbox" checked={task.completed !== null || task.cancelled !== null} className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority, task.cancelled !== null))} onChange={() => toggleTask(task.id)} onClick={e => e.stopPropagation()} />
                         {task.timeInterval &&
                           <SimpleDatePicker
                             date={prepareDateForPicker(task.dueDate, task.timeInterval)}
                             onDateChange={(newDate) => updateTaskDueDate(task.id, newDate)}
                             align="center"
                             side="right"
                             allowClear={true}
                           >
                             <span
                               className="text-muted-foreground bg-white px-1.5 py-0.5 rounded text-[10px] cursor-pointer hover:bg-gray-200 transition-colors"
                               onClick={(e) => e.stopPropagation()}
                             >
                               {task.timeInterval}
                             </span>
                           </SimpleDatePicker>
                         }
                         <div className="flex-1">
                           <div className="flex items-center justify-between">
                             <h4 className={cn("text-card-foreground", (task.completed !== null || task.cancelled !== null) && "line-through")}>
                               {task.title}
                             </h4>
                             <div className="flex items-center gap-2">
                               {task.project ? (
                                 <span className="text-xs text-gray-500">
                                   {mockProjects.find(p => p.id === task.project)?.title}
                                 </span>
                               ) : (
                                 <Select
                                   value="none"
                                   onValueChange={(value) => handleProjectAssignment(task, value)}
                                 >
                                   <SelectTrigger
                                     className="h-6 w-6 p-0 border-none bg-transparent hover:bg-muted rounded flex items-center justify-center [&_svg:last-child]:hidden"
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
                               {task.dueDate && <ClickableDueDate
                                 date={task.dueDate}
                                 timeInterval={task.timeInterval}
                                 taskId={task.id}
                                 onDateChange={updateTaskDueDate}
                                 formatFunction={formatTodayViewDate}
                                 className={cn("text-xs text-muted-foreground font-medium", isTaskOverdue(task) && "text-red-500")}
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
  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const projectId = newTask.project || undefined;
    const areaId = getAreaFromProject(projectId);

    const task: Task = {
      id: Date.now().toString(), // Simple ID generation
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      priority: newTask.priority,
      completed: null,
      cancelled: null,
      dueDate: newTask.dueDate,
      timeInterval: newTask.timeInterval,
      area: areaId,
      project: projectId,
      step: newTask.step,
      created: new Date(),
      timeframe: newTask.timeframe
    };

    setTasks(prevTasks => [...prevTasks, task]);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: undefined,
      timeInterval: undefined,
      project: "",
      step: undefined,
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
      timeInterval: undefined,
      project: "",
      step: undefined,
      timeframe: "NOW"
    });
  };
  const renderAreasView = () => {
    // Only show tasks that have a project assigned (which gives them an area)
    const tasksWithProjects = tasks.filter(task => task.project);
    return <div className="h-full">
      <KanbanBoard tasks={filterAndSortTasks(tasksWithProjects)} onTaskClick={handleTaskClick} onToggleTask={toggleTask} onUpdateTaskTimeframe={updateTaskTimeframe} onUpdateTaskDueDate={updateTaskDueDate} areas={mockAreas} selectedAreas={kanbanSelectedAreas} projects={mockProjects} onProjectAssignment={handleProjectAssignment} selectedTask={selectedTask} />
    </div>;
  };
  const getFilteredTasks = () => {
    switch (activeView) {
      case "today":
        return tasks.filter(task => task.dueDate && task.dueDate <= endOfDay(new Date()));
      case "upcoming":
        return tasks.filter(task => task.dueDate && !isToday(task.dueDate));
      case "inbox":
        return tasks.filter(task => !task.dueDate && !task.area);
      case "completed":
        return tasks.filter(task => task.completed !== null || task.cancelled !== null);
      default:
        return tasks;
    }
  };
  return <div className="bg-[#fafafa]">
      {/* Header with title */}
      <div className="bg-card">
        <div className="flex items-center justify-between px-6 py-3 bg-white border-[#e2e2e2]">
          <nav className="flex items-center gap-1 rounded-lg w-fit">
            {taskViews.map(view => {
            const isActive = activeView === view.id;
            return <button key={view.id} onClick={() => setActiveView(view.id)} className={cn("flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 nav-button-hover", isActive ? "text-foreground nav-button-active" : "text-muted-foreground hover:text-foreground")}>
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
                <Dialog open={isNewTaskDialogOpen} onOpenChange={(open) => {
                  setIsNewTaskDialogOpen(open);
                  if (!open) {
                    // Reset form and increment key for fresh render next time
                    setNewTask({
                      title: "",
                      description: "",
                      priority: "medium",
                      dueDate: undefined,
                      timeInterval: undefined,
                      project: "",
                      step: undefined,
                      timeframe: "NOW"
                    });
                    setNewTaskDialogKey(prev => prev + 1);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      className="gap-2"
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                      New Task
                    </Button>
                  </DialogTrigger>
                  <DialogContent key={newTaskDialogKey} className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Task</DialogTitle>
                      <DialogDescription>
                        Add a new task to your project or step.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={newTask.title}
                          onChange={handleNewTaskTitleChange}
                          placeholder="Enter task title"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newTask.description}
                          onChange={handleNewTaskDescriptionChange}
                          placeholder="Enter task description (optional)"
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newTask.priority}
                          onValueChange={handleNewTaskPriorityChange}
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
                        <Label htmlFor="project">Project</Label>
                        <Select
                          value={newTask.project}
                          onValueChange={handleNewTaskProjectChange}
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
                      {newTask.project && (
                        <div className="grid gap-2">
                          <Label htmlFor="step">Step (optional)</Label>
                          <Select
                            value={newTask.step || "none"}
                            onValueChange={handleNewTaskStepChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select step" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No specific step</SelectItem>
                              {mockProjects
                                .find(p => p.id === newTask.project)
                                ?.steps?.map((step) => (
                                  <SelectItem key={step.id} value={step.id}>
                                    {step.title}
                                  </SelectItem>
                                )) || []
                              }
                            </SelectContent>
                          </Select>
                          {newTask.step && (
                            <p className="text-xs text-muted-foreground">
                              Task will be assigned to: {mockProjects.find(p => p.id === newTask.project)?.steps?.find(s => s.id === newTask.step)?.title}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="grid gap-2">
                        <Label htmlFor="timeframe">Timeframe</Label>
                        <Select
                          value={newTask.timeframe}
                          onValueChange={handleNewTaskTimeframeChange}
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
                        <SimpleDatePickerButton
                          date={newTask.dueDate}
                          onDateChange={handleNewTaskDateChange}
                          placeholder="Pick a date"
                          align="center"
                          side="right"
                          allowClear={true}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsNewTaskDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createTask} disabled={!newTask.title.trim()}>
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
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onToggleTask={toggleTask}
              onAddTask={handleAddTask}
              onAssignTaskToStep={handleAssignTaskToStep}
              onUpdateTaskDueDate={updateTaskDueDate}
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

      {/* Task Details Sidebar */}
      <TaskDetailsSidebar
        isOpen={isTaskViewOpen}
        task={editingTask}
        onClose={handleSidebarClose}
        onUpdateTask={updateEditingTask}
        projects={mockProjects}
        areas={mockAreas}
        getAreaFromProject={getAreaFromProject}
      />
    </div>;
}
