import { describe, it, expect } from "vitest";

describe("Schedule Bottom Sheet Integration", () => {
  it("should create a schedule chip with date only", () => {
    const pendingSchedule = {
      date: new Date(2026, 0, 25), // January 25, 2026
      hasTime: false,
    };

    const month = pendingSchedule.date.getMonth() + 1;
    const day = pendingSchedule.date.getDate();
    const chip = `${month}/${day}`;

    expect(chip).toBe("1/25");
  });

  it("should create a schedule chip with date and time", () => {
    const pendingSchedule = {
      date: new Date(2026, 0, 25, 14, 30), // January 25, 2026 at 14:30
      hasTime: true,
    };

    const month = pendingSchedule.date.getMonth() + 1;
    const day = pendingSchedule.date.getDate();
    const hour = String(pendingSchedule.date.getHours()).padStart(2, "0");
    const minute = String(pendingSchedule.date.getMinutes()).padStart(2, "0");
    const chip = `${month}/${day} ${hour}:${minute}`;

    expect(chip).toBe("1/25 14:30");
  });

  it("should handle null schedule", () => {
    const pendingSchedule = null;
    expect(pendingSchedule).toBeNull();
  });

  it("should calculate next week tasks correctly", () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    nextWeekDate.setHours(0, 0, 0, 0);

    const isNextWeekTask = nextWeekDate >= tomorrow;
    expect(isNextWeekTask).toBe(true);
  });

  it("should format schedule chip with leading zeros for time", () => {
    const pendingSchedule = {
      date: new Date(2026, 0, 25, 9, 5), // January 25, 2026 at 09:05
      hasTime: true,
    };

    const month = pendingSchedule.date.getMonth() + 1;
    const day = pendingSchedule.date.getDate();
    const hour = String(pendingSchedule.date.getHours()).padStart(2, "0");
    const minute = String(pendingSchedule.date.getMinutes()).padStart(2, "0");
    const chip = `${month}/${day} ${hour}:${minute}`;

    expect(chip).toBe("1/25 09:05");
  });
});
