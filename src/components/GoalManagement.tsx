import { useState, useCallback } from "react";
import { Calendar, Plus, MoreHorizontal, Filter, ArrowUpDown, Target, Folder, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateTimePicker, InlineDateTimePicker } from "@/components/ui/date-time-picker";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  title: string;
  description?: string;
  area: string;
  startDate?: Date;
  endDate?: Date;
  status: "lead" | "active" | "finished" | "archive";
  steps: any[];
}

interface Goal {
  id: string;
  title: string;
  description?: string;
  area: string;
  startDate?: Date;
  endDate?: Date;
  status: "new" | "active" | "paused" | "achieved" | "archive";
  projectIds: string[]; // References to attached projects
}

const mockGoals: Goal[] = [
  {
    id: "goal-1",
    title: "Complete Website Redesign Project",
    description: "Successfully deliver the new company website with modern design and improved user experience",
    area: "work",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-03-31"),
    status: "active",
    projectIds: ["1"] // Website Redesign project
  },
  {
    id: "goal-2", 
    title: "Establish Daily Fitness Routine",
    description: "Build and maintain a consistent morning workout habit",
    area: "health",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-06-30"),
    status: "active",
    projectIds: ["3"] // Morning Fitness Routine project
  },
  {
    id: "goal-3",
    title: "Launch Mobile Application",
    description: "Complete development and launch our first mobile app",
    area: "work",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-08-31"),
    status: "new",
    projectIds: ["2"] // Mobile App Development project
  },
  {
    id: "goal-4",
    title: "Organize Living Space",
    description: "Declutter and organize all areas of the home",
    area: "order",
    startDate: new Date("2023-12-01"),
    endDate: new Date("2024-02-29"),
    status: "achieved",
    projectIds: ["4"] // Home Organization project
  }
];

// Import areas from existing data
const areas = [
  { id: "work", name: "Work", color: "bg-primary" },
  { id: "health", name: "Health", color: "bg-emerald-500" },
  { id: "self-care", name: "Self-care", color: "bg-rose-400" },
  { id: "psychology", name: "Psychology", color: "bg-destructive" },
  { id: "fun", name: "Fun", color: "bg-orange-500" },
  { id: "family", name: "Family", color: "bg-green-500" },
  { id: "chores", name: "Chores", color: "bg-yellow-500" },
  { id: "order", name: "Order", color: "bg-purple-500" }
];

// Mock projects data (simplified version)
const availableProjects: Project[] = [
  {
    id: "1",
    title: "Website Redesign",
    area: "work",
    status: "active",
    steps: [
      { completed: true },
      { completed: false },
      { completed: false },
      { completed: false }
    ]
  },
  {
    id: "2", 
    title: "Mobile App Development",
    area: "work",
    status: "lead",
    steps: [
      { completed: false },
      { completed: false },
      { completed: false }
    ]
  },
  {
    id: "3",
    title: "Morning Fitness Routine", 
    area: "health",
    status: "active",
    steps: [
      { completed: true },
      { completed: false }
    ]
  },
  {
    id: "4",
    title: "Home Organization",
    area: "order", 
    status: "finished",
    steps: [
      { completed: true },
      { completed: true }
    ]
  },
  {
    id: "5",
    title: "Family Vacation Planning",
    area: "family",
    status: "archive", 
    steps: [
      { completed: true },
      { completed: true },
      { completed: true }
    ]
  }
];

const formatSimpleDate = (date: Date) => {
  return format(date, "dd.MM.yyyy");
};

const formatDateRange = (startDate?: Date, endDate?: Date) => {
  if (!startDate && !endDate) return null;
  if (startDate && endDate) {
    return `${formatSimpleDate(startDate)}–${formatSimpleDate(endDate)}`;
  }
  if (startDate) return formatSimpleDate(startDate);
  if (endDate) return formatSimpleDate(endDate);
  return null;
};

const getStatusColor = (status: Goal["status"]) => {
  switch (status) {
    case "new":
      return "bg-blue-500 text-white";
    case "active":
      return "bg-green-500 text-white";
    case "paused":
      return "bg-yellow-500 text-white";
    case "achieved":
      return "bg-purple-500 text-white";
    case "archive":
      return "bg-gray-500 text-white";
    default:
      return "bg-secondary text-secondary-foreground";
  }
};

const getStatusCircleColor = (status: Goal["status"]) => {
  switch (status) {
    case "new":
      return "bg-blue-500";
    case "active":
      return "bg-green-500";
    case "paused":
      return "bg-yellow-500";
    case "achieved":
      return "bg-purple-500";
    case "archive":
      return "bg-gray-500";
    default:
      return "bg-gray-400";
  }
};

const getStatusLabel = (status: Goal["status"]) => {
  switch (status) {
    case "new":
      return "New";
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "achieved":
      return "Achieved";
    case "archive":
      return "Archive";
    default:
      return status;
  }
};

