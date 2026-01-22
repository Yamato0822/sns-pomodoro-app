import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useSNSPosts } from "@/lib/sns-post-context";
import * as Haptics from "expo-haptics";

interface SNSPostModalProps {
  visible: boolean;
  onClose: () => void;
  focusMinutes: number;
}

export function SNSPostModal({ visible, onClose, focusMinutes }: SNSPostModalProps) {
  const colors = useColors();
  const { addPost } = useSNSPosts();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async () => {
    if (!message.trim()) {
      Alert.alert("エラー", "メッセージを入力してください");
      return;
    }

    setIsLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await addPost(message, focusMinutes);
      Alert.alert("成功", "投稿しました！");
      setMessage("");
      onClose();
    } catch (error) {
      Alert.alert("エラー", "投稿に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const hours = Math.floor(focusMinutes / 60);
  const mins = focusMinutes % 60;
  const focusTimeStr = hours > 0 ? `${hours}h ${mins}m 集中` : `${mins}m 集中`;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 32,
            maxHeight: "80%",
          }}
        >
          {/* Header */}
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
                fontSize: 18,
                fontWeight: "700",
                color: colors.foreground,
              }}
            >
              投稿を作成
            </Text>
            <Pressable onPress={onClose} disabled={isLoading}>
              <IconSymbol name="xmark" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView>
            {/* Focus Time Chip */}
            <View
              style={{
                backgroundColor: `${colors.primary}20`,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 8,
                alignSelf: "flex-start",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.primary,
                }}
              >
                🎯 {focusTimeStr}
              </Text>
            </View>

            {/* Message Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                  marginBottom: 8,
                }}
              >
                メッセージ
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  color: colors.foreground,
                  fontSize: 16,
                  minHeight: 100,
                  textAlignVertical: "top",
                }}
                placeholder="今日の頑張りを共有しましょう..."
                placeholderTextColor={colors.muted}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={280}
                editable={!isLoading}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginTop: 4,
                  textAlign: "right",
                }}
              >
                {message.length}/280
              </Text>
            </View>

            {/* Suggestion Chips */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: colors.muted,
                  marginBottom: 8,
                }}
              >
                テンプレート
              </Text>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {[
                  "今日も頑張った💪",
                  "集中力MAX🔥",
                  "目標達成🎯",
                  "朝活成功🌅",
                ].map((template) => (
                  <Pressable
                    key={template}
                    onPress={() => setMessage(template)}
                    disabled={isLoading}
                    style={{
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.primary,
                        fontWeight: "500",
                      }}
                    >
                      {template}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            <Pressable
              onPress={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                キャンセル
              </Text>
            </Pressable>

            <Pressable
              onPress={handlePost}
              disabled={isLoading || !message.trim()}
              style={{
                flex: 1,
                backgroundColor: message.trim() ? colors.primary : colors.border,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.background,
                  }}
                >
                  投稿する
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
