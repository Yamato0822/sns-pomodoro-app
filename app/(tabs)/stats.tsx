import { View, Text, ScrollView, Pressable, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useFocusLogs } from "@/lib/focus-log-context";
import { useReactions, type ReactionType } from "@/lib/reaction-context";
import { useSNSPosts } from "@/lib/sns-post-context";
import { useState, useEffect } from "react";
import {
  calculateWeeklyStats,
  formatDurationParts,
  getRelativeTime,
} from "@/lib/stats-utils";
import { SNSPostModal } from "@/components/sns-post-modal";
import * as Haptics from "expo-haptics";

interface FeedPost {
  id: string;
  userName: string;
  userIcon: string;
  timeAgo: string;
  focusTime: string;
  message: string;
  reactionCounts: Record<ReactionType, number>;
  userReactions: Set<ReactionType>;
  isOwn: boolean;
}

type FilterType = "all" | "today" | "week";

export default function StatsScreen() {
  const colors = useColors();
  const { logs } = useFocusLogs();
  const { getReactionCount, hasUserReacted, addReaction, removeReaction, reactions } =
    useReactions();
  const { posts: snsPosts, deletePost } = useSNSPosts();
  const [weekStats, setWeekStats] = useState({
    totalFocusMinutes: 0,
    pomodoroCount: 0,
    dailyBreakdown: Array(7).fill(0),
  });
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [selectedFocusMinutes, setSelectedFocusMinutes] = useState(25);
  const [filterType, setFilterType] = useState<FilterType>("all");

  useEffect(() => {
    // Calculate weekly statistics from focus logs
    const stats = calculateWeeklyStats(logs, "mon");
    setWeekStats({
      totalFocusMinutes: stats.totalFocusMinutes,
      pomodoroCount: stats.pomodoroCount,
      dailyBreakdown: stats.dailyBreakdown,
    });

    // Generate feed posts from SNS posts
    const filteredSNSPosts =
      filterType === "all"
        ? snsPosts
        : filterType === "today"
          ? snsPosts.filter((post) => {
              const postDate = new Date(post.createdAt);
              const today = new Date();
              return (
                postDate.getFullYear() === today.getFullYear() &&
                postDate.getMonth() === today.getMonth() &&
                postDate.getDate() === today.getDate()
              );
            })
          : snsPosts.filter((post) => {
              const postDate = new Date(post.createdAt);
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return postDate >= weekAgo;
            });

    const postsFromSNS = filteredSNSPosts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((post) => {
        const hours = Math.floor(post.focusMinutes / 60);
        const mins = post.focusMinutes % 60;
        const focusTimeStr =
          hours > 0 ? `${hours}h ${mins}m 集中` : `${mins}m 集中`;

        const reactionCounts: Record<ReactionType, number> = {
          like: getReactionCount(post.id, "like"),
          heart: getReactionCount(post.id, "heart"),
          fire: getReactionCount(post.id, "fire"),
        };

        const userReactions = new Set<ReactionType>();
        if (hasUserReacted(post.id, "like")) userReactions.add("like");
        if (hasUserReacted(post.id, "heart")) userReactions.add("heart");
        if (hasUserReacted(post.id, "fire")) userReactions.add("fire");

        return {
          id: post.id,
          userName: post.userName,
          userIcon: post.userIcon,
          timeAgo: getRelativeTime(new Date(post.createdAt)),
          focusTime: focusTimeStr,
          message: post.message,
          reactionCounts,
          userReactions,
          isOwn: post.isOwn,
        };
      });

    setFeedPosts(postsFromSNS);
  }, [logs, reactions, snsPosts, filterType, getReactionCount, hasUserReacted]);

  const handleReaction = async (postId: string, reactionType: ReactionType) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (hasUserReacted(postId, reactionType)) {
        // Remove reaction
        const reaction = reactions.find(
          (r) => r.focusLogId === postId && r.type === reactionType
        );
        if (reaction) {
          await removeReaction(reaction.id);
        }
      } else {
        // Add reaction
        await addReaction(postId, reactionType);
      }
    } catch (error) {
      console.error("Failed to handle reaction:", error);
    }
  };

  const handleDeletePost = (postId: string) => {
    deletePost(postId);
  };

  const getReactionIcon = (type: ReactionType) => {
    switch (type) {
      case "like":
        return "hand.thumbsup.fill" as const;
      case "heart":
        return "heart.fill" as const;
      case "fire":
        return "flame.fill" as const;
    }
  };

  const durationParts = formatDurationParts(weekStats.totalFocusMinutes);

  const renderFeedPost = ({ item }: { item: FeedPost }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 24 }}>{item.userIcon}</Text>
          <View>
            <Text
              style={{
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {item.userName}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
              }}
            >
              {item.timeAgo}
            </Text>
          </View>
        </View>
        {item.isOwn && (
          <Pressable onPress={() => handleDeletePost(item.id)} style={{ padding: 4 }}>
            <IconSymbol name="trash" size={18} color={colors.error} />
          </Pressable>
        )}
      </View>

      {/* Focus Time Chip */}
      <View
        style={{
          backgroundColor: `${colors.primary}20`,
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 4,
          alignSelf: "flex-start",
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.primary,
          }}
        >
          {item.focusTime}
        </Text>
      </View>

      {/* Message */}
      <Text
        style={{
          color: colors.foreground,
          marginBottom: 12,
          lineHeight: 20,
        }}
      >
        {item.message}
      </Text>

      {/* Reactions */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {(["like", "heart", "fire"] as ReactionType[]).map((type) => {
          const isReacted = item.userReactions.has(type);
          const count = item.reactionCounts[type];

          return (
            <Pressable
              key={type}
              onPress={() => handleReaction(item.id, type)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: isReacted ? `${colors.primary}20` : colors.background,
                borderWidth: 1,
                borderColor: isReacted ? colors.primary : colors.border,
              }}
            >
              <IconSymbol
                name={getReactionIcon(type)}
                size={16}
                color={isReacted ? colors.primary : colors.muted}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: isReacted ? "600" : "400",
                  color: isReacted ? colors.primary : colors.muted,
                }}
              >
                {count}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <>
      <ScreenContainer className="pb-24">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 24,
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: colors.foreground,
              }}
            >
              今週の統計
            </Text>
          </View>

          {/* Statistics Cards */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 24,
              gap: 12,
            }}
          >
            {/* Total Focus Time */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: colors.muted,
                  marginBottom: 8,
                }}
              >
                総集中時間
              </Text>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                {durationParts.hours}h {durationParts.minutes}m
              </Text>
            </View>

            {/* Pomodoro Count */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: colors.muted,
                  marginBottom: 8,
                }}
              >
                ポモドーロ回数
              </Text>
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: "700",
                  color: colors.primary,
                }}
              >
                {weekStats.pomodoroCount}
              </Text>
            </View>

            {/* Daily Breakdown */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: colors.muted,
                  marginBottom: 12,
                }}
              >
                日別ブレイクダウン
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  height: 96,
                  gap: 4,
                }}
              >
                {["月", "火", "水", "木", "金", "土", "日"].map((day, index) => {
                  const maxValue = Math.max(...weekStats.dailyBreakdown, 1);
                  const height = (weekStats.dailyBreakdown[index] / maxValue) * 100;

                  return (
                    <View
                      key={day}
                      style={{
                        flex: 1,
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <View
                        style={{
                          width: "100%",
                          height: `${Math.max(height, 5)}%`,
                          backgroundColor: colors.primary,
                          borderTopLeftRadius: 4,
                          borderTopRightRadius: 4,
                        }}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.muted,
                        }}
                      >
                        {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Feed Section */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingBottom: 24,
            }}
          >
            {/* Feed Header with Filter */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.foreground,
                }}
              >
                みんなの頑張り
              </Text>
              <Pressable
                onPress={() => {
                  setSelectedFocusMinutes(25);
                  setPostModalVisible(true);
                }}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <IconSymbol name="plus" size={16} color={colors.background} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.background,
                  }}
                >
                  投稿
                </Text>
              </Pressable>
            </View>

            {/* Filter Buttons */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {(["all", "today", "week"] as FilterType[]).map((filter) => (
                <Pressable
                  key={filter}
                  onPress={() => setFilterType(filter)}
                  style={{
                    backgroundColor:
                      filterType === filter ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      filterType === filter ? colors.primary : colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color:
                        filterType === filter ? colors.background : colors.foreground,
                    }}
                  >
                    {filter === "all"
                      ? "全て"
                      : filter === "today"
                        ? "今日"
                        : "今週"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Feed Posts */}
            {feedPosts.length > 0 ? (
              <FlatList
                data={feedPosts}
                renderItem={renderFeedPost}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.muted,
                  }}
                >
                  投稿がまだありません
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenContainer>

      {/* SNS Post Modal */}
      <SNSPostModal
        visible={postModalVisible}
        onClose={() => setPostModalVisible(false)}
        focusMinutes={selectedFocusMinutes}
      />
    </>
  );
}
