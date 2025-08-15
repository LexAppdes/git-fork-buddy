import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { TaskManagement } from "@/components/TaskManagement";

const Index = () => {
  const [activeSection, setActiveSection] = useState("tasks");
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeSection) {
      case "journal":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Journal</h2>
              <p className="text-muted-foreground">Journal section coming soon...</p>
            </div>
          </div>
        );
      case "home":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Home</h2>
              <p className="text-muted-foreground">Home dashboard coming soon...</p>
            </div>
          </div>
        );
      case "notes":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Notes</h2>
              <p className="text-muted-foreground">Notes section coming soon...</p>
            </div>
          </div>
        );
      case "tags":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Tags</h2>
              <p className="text-muted-foreground">Tags management coming soon...</p>
            </div>
          </div>
        );
      case "tasks":
        return <TaskManagement onTaskSidebarChange={setIsTaskSidebarOpen} />;
      case "highlights":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Highlights</h2>
              <p className="text-muted-foreground">Highlights section coming soon...</p>
            </div>
          </div>
        );
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
      <div className={`flex-1 bg-[#fafafa] transition-all duration-300 ${isTaskSidebarOpen ? 'mr-96' : ''}`}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
