import { useState } from "react";
import { Calendar, Plus, MoreHorizontal, Filter, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  status: "planning" | "in-progress" | "on-hold" | "completed";
}

const mockProjects: Project[] = [
  {
    id: "1",
    title: "Website Redesign",
    description: "Complete overhaul of company website with modern design",
    area: "design",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-03-15"),
    status: "in-progress"
  },
  {
    id: "2",
    title: "Mobile App Development",
    description: "Native iOS and Android app for customer portal",
    area: "development",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-06-30"),
    status: "planning"
  },
  {
    id: "3",
    title: "Marketing Campaign Q1",
    description: "Launch new product marketing campaign",
    area: "marketing",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-03-31"),
    status: "in-progress"
  },
  {
    id: "4",
    title: "Office Renovation",
    description: "Renovate office space for better collaboration",
    area: "facilities",
    startDate: new Date("2023-12-01"),
    endDate: new Date("2024-01-31"),
    status: "completed"
  },
  {
    id: "5",
    title: "Team Training Program",
    description: "Implement comprehensive training for new technologies",
    area: "hr",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-05-15"),
    status: "on-hold"
  }
];

const projectAreas = [
  { id: "design", name: "Design", color: "bg-primary" },
  { id: "development", name: "Development", color: "bg-task-medium" },
  { id: "marketing", name: "Marketing", color: "bg-task-urgent" },
  { id: "facilities", name: "Facilities", color: "bg-task-low" },
  { id: "hr", name: "Human Resources", color: "bg-destructive" }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "planning":
      return "bg-muted text-muted-foreground";
    case "in-progress":
      return "bg-primary text-primary-foreground";
    case "on-hold":
      return "bg-amber-500 text-white";
    case "completed":
      return "bg-task-low text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "planning":
      return "Planning";
    case "in-progress":
      return "In Progress";
    case "on-hold":
      return "On Hold";
    case "completed":
      return "Completed";
    default:
      return "Unknown";
  }
};

interface ProjectManagementProps {
  selectedAreas?: string[];
}

export function ProjectManagement({ selectedAreas = [] }: ProjectManagementProps) {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sortBy, setSortBy] = useState<"status" | "date" | "area" | "none">("none");
  const [filterByStatus, setFilterByStatus] = useState<string>("all");
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    area: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    status: "planning" as Project["status"]
  });

  const handleProjectClick = (project: Project) => {
    setSelectedProject(selectedProject?.id === project.id ? null : project);
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
      status: "planning"
    });
    setIsNewProjectDialogOpen(false);
  };

  const filterAndSortProjects = (projects: Project[]) => {
    let filteredProjects = projects;

    if (filterByStatus !== "all") {
      filteredProjects = filteredProjects.filter(project => project.status === filterByStatus);
    }

    // Filter by selected areas if any are selected
    if (selectedAreas.length > 0) {
      filteredProjects = filteredProjects.filter(project => selectedAreas.includes(project.area));
    }

    return [...filteredProjects].sort((a, b) => {
      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
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
                    <h3 className="font-semibold text-card-foreground text-base line-clamp-2 flex-1">{project.title}</h3>
                    <Badge className={cn("text-xs shrink-0", getStatusColor(project.status))}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded">
                        {projectAreas.find(a => a.id === project.area)?.name || project.area}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground truncate">
                        {formatDateRange(project.startDate, project.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Project Details Section */}
          {selectedProject && (
            <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-card-foreground">{selectedProject.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProject(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                {selectedProject.description && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="mt-1 text-foreground">{selectedProject.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Area</Label>
                    <p className="mt-1 text-foreground">
                      {projectAreas.find(a => a.id === selectedProject.area)?.name || selectedProject.area}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="mt-1">
                      <Badge className={cn(getStatusColor(selectedProject.status))}>
                        {getStatusLabel(selectedProject.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Timeline</Label>
                  <p className="mt-1 text-foreground">
                    {formatDateRange(selectedProject.startDate, selectedProject.endDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
