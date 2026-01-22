import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface SNSPost {
  id: string;
  userId: string;
  userName: string;
  userIcon: string;
  message: string;
  focusMinutes: number;
  createdAt: string;
  isOwn: boolean; // Whether this post is created by current user
}

export interface SNSPostContextType {
  posts: SNSPost[];
  addPost: (message: string, focusMinutes: number) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  getPosts: (filter?: "today" | "week" | "all") => SNSPost[];
  isLoading: boolean;
}

const SNSPostContext = createContext<SNSPostContextType | undefined>(undefined);

const STORAGE_KEY = "sns_posts";
const CURRENT_USER_ID = "user_current";

// Mock user data for demo
const mockUsers = [
  { id: "user_1", name: "田中太郎", icon: "👨‍💼" },
  { id: "user_2", name: "鈴木花子", icon: "👩‍💻" },
  { id: "user_3", name: "佐藤次郎", icon: "👨‍🎓" },
  { id: "user_4", name: "伊藤美咲", icon: "👩‍🎨" },
];

function generateMockPosts(): SNSPost[] {
  const now = new Date();
  const posts: SNSPost[] = [];

  // Generate mock posts from different users
  mockUsers.forEach((user, index) => {
    const hoursAgo = index * 2 + 1;
    const postTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    posts.push({
      id: `mock_post_${user.id}`,
      userId: user.id,
      userName: user.name,
      userIcon: user.icon,
      message: [
        "今日も集中できました！",
        "朝活で頑張ってます💪",
        "目標達成できそう🎯",
        "集中力MAX🔥",
      ][index],
      focusMinutes: 25 + index * 10,
      createdAt: postTime.toISOString(),
      isOwn: false,
    });
  });

  return posts;
}

export function SNSPostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<SNSPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load posts from AsyncStorage on mount
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const userPosts = stored ? JSON.parse(stored) : [];

        // Combine mock posts with user posts
        const mockPosts = generateMockPosts();
        const allPosts = [...userPosts, ...mockPosts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setPosts(allPosts);
      } catch (error) {
        console.error("Failed to load SNS posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, []);

  const addPost = async (message: string, focusMinutes: number) => {
    try {
      const newPost: SNSPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        userId: CURRENT_USER_ID,
        userName: "あなた",
        userIcon: "👤",
        message,
        focusMinutes,
        createdAt: new Date().toISOString(),
        isOwn: true,
      };

      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const userPosts = stored ? JSON.parse(stored) : [];
      const updatedPosts = [newPost, ...userPosts];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));

      // Update state with new post at the top
      setPosts((prev) => [newPost, ...prev]);
    } catch (error) {
      console.error("Failed to add SNS post:", error);
      throw error;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const userPosts = stored ? JSON.parse(stored) : [];
      const filteredPosts = userPosts.filter((p: SNSPost) => p.id !== postId);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPosts));

      // Update state
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Failed to delete SNS post:", error);
      throw error;
    }
  };

  const getPosts = (filter?: "today" | "week" | "all") => {
    if (!filter || filter === "all") {
      return posts;
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    return posts.filter((post) => {
      const postDate = new Date(post.createdAt);

      if (filter === "today") {
        const postDay = new Date(
          postDate.getFullYear(),
          postDate.getMonth(),
          postDate.getDate()
        );
        return postDay.getTime() === today.getTime();
      }

      if (filter === "week") {
        return postDate.getTime() >= weekAgo.getTime();
      }

      return true;
    });
  };

  return (
    <SNSPostContext.Provider
      value={{
        posts,
        addPost,
        deletePost,
        getPosts,
        isLoading,
      }}
    >
      {children}
    </SNSPostContext.Provider>
  );
}

export function useSNSPosts() {
  const context = useContext(SNSPostContext);
  if (!context) {
    throw new Error("useSNSPosts must be used within SNSPostProvider");
  }
  return context;
}
