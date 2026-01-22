import { describe, it, expect } from "vitest";
import {
  calculateWeeklyStats,
  calculateDailyStats,
  formatDuration,
  formatDurationParts,
  getRelativeTime,
  getDayLabel,
  getWeekStart,
  getWeekEnd,
} from "../stats-utils";
import type { FocusLog } from "../focus-log-context";

describe("Stats Utils", () => {
  describe("Week Start/End Calculation", () => {
    it("should get week start (Monday) for a given date", () => {
      const date = new Date("2026-01-22"); // Thursday
      const weekStart = getWeekStart(date, "mon");

      expect(weekStart.getDay()).toBe(1); // Monday
      expect(weekStart.toISOString().split("T")[0]).toBe("2026-01-19");
    });

    it("should get week end (Sunday) for a given date", () => {
      const date = new Date("2026-01-22"); // Thursday
      const weekEnd = getWeekEnd(date, "mon");

      expect(weekEnd.getDay()).toBe(0); // Sunday
      expect(weekEnd.toISOString().split("T")[0]).toBe("2026-01-26");
    });

    it("should handle week start on Sunday", () => {
      const date = new Date("2026-01-22"); // Thursday
      const weekStart = getWeekStart(date, "sun");

      expect(weekStart.getDay()).toBe(0); // Sunday
      expect(weekStart.toISOString().split("T")[0]).toBe("2026-01-18");
    });
  });

  describe("Weekly Statistics Calculation", () => {
    it("should calculate weekly stats from focus logs", () => {
      const logs: FocusLog[] = [
        {
          id: "log_1",
          durationMinutes: 25,
          completedAt: new Date("2026-01-20T10:00:00").toISOString(),
          visibility: "public",
          createdAt: new Date().toISOString(),
        },
        {
          id: "log_2",
          durationMinutes: 50,
          completedAt: new Date("2026-01-21T14:00:00").toISOString(),
          visibility: "public",
          createdAt: new Date().toISOString(),
        },
        {
          id: "log_3",
          durationMinutes: 25,
          completedAt: new Date("2026-01-22T09:00:00").toISOString(),
          visibility: "public",
          createdAt: new Date().toISOString(),
        },
      ];

      const stats = calculateWeeklyStats(logs, "mon");

      expect(stats.totalFocusMinutes).toBe(100);
      expect(stats.pomodoroCount).toBe(3);
    });

    it("should calculate daily breakdown correctly", () => {
      const logs: FocusLog[] = [
        {
          id: "log_1",
          durationMinutes: 25,
          completedAt: new Date("2026-01-19T10:00:00").toISOString(), // Monday
          visibility: "public",
          createdAt: new Date().toISOString(),
        },
        {
          id: "log_2",
          durationMinutes: 25,
          completedAt: new Date("2026-01-19T14:00:00").toISOString(), // Monday
          visibility: "public",
          createdAt: new Date().toISOString(),
        },
        {
          id: "log_3",
          durationMinutes: 50,
          completedAt: new Date("2026-01-20T09:00:00").toISOString(), // Tuesday
          visibility: "public",
          createdAt: new Date().toISOString(),
        },
      ];

      const stats = calculateWeeklyStats(logs, "mon");

      expect(stats.dailyBreakdown[0]).toBe(2); // Monday: 2 sessions
      expect(stats.dailyBreakdown[1]).toBe(1); // Tuesday: 1 session
      expect(stats.dailyBreakdown.slice(2).every((v) => v === 0)).toBe(true); // Rest: 0
    });

    it("should filter logs outside the week", () => {
      const logs: FocusLog[] = [
        {
          id: "log_1",
          durationMinutes: 25,
          completedAt: new Date("2026-01-19T10:00:00").toISOString(), // This week
          visibility: "public",
          createdAt: new Date().toISOString(),
        },
        {
          id: "log_2",
          durationMinutes: 50,
          completedAt: new Date("2026-01-26T14:00:00").toISOString(), // Next week
          visibility: "public",
          createdAt: new Date().toISOString(),
        },
      ];

      const stats = calculateWeeklyStats(logs, "mon");

      expect(stats.totalFocusMinutes).toBe(25);
      expect(stats.pomodoroCount).toBe(1);
    });
  });

  describe("Daily Statistics Calculation", () => {
    it("should calculate daily stats for a specific date", () => {
      const logs: FocusLog[] = [
        {
          id: "log_1",
          durationMinutes: 25,
          completedAt: new Date("2026-01-20T10:00:00Z").toISOString(),
          visibility: "public",
          createdAt: new Date().toISOString(),
        },
        {
          id: "log_2",
          durationMinutes: 50,
          completedAt: new Date("2026-01-20T14:00:00Z").toISOString(),
          visibility: "public",
          createdAt: new Date().toISOString(),
        },
        {
          id: "log_3",
          durationMinutes: 25,
          completedAt: new Date("2026-01-21T09:00:00Z").toISOString(),
          visibility: "public",
          createdAt: new Date().toISOString(),
        },
      ];

      const stats = calculateDailyStats(logs, new Date("2026-01-20T00:00:00Z"));

      expect(stats.focusMinutes).toBe(75);
      expect(stats.pomodoroCount).toBe(2);
    });
  });

  describe("Duration Formatting", () => {
    it("should format minutes to human-readable time string", () => {
      expect(formatDuration(25)).toBe("25m");
      expect(formatDuration(60)).toBe("1h 0m");
      expect(formatDuration(105)).toBe("1h 45m");
      expect(formatDuration(150)).toBe("2h 30m");
    });

    it("should format duration parts separately", () => {
      const parts = formatDurationParts(105);
      expect(parts.hours).toBe(1);
      expect(parts.minutes).toBe(45);
    });

    it("should handle zero minutes", () => {
      expect(formatDuration(0)).toBe("0m");
      const parts = formatDurationParts(0);
      expect(parts.hours).toBe(0);
      expect(parts.minutes).toBe(0);
    });
  });

  describe("Relative Time Formatting", () => {
    it("should format recent times", () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const result = getRelativeTime(fiveMinutesAgo);
      expect(result).toBe("5分前");
    });

    it("should format hours ago", () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const result = getRelativeTime(twoHoursAgo);
      expect(result).toBe("2時間前");
    });

    it("should format days ago", () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      const result = getRelativeTime(threeDaysAgo);
      expect(result).toBe("3日前");
    });

    it("should return 'now' for very recent times", () => {
      const now = new Date();
      const result = getRelativeTime(now);
      expect(result).toBe("今");
    });
  });

  describe("Day Label Formatting", () => {
    it("should return short day labels", () => {
      expect(getDayLabel(0, "short")).toBe("月");
      expect(getDayLabel(1, "short")).toBe("火");
      expect(getDayLabel(6, "short")).toBe("日");
    });

    it("should return long day labels", () => {
      expect(getDayLabel(0, "long")).toBe("月曜日");
      expect(getDayLabel(1, "long")).toBe("火曜日");
      expect(getDayLabel(6, "long")).toBe("日曜日");
    });
  });
});
