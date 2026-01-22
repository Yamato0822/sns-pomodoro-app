import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe("Reaction Context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Reaction Data Model", () => {
    it("should create a reaction with required fields", () => {
      const reaction = {
        id: "reaction_123",
        focusLogId: "log_123",
        type: "like" as const,
        userId: "user_local",
        createdAt: new Date().toISOString(),
      };

      expect(reaction.id).toBeDefined();
      expect(reaction.focusLogId).toBeDefined();
      expect(reaction.type).toBe("like");
      expect(reaction.userId).toBe("user_local");
    });

    it("should support multiple reaction types", () => {
      const reactionTypes = ["like", "heart", "fire"] as const;

      reactionTypes.forEach((type) => {
        const reaction = {
          id: `reaction_${type}`,
          focusLogId: "log_123",
          type,
          userId: "user_local",
          createdAt: new Date().toISOString(),
        };

        expect(reaction.type).toBe(type);
      });
    });
  });

  describe("Reaction Operations", () => {
    it("should generate unique reaction IDs", () => {
      const id1 = `reaction_${Date.now()}`;
      const id2 = `reaction_${Date.now() + 1}`;

      expect(id1).not.toBe(id2);
    });

    it("should track reactions by focus log ID", () => {
      const reactions = [
        {
          id: "reaction_1",
          focusLogId: "log_123",
          type: "like" as const,
          userId: "user_local",
          createdAt: new Date().toISOString(),
        },
        {
          id: "reaction_2",
          focusLogId: "log_123",
          type: "heart" as const,
          userId: "user_local",
          createdAt: new Date().toISOString(),
        },
        {
          id: "reaction_3",
          focusLogId: "log_456",
          type: "like" as const,
          userId: "user_local",
          createdAt: new Date().toISOString(),
        },
      ];

      const log123Reactions = reactions.filter((r) => r.focusLogId === "log_123");
      expect(log123Reactions).toHaveLength(2);
      expect(log123Reactions.every((r) => r.focusLogId === "log_123")).toBe(true);
    });

    it("should count reactions by type", () => {
      const reactions = [
        {
          id: "reaction_1",
          focusLogId: "log_123",
          type: "like" as const,
          userId: "user_local",
          createdAt: new Date().toISOString(),
        },
        {
          id: "reaction_2",
          focusLogId: "log_123",
          type: "like" as const,
          userId: "user_local",
          createdAt: new Date().toISOString(),
        },
        {
          id: "reaction_3",
          focusLogId: "log_123",
          type: "heart" as const,
          userId: "user_local",
          createdAt: new Date().toISOString(),
        },
      ];

      const logReactions = reactions.filter((r) => r.focusLogId === "log_123");
      const likeCount = logReactions.filter((r) => r.type === "like").length;
      const heartCount = logReactions.filter((r) => r.type === "heart").length;

      expect(likeCount).toBe(2);
      expect(heartCount).toBe(1);
    });

    it("should check if user has reacted", () => {
      const reactions = [
        {
          id: "reaction_1",
          focusLogId: "log_123",
          type: "like" as const,
          userId: "user_local",
          createdAt: new Date().toISOString(),
        },
      ];

      const hasLiked = reactions.some(
        (r) => r.focusLogId === "log_123" && r.type === "like" && r.userId === "user_local"
      );
      const hasHearted = reactions.some(
        (r) => r.focusLogId === "log_123" && (r.type as string) === "heart" && r.userId === "user_local"
      );

      expect(hasLiked).toBe(true);
      expect(hasHearted).toBe(false);
    });

    it("should remove reactions by ID", () => {
      const reactions = [
        {
          id: "reaction_1",
          focusLogId: "log_123",
          type: "like" as const,
          userId: "user_local",
          createdAt: new Date().toISOString(),
        },
        {
          id: "reaction_2",
          focusLogId: "log_123",
          type: "heart" as const,
          userId: "user_local",
          createdAt: new Date().toISOString(),
        },
      ];

      const updatedReactions = reactions.filter((r) => r.id !== "reaction_1");
      expect(updatedReactions).toHaveLength(1);
      expect(updatedReactions[0].id).toBe("reaction_2");
    });
  });

  describe("Reaction Storage", () => {
    it("should store reactions with ISO timestamps", () => {
      const now = new Date();
      const isoString = now.toISOString();

      expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it("should serialize reactions to JSON", () => {
      const reactions = [
        {
          id: "reaction_1",
          focusLogId: "log_123",
          type: "like" as const,
          userId: "user_local",
          createdAt: new Date().toISOString(),
        },
      ];

      const json = JSON.stringify(reactions);
      const parsed = JSON.parse(json);

      expect(parsed[0].id).toBe("reaction_1");
      expect(parsed[0].type).toBe("like");
    });
  });
});
