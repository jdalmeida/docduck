import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import {
  ChevronRight,
  FileText,
  ListTodo,
  LogOut,
  Menu,
  Newspaper,
  Plus,
  Trash,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { useWindowSize } from "usehooks-ts";
import { useAuth } from "../context/AuthContext";

const DocumentItem = ({
  document,
  onSelect,
  selectedDocumentId,
  level = 0,
}: {
  document: Doc<"documents">;
  onSelect: (id: Id<"documents"> | null) => void;
  selectedDocumentId?: Id<"documents"> | null;
  level?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const children = useQuery(api.documents.getChildren, 
    user?._id ? {
      parentDocument: document._id,
      userId: user._id,
    } : "skip"
  );
  const createDocument = useMutation(api.documents.create);
  const archiveDocument = useMutation(api.documents.archive);

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleCreateChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document._id || !user) return;
    createDocument({
      title: "Untitled",
      parentDocument: document._id,
      userId: user._id,
    }).then((newDocId) => {
      onSelect(newDocId);
      if (!isExpanded) {
        setIsExpanded(true);
      }
    });
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document._id || !user) return;
    archiveDocument({ id: document._id, userId: user._id });
    if (document._id === selectedDocumentId) {
      onSelect(null);
    }
  };

  const hasChildren = children !== undefined && children.length > 0;

  return (
    <div
      style={{ paddingLeft: `${level * 12 + 12}px` }}
      className={cn(
        "group flex items-center w-full max-w-full hover:bg-neutral-700 rounded-md text-sm font-medium transition-colors",
        selectedDocumentId === document._id && "bg-neutral-700 text-white"
      )}
    >
      {hasChildren && (
        <button
          onClick={handleExpand}
          className="p-1 text-neutral-400 hover:text-white"
        >
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-90"
            )}
          />
        </button>
      )}
      <div
        onClick={() => onSelect(document._id)}
        className="flex items-center gap-x-2 py-2 px-3 cursor-pointer w-full max-w-48"
      >
        {document.icon ? (
          <div className="flex items-center gap-x-2">
            {document.icon}
          </div>
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span className="truncate">{document.title}</span>
      </div>
      <div className="flex items-center gap-x-1 pr-2">
        <button
          onClick={handleCreateChild}
          className="p-1 text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100"
          title="New child document"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleArchive}
          className="p-1 text-neutral-400 hover:text-white opacity-0 group-hover:opacity-100"
          title="Archive document"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Sidebar = ({
  onSelectDocument,
  selectedDocumentId,
  onOpenTaskManager,
  onOpenKnowledgeRepository,
  isSidebarOpen,
  onToggleSidebar,
  setIsSidebarOpen,
  documents,
  handleCreateDocument,
  handleSignOut,
}: {
  onSelectDocument: (id: Id<"documents"> | null) => void;
  selectedDocumentId: Id<"documents"> | null;
  onOpenTaskManager: () => void;
  onOpenKnowledgeRepository: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  documents: Doc<"documents">[] | undefined;
  handleCreateDocument: () => void;
  handleSignOut: () => void;
}) => {
  const { width } = useWindowSize();

  useEffect(() => {
    if (width && width < 768) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [width, setIsSidebarOpen]);

  return (
    <>
      <aside
        className={cn(
          "h-full bg-neutral-800 transition-all duration-300 ease-in-out text-neutral-300 flex flex-col p-2",
          "fixed md:relative z-50",
          isSidebarOpen ? "w-72" : "w-0 p-0"
        )}
      >
        <div className={cn("p-2 flex items-center justify-between", isSidebarOpen ? "flex-row" : "flex-row-reverse left-36 relative")}>
          <div className="flex items-center gap-2">
            <img src="/duck.png" alt="DocDuck Logo" className="size-8" />
            <h1 className="text-2xl font-bold">DocDuck</h1>
          </div>
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded"
            title="Close sidebar"
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        <div className={cn("flex flex-col h-full", !isSidebarOpen && "hidden")}>
          <div className="flex-grow mt-4">
            <div className="flex items-center justify-between px-2 py-1">
              <h2 className="text-sm font-semibold text-neutral-500">TASKS</h2>
              <button
                onClick={onOpenTaskManager}
                className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded"
                title="Open Task Manager"
              >
                <ListTodo className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between px-2 py-1 mt-2">
              <h2 className="text-sm font-semibold text-neutral-500">
                KNOWLEDGE
              </h2>
              <button
                onClick={onOpenKnowledgeRepository}
                className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded"
                title="Open Knowledge Repository"
              >
                <Newspaper className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between px-2 py-1 mt-2">
              <h2 className="text-sm font-semibold text-neutral-500">
                DOCUMENTS
              </h2>
              <button
                onClick={handleCreateDocument}
                className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded"
                title="New Document"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto max-w-full">
              {documents?.map((doc) => (
                <DocumentItem
                  key={doc._id}
                  document={doc}
                  onSelect={onSelectDocument}
                  selectedDocumentId={selectedDocumentId}
                />
              ))}
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-2 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-700 rounded"
              title="Sign Out"
            >
              <div className="flex items-center">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </div>
            </button>
          </div>
        </div>
      </aside>
      <button
        onClick={onToggleSidebar}
        className={cn(
          "absolute top-2 left-2 md:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-full transition-opacity",
          isSidebarOpen && "opacity-0"
        )}
        title="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
};

export default function SidebarWrapper({
  selectedDocumentId,
  onSelectDocument,
  onOpenTaskManager,
  onOpenKnowledgeRepository,
  isSidebarOpen,
  onToggleSidebar,
  setIsSidebarOpen,
}: {
  selectedDocumentId: Id<"documents"> | null;
  onSelectDocument: (id: Id<"documents"> | null) => void;
  onOpenTaskManager: () => void;
  onOpenKnowledgeRepository: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
}) {
  const { user } = useAuth();
  const documents = useQuery(api.documents.getSidebar, user?._id ? { userId: user._id } : "skip");
  const createDocument = useMutation(api.documents.create);
  const { logout } = useAuth();

  const handleCreateDocument = () => {
    if (!user) return;
    createDocument({ title: "Untitled", userId: user._id }).then((newDocId) => {
      onSelectDocument(newDocId);
    });
  };

  const handleSignOut = () => {
    logout();
  };

  return (
    <Sidebar
      documents={documents}
      handleCreateDocument={handleCreateDocument}
      handleSignOut={handleSignOut}
      onSelectDocument={onSelectDocument}
      selectedDocumentId={selectedDocumentId}
      onOpenTaskManager={onOpenTaskManager}
      onOpenKnowledgeRepository={onOpenKnowledgeRepository}
      isSidebarOpen={isSidebarOpen}
      onToggleSidebar={onToggleSidebar}
      setIsSidebarOpen={setIsSidebarOpen}
    />
  );
}