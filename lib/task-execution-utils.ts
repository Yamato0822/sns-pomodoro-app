import { Task } from "@/lib/task-context";

export interface TaskExecutionStatus {
  isExecutable: boolean;
  reason: string;
  icon: string;
}

/**
 * Determine if a task can be executed based on its schedule
 */
export function getTaskExecutionStatus(task: Task): TaskExecutionStatus {
  const now = new Date();

  // If task is already completed, it cannot be executed again
  if (task.isCompleted) {
    return {
      isExecutable: false,
      reason: "既に完了済み",
      icon: "checkmark.circle.fill",
    };
  }

  // If no scheduled_at, task is always executable
  if (!task.scheduledAt) {
    return {
      isExecutable: true,
      reason: "すぐに実行可能",
      icon: "play.fill",
    };
  }

  const scheduledDate = new Date(task.scheduledAt);

  // If has_time is false (only scheduled by date, not time)
  if (!task.hasTime) {
    // Check if the scheduled date is today or in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduledDateOnly = new Date(scheduledDate);
    scheduledDateOnly.setHours(0, 0, 0, 0);

    if (scheduledDateOnly <= today) {
      return {
        isExecutable: true,
        reason: "実行可能",
        icon: "play.fill",
      };
    } else {
      return {
        isExecutable: false,
        reason: `${scheduledDate.toLocaleDateString("ja-JP")}に実行可能`,
        icon: "lock.fill",
      };
    }
  }

  // If has_time is true (scheduled with specific time)
  if (scheduledDate > now) {
    // Scheduled time is in the future
    const timeStr = scheduledDate.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return {
      isExecutable: false,
      reason: `${timeStr}に実行可能`,
      icon: "lock.fill",
    };
  } else {
    // Scheduled time is in the past or now
    return {
      isExecutable: true,
      reason: "実行可能",
      icon: "play.fill",
    };
  }
}

/**
 * Check if a task should be enabled based on current time
 */
export function isTaskEnabled(task: Task): boolean {
  return getTaskExecutionStatus(task).isExecutable;
}

/**
 * Get the time until a task becomes executable (in milliseconds)
 * Returns 0 if already executable, or null if no scheduled time
 */
export function getTimeUntilExecutable(task: Task): number | null {
  if (!task.scheduledAt || !task.hasTime) {
    return null;
  }

  const now = new Date();
  const scheduledDate = new Date(task.scheduledAt);

  if (scheduledDate <= now) {
    return 0;
  }

  return scheduledDate.getTime() - now.getTime();
}

/**
 * Format the time remaining until a task becomes executable
 */
export function formatTimeUntilExecutable(task: Task): string | null {
  const timeMs = getTimeUntilExecutable(task);

  if (timeMs === null) {
    return null;
  }

  if (timeMs === 0) {
    return "すぐに実行可能";
  }

  const totalSeconds = Math.floor(timeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}時間${minutes}分後に実行可能`;
  } else if (minutes > 0) {
    return `${minutes}分後に実行可能`;
  } else {
    return "もうすぐ実行可能";
  }
}

/**
 * Get all tasks grouped by execution status
 */
export function groupTasksByExecutionStatus(tasks: Task[]) {
  const executable: Task[] = [];
  const locked: Task[] = [];
  const completed: Task[] = [];

  tasks.forEach((task) => {
    if (task.isCompleted) {
      completed.push(task);
    } else if (isTaskEnabled(task)) {
      executable.push(task);
    } else {
      locked.push(task);
    }
  });

  return { executable, locked, completed };
}
