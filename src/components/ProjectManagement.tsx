import { useState } from "react";
import { Calendar, Plus, MoreHorizontal, Filter, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateTimePicker, InlineDateTimePicker } from "@/components/ui/date-time-picker";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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
  description?: string;
  area: string;
  startDate?: Date;
  endDate?: Date;
  status: "lead" | "active" | "finished" | "archive";
  steps: Step[];
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Website Redesign",
    description: "Complete overhaul of company website with modern design",
    area: "work",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-03-15"),
    status: "active",
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
    description: "Native iOS and Android app for customer portal",
    area: "work",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-06-30"),
    status: "lead",
    steps: [
      { id: "step-2-1", title: "Planning", projectId: "2", order: 1, completed: false },
      { id: "step-2-2", title: "UI/UX Design", projectId: "2", order: 2, completed: false },
      { id: "step-2-3", title: "Development", projectId: "2", order: 3, completed: false }
    ]
  },
  {
    id: "3",
    title: "Morning Fitness Routine",
    description: "Establish a consistent morning exercise routine",
    area: "health",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-03-31"),
    status: "active",
    steps: [
      { id: "step-3-1", title: "Setup", projectId: "3", order: 1, completed: true },
      { id: "step-3-2", title: "Week 1-4", projectId: "3", order: 2, completed: false }
    ]
  },
  {
    id: "4",
    title: "Home Organization",
    description: "Declutter and organize living spaces",
    area: "order",
    startDate: new Date("2023-12-01"),
    endDate: new Date("2024-01-31"),
    status: "finished",
    steps: [
      { id: "step-4-1", title: "Living Room", projectId: "4", order: 1, completed: true },
      { id: "step-4-2", title: "Bedroom", projectId: "4", order: 2, completed: true }
    ]
  },
  {
    id: "5",
    title: "Family Vacation Planning",
    description: "Plan summer vacation with extended family",
    area: "family",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-05-15"),
    status: "archive",
    steps: [
      { id: "step-5-1", title: "Destination Research", projectId: "5", order: 1, completed: true },
      { id: "step-5-2", title: "Booking", projectId: "5", order: 2, completed: true },
      { id: "step-5-3", title: "Packing", projectId: "5", order: 3, completed: true }
    ]
  }
];

const projectAreas = [
  { id: "work", name: "Work", color: "bg-primary" },
  { id: "health", name: "Health", color: "bg-task-medium" },
  { id: "self-care", name: "Self-care", color: "bg-task-low" },
  { id: "psychology", name: "Psychology", color: "bg-destructive" },
  { id: "fun", name: "Fun", color: "bg-task-urgent" },
  { id: "family", name: "Family", color: "bg-green-500" },
  { id: "chores", name: "Chores", color: "bg-yellow-500" },
  { id: "order", name: "Order", color: "bg-purple-500" }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "lead":
      return "bg-red-500 text-white";
    case "active":
      return "bg-orange-500 text-white";
    case "finished":
      return "bg-green-500 text-white";
    case "archive":
      return "bg-gray-600 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusCircleColor = (status: string) => {
  switch (status) {
    case "lead":
      return "bg-red-500";
    case "active":
      return "bg-orange-500";
    case "finished":
      return "bg-green-500";
    case "archive":
      return "bg-gray-600";
    default:
      return "bg-muted";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "lead":
      return "Lead";
    case "active":
      return "Active";
    case "finished":
      return "Finished";
    case "archive":
      return "Archive";
    default:
      return "Unknown";
  }
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

const formatSimpleDate = (date: Date) => {
  return format(date, "dd.MM.yy");
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
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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
        {formatFunction(date)}
      </span>
    </InlineDateTimePicker>
  );
};

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

interface ProjectManagementProps {
  selectedAreas?: string[];
  selectedStatuses?: string[];
  isNewProjectDialogOpen?: boolean;
  onNewProjectDialogChange?: (open: boolean) => void;
  tasks?: Task[];
  onTaskClick?: (task: Task) => void;
  onToggleTask?: (taskId: string) => void;
  onAddTask?: (project: string, step?: string) => void;
  onAssignTaskToStep?: (taskId: string, stepId: string) => void;
  onUpdateTaskDueDate?: (taskId: string, date: Date | undefined) => void;
}

