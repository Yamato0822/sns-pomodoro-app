import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  SafeAreaView,
} from "react-native";
import { useColors } from "@/hooks/use-colors";

interface ScheduleBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (date: Date, hasTime: boolean) => void;
  initialDate?: Date;
}

export function ScheduleBottomSheet({
  visible,
  onClose,
  onApply,
  initialDate,
}: ScheduleBottomSheetProps) {
  const colors = useColors();
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate || new Date()
  );
  const [hasTime, setHasTime] = useState(false);
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const handleQuickSelect = useCallback((offset: number, label: string) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);
    setSelectedDate(date);
    setHasTime(false);
  }, []);

  const handleTodayAtTime = useCallback(() => {
    const date = new Date();
    date.setHours(selectedHour, selectedMinute, 0, 0);
    setSelectedDate(date);
    setHasTime(true);
  }, [selectedHour, selectedMinute]);

  const handleApply = useCallback(() => {
    const finalDate = new Date(selectedDate);
    if (hasTime) {
      finalDate.setHours(selectedHour, selectedMinute, 0, 0);
    } else {
      finalDate.setHours(0, 0, 0, 0);
    }
    onApply(finalDate, hasTime);
    onClose();
  }, [selectedDate, hasTime, selectedHour, selectedMinute, onApply, onClose]);

  const getDayOfWeek = (date: Date): string => {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    return days[date.getDay()];
  };

  const getNextMonday = (): Date => {
    const date = new Date();
    const day = date.getDay();
    const diff = (1 - day + 7) % 7 || 7;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const get30MinutesLater = (): Date => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    return date;
  };

  const formatDate = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = getDayOfWeek(date);
    return `${month}/${day}（${dayOfWeek}）`;
  };

  const formatTime = (hour: number, minute: number): string => {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView
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
            padding: 16,
            maxHeight: "80%",
          }}
        >
          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.foreground,
                marginBottom: 16,
              }}
            >
              予定を設定
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* クイック選択 */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors.muted,
                  marginBottom: 8,
                }}
              >
                クイック選択
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Pressable
                  onPress={() => handleQuickSelect(0, "今日")}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.foreground,
                      fontWeight: "500",
                    }}
                  >
                    今日
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleQuickSelect(1, "明日")}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.foreground,
                      fontWeight: "500",
                    }}
                  >
                    明日
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const nextMonday = getNextMonday();
                    setSelectedDate(nextMonday);
                    setHasTime(false);
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.foreground,
                      fontWeight: "500",
                    }}
                  >
                    次の月曜
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* 日付表示 */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors.muted,
                  marginBottom: 8,
                }}
              >
                選択日付
              </Text>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.primary,
                  }}
                >
                  {formatDate(selectedDate)}
                </Text>
              </View>
            </View>

            {/* 時刻設定トグル */}
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.foreground,
                  }}
                >
                  時刻を設定
                </Text>
                <Pressable
                  onPress={() => setHasTime(!hasTime)}
                  style={{
                    width: 50,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: hasTime ? colors.primary : colors.border,
                    justifyContent: "center",
                    paddingHorizontal: 2,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: colors.background,
                      marginLeft: hasTime ? 24 : 2,
                    }}
                  />
                </Pressable>
              </View>
            </View>

            {/* 時刻ピッカー */}
            {hasTime && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.muted,
                    marginBottom: 8,
                  }}
                >
                  時刻
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  {/* 時間 */}
                  <View style={{ flex: 1 }}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <Pressable
                          key={i}
                          onPress={() => setSelectedHour(i)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            backgroundColor:
                              selectedHour === i
                                ? colors.primary
                                : colors.surface,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: selectedHour === i ? "600" : "400",
                              color:
                                selectedHour === i
                                  ? colors.background
                                  : colors.foreground,
                            }}
                          >
                            {String(i).padStart(2, "0")}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    :
                  </Text>

                  {/* 分 */}
                  <View style={{ flex: 1 }}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={{
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <Pressable
                          key={i}
                          onPress={() => setSelectedMinute(i)}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            backgroundColor:
                              selectedMinute === i
                                ? colors.primary
                                : colors.surface,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: selectedMinute === i ? "600" : "400",
                              color:
                                selectedMinute === i
                                  ? colors.background
                                  : colors.foreground,
                            }}
                          >
                            {String(i).padStart(2, "0")}
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}

            {/* 適用ボタン */}
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              <Pressable
                onPress={onClose}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.foreground,
                    textAlign: "center",
                  }}
                >
                  キャンセル
                </Text>
              </Pressable>
              <Pressable
                onPress={handleApply}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.background,
                    textAlign: "center",
                  }}
                >
                  適用
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
