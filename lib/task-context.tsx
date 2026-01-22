import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/hooks/use-auth";

export interface Task {
  id: string;
  userId: number;
  title: string;
  description?: string;
  scheduledAt: Date | null;
  dueDate?: Date;
  hasTime: boolean;
  priority?: "low" | "medium" | "high";
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TasksContextType {
  tasks: Task[];
  addTask: (title: string, scheduledAt?: Date, hasTime?: boolean) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string) => Promise<void>;
  getTasksForDate: (date: Date) => Task[];
  getTodaysTasks: () => Task[];
  getCompletionRate: () => number;
  isLoading: boolean;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "app_tasks";

// Generate a unique ID for tasks
function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Provider for task management
 * Handles task CRUD operations and persistence
 */
export function TasksProvider({ children }: TasksProviderProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from storage on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Convert date strings back to Date objects
          const tasksWithDates = parsed.map((task: any) => ({
            ...task,
            scheduledAt: task.scheduledAt ? new Date(task.scheduledAt) : null,
            createdAt: new Date(task.createdAt),
            updatedAt: new Date(task.updatedAt),
          }));
          setTasks(tasksWithDates);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error("Error saving tasks:", error);
      throw error;
    }
  };

  const addTask = useCallback(
    async (title: string, scheduledAt?: Date, hasTime: boolean = false) => {
      if (!user?.id) throw new Error("User not authenticated");

      const newTask: Task = {
        id: generateTaskId(),
        userId: user.id,
        title,
        scheduledAt: scheduledAt || null,
        hasTime,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = [...tasks, newTask];
      await saveTasks(updated);
    },
    [tasks, user],
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      const updated = tasks.map((task) =>
        task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task,
      );
      await saveTasks(updated);
    },
    [tasks],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const updated = tasks.filter((task) => task.id !== id);
      await saveTasks(updated);
    },
    [tasks],
  );

  const toggleTaskCompletion = useCallback(
    async (id: string) => {
      const updated = tasks.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted, updatedAt: new Date() } : task,
      );
      await saveTasks(updated);
    },
    [tasks],
  );

  const getTasksForDate = useCallback(
    (date: Date) => {
      const dateStr = date.toISOString().split("T")[0];
      return tasks.filter((task) => {
        if (!task.scheduledAt) return false;
        const taskDateStr = task.scheduledAt.toISOString().split("T")[0];
        return taskDateStr === dateStr;
      });
    },
    [tasks],
  );

  const getTodaysTasks = useCallback(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    return tasks.filter((task) => {
      if (!task.scheduledAt) return false;
      const taskDateStr = task.scheduledAt.toISOString().split("T")[0];

      if (taskDateStr !== todayStr) return false;

      // If has_time is true, check if the time has arrived
      if (task.hasTime) {
        return task.scheduledAt <= new Date();
      }

      // If has_time is false, it's available all day
      return true;
    });
  }, [tasks]);

  const getCompletionRate = useCallback(() => {
    const todaysTasks = getTodaysTasks();
    if (todaysTasks.length === 0) return 0;

    const completed = todaysTasks.filter((task) => task.isCompleted).length;
    return Math.round((completed / todaysTasks.length) * 100);
  }, [getTodaysTasks]);

  const value: TasksContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksForDate,
    getTodaysTasks,
    getCompletionRate,
    isLoading,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

/**
 * Hook to access task management
 */
export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within TasksProvider");
  }
  return context;
}
