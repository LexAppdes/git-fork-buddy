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
  status: "planning" | "in-progress" | "on-hold" | "completed";
}
const mockProjects: Project[] = [{
  id: "1",
  title: "Website Redesign",
  description: "Complete overhaul of company website with modern design",
  area: "design",
  startDate: new Date("2024-01-15"),
  endDate: new Date("2024-03-15"),
  status: "in-progress"
}, {
  id: "2",
  title: "Mobile App Development",
  description: "Native iOS and Android app for customer portal",
  area: "development",
  startDate: new Date("2024-02-01"),
  endDate: new Date("2024-06-30"),
  status: "planning"
}, {
  id: "3",
  title: "Marketing Campaign Q1",
  description: "Launch new product marketing campaign",
  area: "marketing",
  startDate: new Date("2024-01-01"),
  endDate: new Date("2024-03-31"),
  status: "in-progress"
}, {
  id: "4",
  title: "Office Renovation",
  description: "Renovate office space for better collaboration",
  area: "facilities",
  startDate: new Date("2023-12-01"),
  endDate: new Date("2024-01-31"),
  status: "completed"
}, {
  id: "5",
  title: "Team Training Program",
  description: "Implement comprehensive training for new technologies",
  area: "hr",
  startDate: new Date("2024-04-01"),
  endDate: new Date("2024-05-15"),
  status: "on-hold"
}];
const projectAreas = [{
  id: "design",
  name: "Design",
  color: "bg-primary"
}, {
  id: "development",
  name: "Development",
  color: "bg-task-medium"
}, {
  id: "marketing",
  name: "Marketing",
  color: "bg-task-urgent"
}, {
  id: "facilities",
  name: "Facilities",
  color: "bg-task-low"
}, {
  id: "hr",
  name: "Human Resources",
  color: "bg-destructive"
}];
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
export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectViewOpen, setIsProjectViewOpen] = useState(false);
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
    setSelectedProject(project);
    setIsProjectViewOpen(true);
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
      filteredProjects = projects.filter(project => project.status === filterByStatus);
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
  return <div className="flex h-full bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track your project portfolio
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Select value={filterByStatus} onValueChange={setFilterByStatus}>
                  <SelectTrigger className="w-32">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={value => setSortBy(value as typeof sortBy)}>
                  <SelectTrigger className="w-32">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Default</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" value={newProject.title} onChange={e => setNewProject(prev => ({
                      ...prev,
                      title: e.target.value
                    }))} placeholder="Enter project title" />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" value={newProject.description} onChange={e => setNewProject(prev => ({
                      ...prev,
                      description: e.target.value
                    }))} placeholder="Project description" rows={3} />
                    </div>

                    <div>
                      <Label htmlFor="area">Area</Label>
                      <Select value={newProject.area} onValueChange={value => setNewProject(prev => ({
                      ...prev,
                      area: value
                    }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectAreas.map(area => <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <Calendar className="w-4 h-4 mr-2" />
                              {newProject.startDate ? format(newProject.startDate, "MMM d, yyyy") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent mode="single" selected={newProject.startDate} onSelect={date => setNewProject(prev => ({
                            ...prev,
                            startDate: date
                          }))} className="p-3 pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label>End Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                              <Calendar className="w-4 h-4 mr-2" />
                              {newProject.endDate ? format(newProject.endDate, "MMM d, yyyy") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent mode="single" selected={newProject.endDate} onSelect={date => setNewProject(prev => ({
                            ...prev,
                            endDate: date
                          }))} className="p-3 pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={newProject.status} onValueChange={value => setNewProject(prev => ({
                      ...prev,
                      status: value as Project["status"]
                    }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={addProject} className="flex-1">
                        Create Project
                      </Button>
                      <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 p-6">
          <div className="grid gap-4">
            {filterAndSortProjects(projects).map(project => <div key={project.id} className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-medium transition-all duration-200 cursor-pointer" onClick={() => handleProjectClick(project)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-card-foreground text-lg">{project.title}</h3>
                        {project.description && <p className="text-muted-foreground mt-1">{project.description}</p>}
                      </div>
                      <Badge className={cn("text-xs", getStatusColor(project.status))}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                          {projectAreas.find(a => a.id === project.area)?.name || project.area}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {formatDateRange(project.startDate, project.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={e => e.stopPropagation()}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>)}
          </div>
        </div>
      </div>

      {/* Project Details Dialog */}
      {selectedProject && <Dialog open={isProjectViewOpen} onOpenChange={setIsProjectViewOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedProject.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedProject.description && <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="mt-1 text-foreground">{selectedProject.description}</p>
                </div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Area</Label>
                  <p className="mt-1 text-foreground">
                    {projectAreas.find(a => a.id === selectedProject.area)?.name || selectedProject.area}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={cn("mt-1", getStatusColor(selectedProject.status))}>
                    {getStatusLabel(selectedProject.status)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Timeline</Label>
                <p className="mt-1 text-foreground">
                  {formatDateRange(selectedProject.startDate, selectedProject.endDate)}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>}
    </div>;
}