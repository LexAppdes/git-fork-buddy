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

export function ProjectManagement() {
  const [projects] = useState<Project[]>(mockProjects);

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
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Projects</h2>
        <p className="text-muted-foreground mt-1">
          Manage and track your project portfolio
        </p>
      </div>
      
      <div className="grid gap-4">
        {projects.map(project => (
          <div
            key={project.id}
            className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-medium transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground text-lg">{project.title}</h3>
                    {project.description && (
                      <p className="text-muted-foreground mt-1">{project.description}</p>
                    )}
                  </div>
                  <Badge className={cn("text-xs", getStatusColor(project.status))}>
                    {getStatusLabel(project.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Area:</span>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}