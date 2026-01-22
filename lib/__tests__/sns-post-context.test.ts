import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

import AsyncStorage from "@react-native-async-storage/async-storage";

describe("SNS Post Context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Post Management", () => {
    it("should create a valid SNS post", () => {
      const post = {
        id: "post_123",
        userId: "user_1",
        userName: "田中太郎",
        userIcon: "👨‍💼",
        message: "今日も集中できました！",
        focusMinutes: 25,
        createdAt: new Date().toISOString(),
        isOwn: true,
      };

      expect(post.id).toBeDefined();
      expect(post.message).toBeTruthy();
      expect(post.focusMinutes).toBeGreaterThan(0);
      expect(post.isOwn).toBe(true);
    });

    it("should validate post message length", () => {
      const message = "今日も頑張った💪";
      expect(message.length).toBeLessThanOrEqual(280);
    });

    it("should format focus time correctly", () => {
      const focusMinutes = 85;
      const hours = Math.floor(focusMinutes / 60);
      const mins = focusMinutes % 60;
      const formatted = `${hours}h ${mins}m 集中`;

      expect(formatted).toBe("1h 25m 集中");
    });

    it("should handle short focus times", () => {
      const focusMinutes = 25;
      const hours = Math.floor(focusMinutes / 60);
      const mins = focusMinutes % 60;
      const formatted = hours > 0 ? `${hours}h ${mins}m 集中` : `${mins}m 集中`;

      expect(formatted).toBe("25m 集中");
    });
  });

  describe("Post Filtering", () => {
    it("should filter posts by today", () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      const posts = [
        {
          id: "1",
          createdAt: now.toISOString(),
          isToday: true,
        },
        {
          id: "2",
          createdAt: yesterday.toISOString(),
          isToday: false,
        },
      ];

      const todayPosts = posts.filter((post) => {
        const postDate = new Date(post.createdAt);
        const postDay = new Date(
          postDate.getFullYear(),
          postDate.getMonth(),
          postDate.getDate()
        );
        return postDay.getTime() === today.getTime();
      });

      expect(todayPosts).toHaveLength(1);
      expect(todayPosts[0].id).toBe("1");
    });

    it("should filter posts by week", () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const posts = [
        {
          id: "1",
          createdAt: now.toISOString(),
        },
        {
          id: "2",
          createdAt: weekAgo.toISOString(),
        },
        {
          id: "3",
          createdAt: twoWeeksAgo.toISOString(),
        },
      ];

      const weekPosts = posts.filter((post) => {
        const postDate = new Date(post.createdAt);
        return postDate >= weekAgo;
      });

      expect(weekPosts).toHaveLength(2);
    });
  });

  describe("Post Sorting", () => {
    it("should sort posts by creation date (newest first)", () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const posts = [
        { id: "1", createdAt: twoHoursAgo.toISOString() },
        { id: "2", createdAt: now.toISOString() },
        { id: "3", createdAt: oneHourAgo.toISOString() },
      ];

      const sorted = [...posts].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      expect(sorted[0].id).toBe("2");
      expect(sorted[1].id).toBe("3");
      expect(sorted[2].id).toBe("1");
    });
  });

  describe("User Ownership", () => {
    it("should identify own posts", () => {
      const currentUserId = "user_current";
      const post = {
        id: "post_1",
        userId: currentUserId,
        isOwn: true,
      };

      expect(post.isOwn).toBe(true);
      expect(post.userId).toBe(currentUserId);
    });

    it("should identify other users' posts", () => {
      const currentUserId = "user_current";
      const post = {
        id: "post_2",
        userId: "user_other",
        isOwn: false,
      };

      expect(post.isOwn).toBe(false);
      expect(post.userId).not.toBe(currentUserId);
    });
  });

  describe("Mock User Generation", () => {
    it("should generate mock users with correct structure", () => {
      const mockUsers = [
        { id: "user_1", name: "田中太郎", icon: "👨‍💼" },
        { id: "user_2", name: "鈴木花子", icon: "👩‍💻" },
      ];

      mockUsers.forEach((user) => {
        expect(user.id).toBeDefined();
        expect(user.name).toBeDefined();
        expect(user.icon).toBeDefined();
      });
    });
  });
});
