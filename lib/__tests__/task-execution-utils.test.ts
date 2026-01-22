import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getTaskExecutionStatus,
  isTaskEnabled,
  getTimeUntilExecutable,
  formatTimeUntilExecutable,
  groupTasksByExecutionStatus,
} from "../task-execution-utils";
import { Task } from "@/lib/task-context";

// Mock current date for consistent testing
const mockNow = new Date("2026-01-22T10:00:00Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(mockNow);
});

describe("Task Execution Utils", () => {
  describe("getTaskExecutionStatus", () => {
    it("should return not executable for completed tasks", () => {
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: true,
        createdAt: new Date(),
        scheduledAt: null,
        hasTime: false,
        userId: 1,
        updatedAt: new Date(),
      };

      const status = getTaskExecutionStatus(task);
      expect(status.isExecutable).toBe(false);
      expect(status.reason).toBe("既に完了済み");
    });

    it("should return executable for tasks without scheduled time", () => {
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: false,
        createdAt: new Date(),
        scheduledAt: null,
        hasTime: false,
        userId: 1,
        updatedAt: new Date(),
      };

      const status = getTaskExecutionStatus(task);
      expect(status.isExecutable).toBe(true);
      expect(status.reason).toBe("すぐに実行可能");
    });

    it("should return executable for tasks scheduled for today without time", () => {
      const today = new Date();
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: false,
        createdAt: new Date(),
        scheduledAt: today,
        hasTime: false,
        userId: 1,
        updatedAt: new Date(),
      };

      const status = getTaskExecutionStatus(task);
      expect(status.isExecutable).toBe(true);
    });

    it("should return not executable for tasks scheduled for future date without time", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: false,
        createdAt: new Date(),
        scheduledAt: tomorrow,
        hasTime: false,
        userId: 1,
        updatedAt: new Date(),
      };

      const status = getTaskExecutionStatus(task);
      expect(status.isExecutable).toBe(false);
      expect(status.reason).toContain("に実行可能");
    });

    it("should return not executable for tasks with future scheduled time", () => {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 2);
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: false,
        createdAt: new Date(),
        scheduledAt: futureTime,
        hasTime: true,
        userId: 1,
        updatedAt: new Date(),
      };

      const status = getTaskExecutionStatus(task);
      expect(status.isExecutable).toBe(false);
      expect(status.reason).toContain("に実行可能");
    });

    it("should return executable for tasks with past scheduled time", () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: false,
        createdAt: new Date(),
        scheduledAt: pastTime,
        hasTime: true,
        userId: 1,
        updatedAt: new Date(),
      };

      const status = getTaskExecutionStatus(task);
      expect(status.isExecutable).toBe(true);
      expect(status.reason).toBe("実行可能");
    });
  });

  describe("isTaskEnabled", () => {
    it("should return true for executable tasks", () => {
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: false,
        createdAt: new Date(),
        scheduledAt: null,
        hasTime: false,
        userId: 1,
        updatedAt: new Date(),
      };

      expect(isTaskEnabled(task)).toBe(true);
    });

    it("should return false for non-executable tasks", () => {
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: true,
        createdAt: new Date(),
        scheduledAt: null,
        hasTime: false,
        userId: 1,
        updatedAt: new Date(),
      };

      expect(isTaskEnabled(task)).toBe(false);
    });
  });

  describe("getTimeUntilExecutable", () => {
    it("should return null for tasks without scheduled time", () => {
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: false,
        createdAt: new Date(),
        scheduledAt: null,
        hasTime: false,
        userId: 1,
        updatedAt: new Date(),
      };

      expect(getTimeUntilExecutable(task)).toBeNull();
    });

    it("should return 0 for tasks with past scheduled time", () => {
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: false,
        createdAt: new Date(),
        scheduledAt: pastTime,
        hasTime: true,
        userId: 1,
        updatedAt: new Date(),
      };

      expect(getTimeUntilExecutable(task)).toBe(0);
    });

    it("should return positive milliseconds for future scheduled time", () => {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 1);
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: false,
        createdAt: new Date(),
        scheduledAt: futureTime,
        hasTime: true,
        userId: 1,
        updatedAt: new Date(),
      };

      const timeMs = getTimeUntilExecutable(task);
      expect(timeMs).toBeGreaterThan(0);
      expect(timeMs).toBeLessThanOrEqual(3600000); // 1 hour in ms
    });
  });

  describe("formatTimeUntilExecutable", () => {
    it("should return null for tasks without scheduled time", () => {
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: false,
        createdAt: new Date(),
        scheduledAt: null,
        hasTime: false,
        userId: 1,
        updatedAt: new Date(),
      };

      expect(formatTimeUntilExecutable(task)).toBeNull();
    });

    it("should return appropriate message for future time", () => {
      const futureTime = new Date();
      futureTime.setHours(futureTime.getHours() + 2);
      futureTime.setMinutes(30);
      const task: Task = {
        id: "task_1",
        title: "Test Task",
        isCompleted: false,
        createdAt: new Date(),
        scheduledAt: futureTime,
        hasTime: true,
        userId: 1,
        updatedAt: new Date(),
      };

      const formatted = formatTimeUntilExecutable(task);
      expect(formatted).toContain("時間");
      expect(formatted).toContain("分後に実行可能");
    });
  });

  describe("groupTasksByExecutionStatus", () => {
    it("should group tasks correctly", () => {
      const tasks: Task[] = [
        {
          id: "task_1",
          title: "Executable Task",
          isCompleted: false,
          createdAt: new Date(),
          scheduledAt: null,
          hasTime: false,
          userId: 1,
          updatedAt: new Date(),
        },
        {
          id: "task_2",
          title: "Completed Task",
          isCompleted: true,
          createdAt: new Date(),
          scheduledAt: null,
          hasTime: false,
          userId: 1,
          updatedAt: new Date(),
        },
        {
          id: "task_3",
          title: "Locked Task",
          isCompleted: false,
          createdAt: new Date(),
          scheduledAt: new Date(mockNow.getTime() + 3600000),
          hasTime: true,
          userId: 1,
          updatedAt: new Date(),
        },
      ];

      const grouped = groupTasksByExecutionStatus(tasks);
      expect(grouped.executable).toHaveLength(1);
      expect(grouped.completed).toHaveLength(1);
      expect(grouped.locked).toHaveLength(1);
    });
  });
});
