import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskManagement } from "@/components/TaskManagement";
import { ProjectManagement } from "@/components/ProjectManagement";

const Index = () => {
  const [activeSection, setActiveSection] = useState("tasks");

  const renderContent = () => {
    switch (activeSection) {
      case "notes":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Notes</h2>
              <p className="text-muted-foreground">Notes section coming soon...</p>
            </div>
          </div>
        );
      case "whiteboards":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Whiteboards</h2>
              <p className="text-muted-foreground">Whiteboards section coming soon...</p>
            </div>
          </div>
        );
      case "tasks":
        return <TaskManagement />;
      case "projects":
        return <ProjectManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <AppSidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;