import { X, Plus, Trash, Play, Square, Check } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { FormEvent, useEffect, useState } from "react";
import { cn } from "../lib/utils";
import { Spinner } from "./Spinner";

const TaskItem = ({ task }: { task: Doc<"tasks"> }) => {
  const updateStatus = useMutation(api.tasks.updateTaskStatus);
  const updateTitle = useMutation(api.tasks.updateTaskTitle);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (task.status === "in_progress" && task.startTime) {
      const updateElapsedTime = () => {
        const now = Date.now();
        const start = task.startTime;
        if (start) {
            setElapsedTime(Math.floor((now - start) / 1000));
        }
      };
      updateElapsedTime();
      interval = setInterval(updateElapsedTime, 1000);
    } else {
      if (task.startTime && task.endTime) {
        setElapsedTime(Math.floor((task.endTime - task.startTime) / 1000));
      } else {
        setElapsedTime(0);
      }
    }
    return () => clearInterval(interval);
  }, [task.status, task.startTime, task.endTime]);

  const handleStatusChange = (status: "pending" | "in_progress" | "completed") => {
    updateStatus({ taskId: task._id, status });
  };
  
  const handleTitleBlur = () => {
    if (title !== task.title) {
        updateTitle({ taskId: task._id, title });
    }
    setIsEditing(false);
  }

  return (
    <div className="text-white flex items-center gap-4 p-2 rounded-md hover:bg-neutral-700/50">
      <div className="flex-grow flex items-center gap-2">
        {isEditing ? (
            <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
                className="bg-transparent border-b border-neutral-500 focus:outline-none focus:border-blue-500 text-white w-full"
                autoFocus
            />
        ) : (
            <span onDoubleClick={() => setIsEditing(true)} className={cn("cursor-pointer", task.status === 'completed' && 'line-through text-neutral-500')}>{task.title}</span>
        )}
      </div>
      <div className="text-sm text-neutral-400 w-24 text-center">
        {String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:
        {String(elapsedTime % 60).padStart(2, '0')}
      </div>
      <div className="flex items-center gap-1">
        {task.status === "pending" && (
          <button onClick={() => handleStatusChange("in_progress")} className="p-1 hover:bg-neutral-600 rounded-full" title="Start">
            <Play className="w-4 h-4 text-green-500" />
          </button>
        )}
        {task.status === "in_progress" && (
          <button onClick={() => handleStatusChange("completed")} className="p-1 hover:bg-neutral-600 rounded-full" title="Complete">
            <Check className="w-4 h-4 text-green-500" />
          </button>
        )}
        {task.status === "completed" && (
          <button onClick={() => handleStatusChange("pending")} className="p-1 hover:bg-neutral-600 rounded-full" title="Mark as Pending">
            <Square className="w-4 h-4 text-yellow-500" />
          </button>
        )}
        <button onClick={() => deleteTask({ taskId: task._id })} className="p-1 hover:bg-neutral-600 rounded-full" title="Delete">
          <Trash className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
};

const TaskManager = ({ onClose }: { onClose: () => void }) => {
  const tasks = useQuery(api.tasks.getTasks, {});
  const createTask = useMutation(api.tasks.createTask);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleCreateTask = (e: FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      createTask({ title: newTaskTitle.trim() });
      setNewTaskTitle("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-neutral-800 rounded-lg shadow-xl w-11/12 max-w-md md:max-w-4xl h-[80vh] md:h-[70vh] flex flex-col p-4">
        <div className="flex items-center justify-between mb-4 border-b border-neutral-700 pb-2">
          <h2 className="text-2xl font-bold text-white">Task Manager</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-neutral-700 text-neutral-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
            {tasks === undefined && (
                <div className="flex items-center justify-center h-full">
                    <Spinner size="lg" />
                </div>
            )}
            {tasks?.map((task) => (
                <TaskItem key={task._id} task={task} />
            ))}
            {tasks?.length === 0 && (
                <div className="text-center text-neutral-500 mt-8">
                    <p>No tasks yet. Add one below!</p>
                </div>
            )}
        </div>
        <form onSubmit={handleCreateTask} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-grow bg-neutral-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 flex items-center gap-2">
            <Plus className="w-5 h-5"/> Add Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskManager; 