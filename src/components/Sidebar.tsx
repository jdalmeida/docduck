import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { UserButton, useUser } from "@clerk/clerk-react";
import {
  ChevronRight,
  FileText,
  ListTodo,
  Newspaper,
  Plus,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils"; // Assuming you have a `cn` utility for classnames

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
  const children = useQuery(api.documents.getChildren, {
    parentDocument: document._id,
  });
  const createDocument = useMutation(api.documents.create);
  const archiveDocument = useMutation(api.documents.archive);

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleCreateChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document._id) return;
    createDocument({
      title: "Untitled",
      parentDocument: document._id,
    }).then((newDocId) => {
      onSelect(newDocId);
      if (!isExpanded) {
        setIsExpanded(true);
      }
    });
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!document._id) return;
    archiveDocument({ id: document._id });
    if (document._id === selectedDocumentId) {
      onSelect(null);
    }
  };

  const hasChildren = children !== undefined && children.length > 0;

  return (
    <>
      <div
        onClick={() => onSelect(document._id)}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        className={cn(
          "group flex items-center gap-x-2 py-1 pr-2 w-full hover:bg-neutral-700 rounded-md text-sm cursor-pointer text-neutral-400"
        )}
      >
        {hasChildren && (
          <button
            onClick={handleExpand}
            className="h-full rounded-sm hover:bg-neutral-600 p-0.5"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 shrink-0 text-neutral-500",
                isExpanded && "rotate-90"
              )}
            />
          </button>
        )}
        {document.icon ? (
          <span className="text-sm mr-2">{document.icon}</span>
        ) : (
          <FileText className="h-4 w-4" />
        )}
        <span className="truncate flex-1">{document.title}</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-x-1">
          <button
            onClick={handleArchive}
            title="Delete"
            className="p-0.5 rounded-sm hover:bg-neutral-600"
          >
            <Trash className="h-4 w-4" />
          </button>
          <button
            onClick={handleCreateChild}
            title="Add a page inside"
            className="p-0.5 rounded-sm hover:bg-neutral-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      {isExpanded &&
        children?.map((child) => (
          <DocumentItem
            key={child._id}
            document={child}
            onSelect={onSelect}
            selectedDocumentId={selectedDocumentId}
            level={level + 1}
          />
        ))}
    </>
  );
};

const Sidebar = ({
  onSelectDocument,
  selectedDocumentId,
  onOpenTaskManager,
  onOpenKnowledgeRepository,
}: {
  onSelectDocument: (id: Id<"documents"> | null) => void;
  selectedDocumentId: Id<"documents"> | null;
  onOpenTaskManager: () => void;
  onOpenKnowledgeRepository: () => void;
}) => {
  const documents = useQuery(api.documents.getSidebar, {});
  const createDocument = useMutation(api.documents.create);
  const user  = useUser();

  const handleCreateDocument = () => {
    createDocument({ title: "Untitled" }).then((newDocumentId) => {
      onSelectDocument(newDocumentId);
    });
  };

  return (
    <aside className="w-72 h-full bg-neutral-800 text-neutral-300 flex flex-col p-2">
      <div className="p-2 flex items-center gap-2">
        <img src="/duck.png" alt="DocDuck Logo" className="size-8" />
        <h1 className="text-2xl font-bold">DocDuck</h1>
      </div>

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
          <h2 className="text-sm font-semibold text-neutral-500">KNOWLEDGE</h2>
          <button
            onClick={onOpenKnowledgeRepository}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded"
            title="Open Knowledge Repository"
          >
            <Newspaper className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between px-2 py-1 mt-2">
          <h2 className="text-sm font-semibold text-neutral-500">DOCUMENTS</h2>
          <button
            onClick={handleCreateDocument}
            className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded"
            title="New Document"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <nav className="mt-2">
          {documents?.map((doc) => (
            <DocumentItem
              key={doc._id}
              document={doc}
              onSelect={onSelectDocument}
              selectedDocumentId={selectedDocumentId}
            />
          ))}
        </nav>
      </div>
      
      <div className="p-2">
        <div className="flex items-center gap-2">
          <UserButton />
          <div className="flex flex-col">
            <p className="text-sm font-medium">{user?.user?.username}</p>
            <p className="text-xs text-neutral-500">{user?.user?.emailAddresses[0].emailAddress}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 