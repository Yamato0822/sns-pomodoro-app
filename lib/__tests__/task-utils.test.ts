import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isTaskExecutable, getTaskExecutionBlockReason, getTaskExecutionStatus } from "../task-utils";
import { Task } from "../task-context";

describe("Task Execution Logic", () => {
  let now: Date;

  beforeEach(() => {
    // 2026-01-22 10:00:00 に固定
    now = new Date(2026, 0, 22, 10, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("isTaskExecutable", () => {
    it("should return true for task without scheduledAt", () => {
      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: null,
        hasTime: false,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(isTaskExecutable(task)).toBe(true);
    });

    it("should return false for task scheduled for tomorrow", () => {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: tomorrow,
        hasTime: false,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(isTaskExecutable(task)).toBe(false);
    });

    it("should return true for today task without time", () => {
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);

      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: today,
        hasTime: false,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(isTaskExecutable(task)).toBe(true);
    });

    it("should return false for today task with time in the future", () => {
      const today = new Date(now);
      today.setHours(14, 0, 0, 0); // 14:00 (future)

      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: today,
        hasTime: true,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(isTaskExecutable(task)).toBe(false);
    });

    it("should return true for today task with time in the past", () => {
      const today = new Date(now);
      today.setHours(9, 0, 0, 0); // 09:00 (past)

      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: today,
        hasTime: true,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(isTaskExecutable(task)).toBe(true);
    });

    it("should return true for past task", () => {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(10, 0, 0, 0);

      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: yesterday,
        hasTime: true,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(isTaskExecutable(task)).toBe(true);
    });
  });

  describe("getTaskExecutionBlockReason", () => {
    it("should return null for executable task", () => {
      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: null,
        hasTime: false,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(getTaskExecutionBlockReason(task)).toBeNull();
    });

    it("should return scheduled date for future task", () => {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: tomorrow,
        hasTime: false,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(getTaskExecutionBlockReason(task)).toBe("1/23に実行予定");
    });

    it("should return scheduled time for today task with future time", () => {
      const today = new Date(now);
      today.setHours(14, 30, 0, 0);

      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: today,
        hasTime: true,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(getTaskExecutionBlockReason(task)).toBe("14:30に実行予定");
    });
  });

  describe("getTaskExecutionStatus", () => {
    it("should return executable for task without scheduledAt", () => {
      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: null,
        hasTime: false,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(getTaskExecutionStatus(task)).toBe("executable");
    });

    it("should return scheduled for future task", () => {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: tomorrow,
        hasTime: false,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(getTaskExecutionStatus(task)).toBe("scheduled");
    });

    it("should return time-locked for today task with future time", () => {
      const today = new Date(now);
      today.setHours(14, 0, 0, 0);

      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: today,
        hasTime: true,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(getTaskExecutionStatus(task)).toBe("time-locked");
    });

    it("should return executable for today task with past time", () => {
      const today = new Date(now);
      today.setHours(9, 0, 0, 0);

      const task: Task = {
        id: "1",
        userId: 1,
        title: "Test Task",
        scheduledAt: today,
        hasTime: true,
        isCompleted: false,
        createdAt: now,
        updatedAt: now,
      };

      expect(getTaskExecutionStatus(task)).toBe("executable");
    });
  });
});
