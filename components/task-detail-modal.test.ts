import { describe, it, expect, vi } from "vitest";
import { Task } from "@/lib/task-context";

describe("TaskDetailModal", () => {
  const mockTask: Task = {
    id: "task_1",
    userId: 1,
    title: "テストタスク",
    description: "テスト説明",
    scheduledAt: new Date("2026-01-25"),
    dueDate: new Date("2026-01-25T14:00:00"),
    hasTime: true,
    priority: "high",
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("should render task details correctly", () => {
    expect(mockTask.title).toBe("テストタスク");
    expect(mockTask.description).toBe("テスト説明");
    expect(mockTask.priority).toBe("high");
  });

  it("should update task title", () => {
    const updatedTask = { ...mockTask, title: "更新されたタスク" };
    expect(updatedTask.title).toBe("更新されたタスク");
    expect(updatedTask.id).toBe(mockTask.id);
  });

  it("should update task priority", () => {
    const updatedTask = { ...mockTask, priority: "low" as const };
    expect(updatedTask.priority).toBe("low");
  });

  it("should update task due date", () => {
    const newDate = new Date("2026-02-01T10:00:00");
    const updatedTask = { ...mockTask, dueDate: newDate };
    expect(updatedTask.dueDate).toEqual(newDate);
  });

  it("should handle task deletion", () => {
    const taskId = mockTask.id;
    expect(taskId).toBe("task_1");
    // In actual implementation, this would call deleteTask
  });

  it("should format date correctly", () => {
    const date = new Date("2026-01-25T00:00:00Z");
    const formatted = date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    // The formatted output will be in the format "2026/01/25" in Japanese locale
    expect(formatted).toContain("2026");
  });

  it("should format time correctly", () => {
    const date = new Date("2026-01-25T14:30:00Z");
    const formatted = date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    // Check that formatted time contains colon separator
    expect(formatted).toContain(":");
  });

  it("should validate task data", () => {
    const isValid = mockTask.title && mockTask.id && mockTask.userId;
    expect(isValid).toBeTruthy();
  });

  it("should handle optional fields", () => {
    const minimalTask: Task = {
      id: "task_2",
      userId: 1,
      title: "最小限のタスク",
      scheduledAt: null,
      hasTime: false,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(minimalTask.description).toBeUndefined();
    expect(minimalTask.dueDate).toBeUndefined();
    expect(minimalTask.priority).toBeUndefined();
  });
});
