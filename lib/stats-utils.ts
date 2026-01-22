import { FocusLog } from "@/lib/focus-log-context";

export interface WeeklyStats {
  totalFocusMinutes: number;
  pomodoroCount: number;
  dailyBreakdown: number[]; // 0-6: Mon-Sun
  startDate: Date;
  endDate: Date;
}

export interface DailyStats {
  date: Date;
  focusMinutes: number;
  pomodoroCount: number;
}

/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Date, weekStartDay: "mon" | "sun" = "mon"): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = weekStartDay === "mon" ? d.getDate() - day + (day === 0 ? -6 : 1) : d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the week (Sunday) for a given date
 */
export function getWeekEnd(date: Date, weekStartDay: "mon" | "sun" = "mon"): Date {
  const start = getWeekStart(date, weekStartDay);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Calculate weekly statistics from focus logs
 */
export function calculateWeeklyStats(
  logs: FocusLog[],
  weekStartDay: "mon" | "sun" = "mon"
): WeeklyStats {
  const today = new Date();
  const startDate = getWeekStart(today, weekStartDay);
  const endDate = getWeekEnd(today, weekStartDay);

  // Filter logs for this week
  const weekLogs = logs.filter((log) => {
    const logDate = new Date(log.completedAt);
    return logDate >= startDate && logDate <= endDate;
  });

  // Calculate total focus minutes and pomodoro count
  let totalFocusMinutes = 0;
  const pomodoroCount = weekLogs.length;

  weekLogs.forEach((log) => {
    totalFocusMinutes += log.durationMinutes;
  });

  // Calculate daily breakdown
  const dailyBreakdown = Array(7).fill(0);

  weekLogs.forEach((log) => {
    const logDate = new Date(log.completedAt);
    let dayIndex = logDate.getDay();

    // Convert Sunday (0) to 6 if week starts on Monday
    if (weekStartDay === "mon") {
      dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
    }

    dailyBreakdown[dayIndex]++;
  });

  return {
    totalFocusMinutes,
    pomodoroCount,
    dailyBreakdown,
    startDate,
    endDate,
  };
}

/**
 * Calculate daily statistics for a specific date
 */
export function calculateDailyStats(logs: FocusLog[], date: Date): DailyStats {
  // Use UTC date for comparison
  const dateStr = date.toISOString().split("T")[0];

  const dayLogs = logs.filter((log) => {
    const logDateStr = log.completedAt.split("T")[0];
    return logDateStr === dateStr;
  });

  let focusMinutes = 0;
  dayLogs.forEach((log) => {
    focusMinutes += log.durationMinutes;
  });

  return {
    date,
    focusMinutes,
    pomodoroCount: dayLogs.length,
  };
}

/**
 * Format minutes to human-readable time string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Format minutes to hours and minutes separately
 */
export function formatDurationParts(minutes: number): { hours: number; minutes: number } {
  return {
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
  };
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return "今";
  } else if (diffMins < 60) {
    return `${diffMins}分前`;
  } else if (diffHours < 24) {
    return `${diffHours}時間前`;
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else {
    return date.toLocaleDateString("ja-JP");
  }
}

/**
 * Get day of week label
 */
export function getDayLabel(dayIndex: number, format: "short" | "long" = "short"): string {
  const shortLabels = ["月", "火", "水", "木", "金", "土", "日"];
  const longLabels = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];

  return format === "short" ? shortLabels[dayIndex] : longLabels[dayIndex];
}