interface GoalManagementProps {
  selectedAreas?: string[];
  selectedStatuses?: string[];
  isNewGoalDialogOpen?: boolean;
  onNewGoalDialogChange?: (open: boolean) => void;
}

export function GoalManagement({
  selectedAreas = [],
  selectedStatuses = [],
  isNewGoalDialogOpen: externalDialogOpen,
  onNewGoalDialogChange
}: GoalManagementProps) {
  const [goals, setGoals] = useState<Goal[]>([...mockGoals]);
  const [isNewGoalDialogOpen, setIsNewGoalDialogOpen] = useState(false);
  const [newGoalDialogKey, setNewGoalDialogKey] = useState(0);

  // Use external dialog state if provided
  const dialogOpen = externalDialogOpen !== undefined ? externalDialogOpen : isNewGoalDialogOpen;
  const setDialogOpen = (open: boolean) => {
    if (onNewGoalDialogChange) {
      onNewGoalDialogChange(open);
    } else {
      setIsNewGoalDialogOpen(open);
    }
  };

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<"status" | "date" | "area" | "none">("none");
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    area: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    status: "new" as Goal["status"],
    projectIds: [] as string[]
  });

  const handleGoalClick = (goal: Goal) => {
    if (selectedGoal?.id === goal.id) {
      setSelectedGoal(null);
      setEditingGoal(null);
      setIsEditing(false);
    } else {
      setSelectedGoal(goal);
      setEditingGoal({...goal});
      setIsEditing(true);
    }
  };

  const updateEditingGoal = (updates: Partial<Goal>) => {
    if (editingGoal) {
      setEditingGoal({...editingGoal, ...updates});
    }
  };

  const saveGoal = () => {
    if (editingGoal) {
      setGoals(prevGoals => prevGoals.map(goal =>
        goal.id === editingGoal.id ? editingGoal : goal
      ));
    }
  };

  const handleCreateGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal: Goal = {
      id: `goal-${Date.now()}`,
      title: newGoal.title.trim(),
      description: newGoal.description.trim() || undefined,
      area: newGoal.area,
      startDate: newGoal.startDate,
      endDate: newGoal.endDate,
      status: newGoal.status,
      projectIds: newGoal.projectIds
    };

    setGoals(prevGoals => [...prevGoals, goal]);
    setNewGoal({
      title: "",
      description: "",
      area: "",
      startDate: undefined,
      endDate: undefined,
      status: "new",
      projectIds: []
    });
    setDialogOpen(false);
  };

  const getGoalProgress = (goal: Goal) => {
    const attachedProjects = availableProjects.filter(p => goal.projectIds.includes(p.id));
    if (attachedProjects.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completedProjects = attachedProjects.filter(p => p.status === "finished").length;
    const totalProjects = attachedProjects.length;
    const percentage = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;
    
    return { completed: completedProjects, total: totalProjects, percentage };
  };

  const filteredGoals = goals.filter(goal => {
    if (selectedAreas.length > 0 && !selectedAreas.includes(goal.area)) return false;
    if (selectedStatuses.length > 0 && !selectedStatuses.includes(goal.status)) return false;
    return true;
  });

  const sortedGoals = [...filteredGoals].sort((a, b) => {
    if (sortBy === "status") {
      const statusOrder = { new: 0, active: 1, paused: 2, achieved: 3, archive: 4 };
      return statusOrder[a.status] - statusOrder[b.status];
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

  return (
    <div className="h-full p-6 bg-[#fafafa]">
      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedGoals.map(goal => {
          const progress = getGoalProgress(goal);
          const area = areas.find(a => a.id === goal.area);
          const attachedProjects = availableProjects.filter(p => goal.projectIds.includes(p.id));

          return (
            <div
              key={goal.id}
              className={cn(
                "bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer",
                selectedGoal?.id === goal.id && "ring-2 ring-primary"
              )}
              onClick={() => handleGoalClick(goal)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={cn("w-3 h-3 rounded-full", getStatusCircleColor(goal.status))} />
                    <h3 className="font-semibold text-base text-foreground">{goal.title}</h3>
                  </div>
                  {/* Dates */}
                  {(goal.startDate || goal.endDate) && (
                    <div className="text-xs text-muted-foreground">
                      {formatDateRange(goal.startDate, goal.endDate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium">{progress.completed} / {progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>

              {/* Area */}
              <div className="flex items-center gap-2">
                {area && (
                  <Badge className={cn("text-xs text-white px-2 py-1", area.color)}>
                    {area.name}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {sortedGoals.length === 0 && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No goals found</h3>
          <p className="text-muted-foreground mb-4">Create your first goal to get started</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </div>
      )}

      {/* Detailed Goal View */}
      {selectedGoal && editingGoal && (
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground">{editingGoal.title}</h2>
              <Badge className={cn("text-xs px-2 py-1", getStatusColor(editingGoal.status))}>
                {getStatusLabel(editingGoal.status)}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              {(() => {
                const area = areas.find(a => a.id === editingGoal.area);
                return area ? (
                  <Badge className={cn("text-xs text-white px-2 py-1", area.color)}>
                    {area.name}
                  </Badge>
                ) : null;
              })()}
              {formatDateRange(editingGoal.startDate, editingGoal.endDate) && (
                <span className="text-sm text-muted-foreground">
                  {formatDateRange(editingGoal.startDate, editingGoal.endDate)}
                </span>
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedGoal(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            {(() => {
              const progress = getGoalProgress(editingGoal);
              return (
                <>
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{
                        width: `${progress.percentage}%`,
                        transition: 'width 0.3s ease-out'
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {progress.completed} / {progress.total}
                  </span>
                </>
              );
            })()}
          </div>

          <div>
            <Textarea
              value={editingGoal.description || ""}
              onChange={(e) => updateEditingGoal({ description: e.target.value })}
              className="border-none bg-transparent p-0 resize-none focus-visible:ring-0"
              placeholder="Enter goal description..."
              rows={3}
            />
          </div>

          {/* Attached Projects */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Projects</h3>
            {(() => {
              const attachedProjects = availableProjects.filter(p => editingGoal.projectIds.includes(p.id));

              if (attachedProjects.length === 0) {
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No projects attached to this goal</p>
                  </div>
                );
              }

              // Group projects by status
              const statuses = ["lead", "active", "finished", "archive"] as const;
              const projectsByStatus = statuses.reduce((acc, status) => {
                acc[status] = attachedProjects.filter(p => p.status === status);
                return acc;
              }, {} as Record<string, typeof attachedProjects>);

              const getStatusLabel = (status: string) => {
                switch (status) {
                  case "lead": return "Lead";
                  case "active": return "Active";
                  case "finished": return "Finished";
                  case "archive": return "Archive";
                  default: return status;
                }
              };

              const getColumnColor = (status: string) => {
                switch (status) {
                  case "lead": return "border-t-red-500";
                  case "active": return "border-t-orange-500";
                  case "finished": return "border-t-green-500";
                  case "archive": return "border-t-gray-500";
                  default: return "border-t-border";
                }
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

              const updateProjectStatus = (projectId: string, newStatus: string) => {
                // Update the project in availableProjects (this would normally be through a proper state update)
                const projectIndex = availableProjects.findIndex(p => p.id === projectId);
                if (projectIndex !== -1) {
                  availableProjects[projectIndex].status = newStatus as any;
                  // Force re-render by updating editingGoal
                  setEditingGoal({...editingGoal});
                }
              };

              return (
                <div className="flex gap-4 overflow-x-auto">
                  {statuses.map(status => {
                    const handleDragOver = (e: React.DragEvent) => {
                      e.preventDefault();
                      setDragOverColumn(status);
                    };

                    const handleDragLeave = (e: React.DragEvent) => {
                      e.preventDefault();
                      setDragOverColumn(null);
                    };

                    const handleDrop = (e: React.DragEvent) => {
                      e.preventDefault();
                      setDragOverColumn(null);
                      const projectId = e.dataTransfer.getData("text/plain");
                      updateProjectStatus(projectId, status);
                    };

                    return (
                      <div
                        key={status}
                        className={cn(
                          "flex-1 min-w-64 bg-[#f3f3f3] rounded-lg transition-colors",
                          getColumnColor(status),
                          dragOverColumn === status && "bg-muted/50"
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-foreground">{getStatusLabel(status)}</h4>
                            <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded">
                              {projectsByStatus[status].length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {projectsByStatus[status].map(project => {
                              const area = areas.find(a => a.id === project.area);

                              const handleDragStart = (e: React.DragEvent) => {
                                e.dataTransfer.setData("text/plain", project.id);
                                e.currentTarget.style.opacity = '0.5';
                              };

                              const handleDragEnd = (e: React.DragEvent) => {
                                e.currentTarget.style.opacity = '1';
                              };

                              return (
                                <div
                                  key={project.id}
                                  className="bg-card border border-border rounded-lg p-4 shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer"
                                  draggable
                                  onDragStart={handleDragStart}
                                  onDragEnd={handleDragEnd}
                                >
                                  <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-center gap-2 flex-1">
                                        <div className={cn(
                                          "w-3 h-3 rounded-full shrink-0",
                                          project.status === "finished" ? "bg-green-500" :
                                          project.status === "active" ? "bg-orange-500" :
                                          project.status === "lead" ? "bg-red-500" : "bg-gray-600"
                                        )} />
                                        <h3 className="font-semibold text-card-foreground text-base line-clamp-2 flex-1">{project.title}</h3>
                                      </div>
                                    </div>

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
                                      {area && (
                                        <span className={cn("text-xs text-white px-2 py-1 rounded", area.color)}>
                                          {area.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
