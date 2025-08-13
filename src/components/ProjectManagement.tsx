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
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Website Redesign",
    description: "Complete overhaul of company website with modern design",
    area: "work",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-03-15"),
    status: "active"
  },
  {
    id: "2",
    title: "Mobile App Development",
    description: "Native iOS and Android app for customer portal",
    area: "work",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-06-30"),
    status: "lead"
  },
  {
    id: "3",
    title: "Morning Fitness Routine",
    description: "Establish a consistent morning exercise routine",
    area: "health",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-03-31"),
    status: "active"
  },
  {
    id: "4",
    title: "Home Organization",
    description: "Declutter and organize living spaces",
    area: "order",
    startDate: new Date("2023-12-01"),
    endDate: new Date("2024-01-31"),
    status: "finished"
  },
  {
    id: "5",
    title: "Family Vacation Planning",
    description: "Plan summer vacation with extended family",
    area: "family",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-05-15"),
    status: "archive"
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

interface ProjectManagementProps {
  selectedAreas?: string[];
  selectedStatuses?: string[];
  isNewProjectDialogOpen?: boolean;
  onNewProjectDialogChange?: (open: boolean) => void;
}

export function ProjectManagement({
  selectedAreas = [],
  selectedStatuses = [],
  isNewProjectDialogOpen: externalDialogOpen,
  onNewProjectDialogChange
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

  const addProject = () => {
    if (!newProject.title.trim()) return;

    const project: Project = {
      id: Date.now().toString(),
      title: newProject.title,
      description: newProject.description,
      area: newProject.area,
      startDate: newProject.startDate,
      endDate: newProject.endDate,
      status: newProject.status
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
                </div>
                <span className={cn("text-xs text-white px-2 py-1 rounded", projectAreas.find(a => a.id === project.area)?.color || "bg-muted")}>
                  {projectAreas.find(a => a.id === project.area)?.name || project.area}
                </span>
              </div>
            ))}
          </div>

          {/* Project Details Section */}
          {selectedProject && editingProject && (
            <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-soft">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Input
                      value={editingProject.title}
                      onChange={(e) => updateEditingProject({ title: e.target.value })}
                      className="font-bold bg-transparent border-none p-0 h-auto focus-visible:ring-0 flex-shrink-0"
                      style={{ fontSize: '24px', minWidth: '200px' }}
                      placeholder="Project title"
                    />
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-auto px-2 py-1 text-xs cursor-pointer hover:bg-muted/50">
                            <Calendar className="mr-1 h-3 w-3" />
                            {editingProject.startDate ? format(editingProject.startDate, "MMM d") : "Start"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={editingProject.startDate}
                            onSelect={(date) => updateEditingProject({ startDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <span className="text-muted-foreground">→</span>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-auto px-2 py-1 text-xs cursor-pointer hover:bg-muted/50">
                            <Calendar className="mr-1 h-3 w-3" />
                            {editingProject.endDate ? format(editingProject.endDate, "MMM d") : "End"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={editingProject.endDate}
                            onSelect={(date) => updateEditingProject({ endDate: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {newProject.startDate ? format(newProject.startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={newProject.startDate}
                      onSelect={(date) => setNewProject(prev => ({ ...prev, startDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {newProject.endDate ? format(newProject.endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={newProject.endDate}
                      onSelect={(date) => setNewProject(prev => ({ ...prev, endDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
