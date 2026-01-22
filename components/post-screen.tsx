import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import * as Haptics from "expo-haptics";

interface PostScreenProps {
  focusDurationMinutes: number;
  onPost: (message: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function PostScreen({
  focusDurationMinutes,
  onPost,
  onClose,
  isLoading = false,
}: PostScreenProps) {
  const colors = useColors();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handlePost = async () => {
    if (isSubmitting || isLoading) return;

    setIsSubmitting(true);
    try {
      await onPost(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessage("");
      // Close after a short delay to show success feedback
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error("Failed to post:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 24,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: colors.foreground,
            }}
          >
            集中完了！
          </Text>
          <Pressable
            onPress={onClose}
            disabled={isSubmitting || isLoading}
            style={{
              padding: 8,
              opacity: isSubmitting || isLoading ? 0.5 : 1,
            }}
          >
            <IconSymbol name="xmark.circle.fill" size={28} color={colors.muted} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Focus Duration Chip */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 24,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <IconSymbol name="flame.fill" size={20} color={colors.primary} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {formatDuration(focusDurationMinutes)} 集中
            </Text>
          </View>

          {/* Message Input */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.muted,
                marginBottom: 8,
              }}
            >
              メッセージ（任意）
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 100,
                textAlignVertical: "top",
              }}
              placeholder="今日の頑張りをシェアしよう"
              placeholderTextColor={colors.muted}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              editable={!isSubmitting && !isLoading}
            />
            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                marginTop: 8,
                textAlign: "right",
              }}
            >
              {message.length}/500
            </Text>
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginTop: 24,
            }}
          >
            <Pressable
              onPress={onClose}
              disabled={isSubmitting || isLoading}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                justifyContent: "center",
                alignItems: "center",
                opacity: isSubmitting || isLoading ? 0.5 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                スキップ
              </Text>
            </Pressable>

            <Pressable
              onPress={handlePost}
              disabled={isSubmitting || isLoading}
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: colors.primary,
                justifyContent: "center",
                alignItems: "center",
                opacity: isSubmitting || isLoading ? 0.7 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.background,
                }}
              >
                {isSubmitting || isLoading ? "投稿中..." : "投稿"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
