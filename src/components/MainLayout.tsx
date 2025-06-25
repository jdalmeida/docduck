import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import Editor from "./Editor";
import { KnowledgeRepository } from "./KnowledgeRepository";
import Sidebar from "./Sidebar";
import TaskManager from "./TaskManager";

const MainLayout = () => {
  const [selectedDocumentId, setSelectedDocumentId] =
    useState<Id<"documents"> | null>(null);
  const [isTaskManagerOpen, setIsTaskManagerOpen] = useState(false);
  const [activeView, setActiveView] = useState<"editor" | "knowledge">(
    "editor"
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSelectDocument = (id: Id<"documents"> | null) => {
    setSelectedDocumentId(id);
    setActiveView("editor");
    if (window.innerWidth < 768) { // md breakpoint
      setIsSidebarOpen(false);
    }
  };

  const handleOpenTaskManager = () => {
    setIsTaskManagerOpen(true);
  }

  const handleOpenKnowledge = () => {
    setActiveView("knowledge");
    setSelectedDocumentId(null);
    if (window.innerWidth < 768) { // md breakpoint
      setIsSidebarOpen(false);
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen relative">
      <Sidebar
        selectedDocumentId={selectedDocumentId}
        onSelectDocument={handleSelectDocument}
        onOpenTaskManager={handleOpenTaskManager}
        onOpenKnowledgeRepository={handleOpenKnowledge}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main className="flex-1 bg-[#1f1f1f]">
        {activeView === "editor" && <Editor documentId={selectedDocumentId} />}
        {activeView === "knowledge" && (
          <KnowledgeRepository onSelectDocument={handleSelectDocument} />
        )}
      </main>
      {isTaskManagerOpen && <TaskManager onClose={() => setIsTaskManagerOpen(false)} />}
    </div>
  );
};

export default MainLayout; 