export function ProjectManagement({
  selectedAreas = [],
  selectedStatuses = [],
  isNewProjectDialogOpen: externalDialogOpen,
  onNewProjectDialogChange,
  tasks = [],
  onTaskClick,
  onToggleTask,
  onAddTask,
  onAssignTaskToStep,
  onUpdateTaskDueDate
}: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>([...mockProjects]);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);

  // Use external dialog state if provided
  const dialogOpen = externalDialogOpen !== undefined ? externalDialogOpen : isNewProjectDialogOpen;
  const setDialogOpen = (open: boolean) => {
    if (onNewProjectDialogChange) {
      onNewProjectDialogChange(open);
    } else {
      setIsNewProjectDialogOpen(open);
    }
  };
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<"status" | "date" | "area" | "none">("none");
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStepTitle, setEditingStepTitle] = useState("");
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    area: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    status: "lead" as Project["status"]
  });

  const handleProjectClick = (project: Project) => {
    if (selectedProject?.id === project.id) {
      setSelectedProject(null);
      setEditingProject(null);
      setIsEditing(false);
    } else {
      setSelectedProject(project);
      setEditingProject({...project});
      setIsEditing(true);
    }
  };

  const updateEditingProject = (updates: Partial<Project>) => {
    if (editingProject) {
      setEditingProject({...editingProject, ...updates});
    }
  };

  const saveProjectChanges = () => {
    if (editingProject && selectedProject) {
      setProjects(prevProjects => prevProjects.map(project =>
        project.id === editingProject.id ? editingProject : project
      ));
      setSelectedProject(editingProject);
      setIsEditing(false);
    }
  };

  const cancelProjectChanges = () => {
    if (selectedProject) {
      setEditingProject({...selectedProject});
      setIsEditing(true);
    }
  };

  const addStepWithDefaultName = () => {
    if (!editingProject) return;

    const newStep: Step = {
      id: `step-${Date.now()}`,
      title: "New Step",
      projectId: editingProject.id,
      order: editingProject.steps.length + 1,
      completed: false
    };

    const updatedProject = {
      ...editingProject,
      steps: [...editingProject.steps, newStep]
    };

    setEditingProject(updatedProject);
    setProjects(prevProjects => prevProjects.map(project =>
      project.id === editingProject.id ? updatedProject : project
    ));
  };

  const toggleStep = (stepId: string) => {
    if (!editingProject) return;

    const updatedProject = {
      ...editingProject,
      steps: editingProject.steps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    };

    setEditingProject(updatedProject);
    setProjects(prevProjects => prevProjects.map(project =>
      project.id === editingProject.id ? updatedProject : project
    ));
  };

  const deleteStep = (stepId: string) => {
    if (!editingProject) return;

    const updatedProject = {
      ...editingProject,
      steps: editingProject.steps.filter(step => step.id !== stepId)
    };

    setEditingProject(updatedProject);
    setProjects(prevProjects => prevProjects.map(project =>
      project.id === editingProject.id ? updatedProject : project
    ));
  };

  const startEditingStep = (stepId: string, currentTitle: string) => {
    setEditingStepId(stepId);
    setEditingStepTitle(currentTitle);
  };

  const saveStepTitle = () => {
    if (!editingProject || !editingStepId || !editingStepTitle.trim()) {
      cancelStepEdit();
      return;
    }

    const updatedProject = {
      ...editingProject,
      steps: editingProject.steps.map(step =>
        step.id === editingStepId ? { ...step, title: editingStepTitle.trim() } : step
      )
    };

    setEditingProject(updatedProject);
    setProjects(prevProjects => prevProjects.map(project =>
      project.id === editingProject.id ? updatedProject : project
    ));

    setEditingStepId(null);
    setEditingStepTitle("");
  };

  const cancelStepEdit = () => {
    setEditingStepId(null);
    setEditingStepTitle("");
  };

  const addProject = () => {
    if (!newProject.title.trim()) return;

    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      area: newProject.area,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      status: newProject.status,
      steps: []
    };

    setProjects(prev => [...prev, project]);
    setNewProject({
      title: "",
      description: "",
      area: "",
      startDate: undefined,
      endDate: undefined,
      status: "lead"
    });
    setDialogOpen(false);
  };

  const filterAndSortProjects = (projects: Project[]) => {
    let filteredProjects = projects;

    // Filter by selected statuses if any are selected
    if (selectedStatuses.length > 0) {
      filteredProjects = filteredProjects.filter(project => selectedStatuses.includes(project.status));
    }

    // Filter by selected areas if any are selected
    if (selectedAreas.length > 0) {
      filteredProjects = filteredProjects.filter(project => selectedAreas.includes(project.area));
    }

    return [...filteredProjects].sort((a, b) => {
      if (sortBy === "status") {
        const statusOrder = { lead: 0, active: 1, finished: 2, archive: 3 };
        const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 999;
        const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 999;
        return aOrder - bOrder;
      } else if (sortBy === "date") {
        if (!a.startDate && !b.startDate) return 0;
        if (!a.startDate) return 1;
        if (!b.startDate) return -1;
        return a.startDate.getTime() - b.startDate.getTime();
      } else if (sortBy === "area") {
        return a.area.localeCompare(b.area);
      }
      return 0;
    });
  };

  const formatDateRange = (startDate?: Date, endDate?: Date) => {
    if (!startDate && !endDate) return "No dates set";
    if (startDate && endDate) {
      return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
    }
    if (startDate) {
      return `Starts ${format(startDate, "MMM d, yyyy")}`;
    }
    return `Ends ${format(endDate!, "MMM d, yyyy")}`;
  };

  const formatEndDate = (startDate?: Date, endDate?: Date) => {
    if (endDate) {
      return format(endDate, "MMM d, yyyy");
    }
    if (startDate) {
      return `Starts ${format(startDate, "MMM d, yyyy")}`;
    }
    return "No end date";
  };

  return (
    <div className="flex bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Projects List */}
        <div className="p-6 bg-[#fafafa] border border-[#21222c]/0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filterAndSortProjects(projects).map(project => (
              <div
                key={project.id}
                className={cn(
                  "bg-card border border-border rounded-lg p-4 shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer",
                  selectedProject?.id === project.id && "ring-2 ring-primary bg-primary/5"
                )}
                onClick={() => handleProjectClick(project)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={cn("w-3 h-3 rounded-full shrink-0", getStatusCircleColor(project.status))}
                      title={getStatusLabel(project.status)}
                    />
                  </div>
                  <h3 className="font-semibold text-card-foreground text-base line-clamp-2 flex-1">{project.title}</h3>

                  <div className="space-y-2 text-xs">
                    <div className="text-muted-foreground truncate">
                      {formatEndDate(project.startDate, project.endDate)}
                    </div>
                    <div className="flex items-center gap-1">
                    </div>
                  </div>

                  {/* Progress bar and area tag row */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Progress bar on the left */}
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${project.steps.length > 0 ? (project.steps.filter(s => s.completed).length / project.steps.length) * 100 : 0}%`,
                            transition: 'width 0.3s ease-out'
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {project.steps.filter(s => s.completed).length} / {project.steps.length}
                      </span>
                    </div>

                    {/* Area tag on the right */}
                    <span className={cn("text-xs text-white px-2 py-1 rounded", projectAreas.find(a => a.id === project.area)?.color || "bg-muted")}>
                      {projectAreas.find(a => a.id === project.area)?.name || project.area}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Project Details Section */}
          {selectedProject && editingProject && (
            <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-soft">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editingProject.title}
                        onChange={(e) => updateEditingProject({ title: e.target.value })}
                        className="font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
                        style={{ fontSize: '24px', maxWidth: '400px' }}
                        placeholder="Project title"
                      />

                      {/* Project Progress */}
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${editingProject.steps.length > 0 ? (editingProject.steps.filter(s => s.completed).length / editingProject.steps.length) * 100 : 0}%`,
                              transition: 'width 0.3s ease-out'
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {editingProject.steps.filter(s => s.completed).length} / {editingProject.steps.length}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap ml-auto">
                      {/* Area Tag */}
                      <Select
                        value={editingProject.area}
                        onValueChange={(value) => updateEditingProject({ area: value })}
                      >
                        <SelectTrigger className={cn("h-auto w-auto border-none text-xs text-white px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity [&>svg]:hidden", projectAreas.find(a => a.id === editingProject.area)?.color || "bg-muted")}>
                          <SelectValue>
                            {projectAreas.find(a => a.id === editingProject.area)?.name || editingProject.area}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {projectAreas.map(area => (
                            <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Status Tag */}
                      <Select
                        value={editingProject.status}
                        onValueChange={(value: Project["status"]) => updateEditingProject({ status: value })}
                      >
                        <SelectTrigger className={cn("h-auto w-auto border-none px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity [&>svg]:hidden", getStatusColor(editingProject.status))}>
                          <SelectValue>
                            {getStatusLabel(editingProject.status)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="finished">Finished</SelectItem>
                          <SelectItem value="archive">Archive</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Timeline Tags */}
                      <div className="flex items-center gap-1">
                        <InlineDateTimePicker
                        date={editingProject.startDate}
                        onDateChange={(date) => updateEditingProject({ startDate: date })}
                        align="center"
                        showTime={false}
                        allowClear={true}
                      >
                        <Button variant="outline" size="sm" className="h-auto px-2 py-1 text-xs cursor-pointer hover:bg-muted/50">
                          <Calendar className="mr-1 h-3 w-3" />
                          {editingProject.startDate ? format(editingProject.startDate, "MMM d") : "Start"}
                        </Button>
                      </InlineDateTimePicker>

                      <span className="text-muted-foreground">→</span>

                      <InlineDateTimePicker
                        date={editingProject.endDate}
                        onDateChange={(date) => updateEditingProject({ endDate: date })}
                        align="center"
                        showTime={false}
                        allowClear={true}
                      >
                        <Button variant="outline" size="sm" className="h-auto px-2 py-1 text-xs cursor-pointer hover:bg-muted/50">
                          <Calendar className="mr-1 h-3 w-3" />
                          {editingProject.endDate ? format(editingProject.endDate, "MMM d") : "End"}
                        </Button>
                      </InlineDateTimePicker>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    saveProjectChanges();
                    setSelectedProject(null);
                    setEditingProject(null);
                    setIsEditing(false);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>

              <div>
                <Textarea
                  value={editingProject.description || ""}
                  onChange={(e) => updateEditingProject({ description: e.target.value })}
                  className="border-none bg-transparent p-0 resize-none focus-visible:ring-0"
                  placeholder="Enter project description..."
                  rows={3}
                />
              </div>

              {/* Project Steps */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Steps</h3>
                </div>

                <div className="space-y-4">
                  {editingProject.steps.sort((a, b) => a.order - b.order).map(step => {
                    const stepTasks = tasks.filter(task => task.step === step.id);

                    return (
                      <div 
                        key={step.id} 
                        className="border border-border rounded-lg p-4"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('bg-primary/10', 'border-primary/50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('bg-primary/10', 'border-primary/50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('bg-primary/10', 'border-primary/50');
                          const taskId = e.dataTransfer.getData('text/plain');
                          if (taskId && onAssignTaskToStep) {
                            onAssignTaskToStep(taskId, step.id);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={step.completed}
                              onChange={() => toggleStep(step.id)}
                              className="w-4 h-4 rounded focus:ring-2"
                            />
                            {editingStepId === step.id ? (
                              <Input
                                value={editingStepTitle}
                                onChange={(e) => setEditingStepTitle(e.target.value)}
                                onBlur={saveStepTitle}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    saveStepTitle();
                                  } else if (e.key === 'Escape') {
                                    cancelStepEdit();
                                  }
                                }}
                                className="h-6 border-none p-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary font-medium"
                                autoFocus
                                onFocus={(e) => e.target.select()}
                              />
                            ) : (
                              <h4
                                className={cn(
                                  "font-medium text-foreground cursor-pointer hover:bg-muted/30 px-1 py-0.5 rounded transition-colors",
                                  step.completed && "line-through opacity-60"
                                )}
                                onClick={() => startEditingStep(step.id, step.title)}
                                title="Click to edit step name"
                              >
                                {step.title}
                              </h4>
                            )}
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{
                                    width: `${stepTasks.length > 0 ? (stepTasks.filter(t => t.completed !== null).length / stepTasks.length) * 100 : 0}%`,
                                    transition: 'width 0.3s ease-out'
                                  }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {stepTasks.filter(t => t.completed !== null).length} / {stepTasks.length}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStep(step.id)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                          >
                            ✕
                          </Button>
                        </div>

                        {/* Tasks for this step */}
                        <div className="ml-6">
                          {stepTasks.map(task => (
                            <div
                              key={task.id}
                              draggable
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 active:bg-muted transition-all duration-200 cursor-pointer",
                                task.completed !== null && "opacity-60"
                              )}
                              onClick={() => onTaskClick?.(task)}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', task.id);
                                e.currentTarget.style.opacity = '0.5';
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.style.opacity = '1';
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={task.completed !== null}
                                className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority))}
                                onChange={() => onToggleTask?.(task.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h5 className={cn(
                                    "text-sm font-medium text-foreground truncate",
                                    task.completed !== null && "line-through"
                                  )}>
                                    {task.title}
                                  </h5>
                                   <div className="flex items-center gap-2 ml-2">
                                     {task.dueDate ? (
                                       <ClickableDueDate
                                         date={task.dueDate}
                                         taskId={task.id}
                                         onDateChange={onUpdateTaskDueDate || (() => {})}
                                         formatFunction={formatSimpleDate}
                                         className={cn(
                                           "text-xs cursor-pointer hover:opacity-80 transition-opacity",
                                           task.dueDate < new Date() && !task.completed
                                             ? "text-red-500"
                                             : "text-muted-foreground"
                                         )}
                                       />
                                     ) : (
                                       <InlineDateTimePicker
                                         date={task.dueDate}
                                         onDateChange={(date) => {
                                           if (onUpdateTaskDueDate) {
                                             onUpdateTaskDueDate(task.id, date);
                                           }
                                         }}
                                         align="end"
                                         showTime={false}
                                         allowClear={true}
                                       >
                                         <Button
                                           variant="ghost"
                                           size="sm"
                                           className="h-7 w-7 p-0 hover:bg-muted"
                                           onClick={(e) => e.stopPropagation()}
                                         >
                                           <Calendar className="w-3 h-3 text-muted-foreground" />
                                         </Button>
                                       </InlineDateTimePicker>
                                     )}
                                  </div>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Always show add task button */}
                          <div className="mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                onAddTask?.(editingProject.id, step.id);
                              }}
                              className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto font-normal"
                            >
                              + add task
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {editingProject.steps.length === 0 && (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                      No steps added yet. Create your first step below.
                    </p>
                  )}

                  {/* Add step button */}
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addStepWithDefaultName}
                      className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto font-normal"
                    >
                      + add step
                    </Button>
                  </div>
                </div>

                {/* Unassigned Project Tasks */}
                {(() => {
                  const unassignedTasks = tasks.filter(task => 
                    task.project === editingProject.id && !task.step
                  );
                  
                  if (unassignedTasks.length > 0) {
                    return (
                      <div className="mt-6 pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-foreground">
                            No step
                          </h3>
                        </div>
                        <div className="space-y-0">
                          {unassignedTasks.map(task => (
                            <div
                              key={task.id}
                              draggable
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 active:bg-muted transition-all duration-200 cursor-pointer",
                                task.completed !== null && "opacity-60"
                              )}
                              onClick={() => onTaskClick?.(task)}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', task.id);
                                e.currentTarget.style.opacity = '0.5';
                              }}
                              onDragEnd={(e) => {
                                e.currentTarget.style.opacity = '1';
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={task.completed !== null}
                                className={cn("w-4 h-4 rounded focus:ring-2", getPriorityCheckboxColor(task.priority))}
                                onChange={() => onToggleTask?.(task.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h5 className={cn(
                                    "text-sm font-medium text-foreground truncate",
                                    task.completed !== null && "line-through"
                                  )}>
                                    {task.title}
                                  </h5>
                                  <div className="flex items-center gap-2 ml-2">
                                    {task.dueDate ? (
                                      <ClickableDueDate
                                        date={task.dueDate}
                                        taskId={task.id}
                                        onDateChange={onUpdateTaskDueDate || (() => {})}
                                        formatFunction={formatSimpleDate}
                                        className={cn(
                                          "text-xs cursor-pointer hover:opacity-80 transition-opacity",
                                          task.dueDate < new Date() && !task.completed
                                            ? "text-red-500"
                                            : "text-muted-foreground"
                                        )}
                                      />
                                    ) : (
                                      <InlineDateTimePicker
                                        date={task.dueDate}
                                        onDateChange={(date) => {
                                          if (onUpdateTaskDueDate) {
                                            onUpdateTaskDueDate(task.id, date);
                                          }
                                        }}
                                        align="end"
                                        showTime={false}
                                        allowClear={true}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 hover:bg-muted"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <Calendar className="w-3 h-3 text-muted-foreground" />
                                        </Button>
                                      </InlineDateTimePicker>
                                    )}
                                  </div>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Project Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newProject.title}
                onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter project title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter project description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="area">Area</Label>
              <Select value={newProject.area} onValueChange={(value) => setNewProject(prev => ({ ...prev, area: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {projectAreas.map(area => (
                    <SelectItem key={area.id} value={area.id}>{area.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <DateTimePicker
                  date={newProject.startDate}
                  onDateChange={(date) => setNewProject(prev => ({ ...prev, startDate: date }))}
                  placeholder="Pick start date"
                  showTime={false}
                  allowClear={true}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <DateTimePicker
                  date={newProject.endDate}
                  onDateChange={(date) => setNewProject(prev => ({ ...prev, endDate: date }))}
                  placeholder="Pick end date"
                  showTime={false}
                  allowClear={true}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newProject.status} onValueChange={(value: Project["status"]) => setNewProject(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addProject}>
              Create Project
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
