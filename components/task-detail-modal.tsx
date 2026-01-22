import { View, Text, Pressable, ScrollView, TextInput, Modal, SafeAreaView } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useSettings } from "@/lib/settings-context";
import { Task } from "@/lib/task-context";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskDetailModal({
  visible,
  task,
  onClose,
  onSave,
  onDelete,
}: TaskDetailModalProps) {
  const colors = useColors();
  const { settings } = useSettings();
  const fontSize = settings.fontSize === "s" ? "small" : settings.fontSize === "l" ? "large" : "medium";
  const [editedTask, setEditedTask] = useState<Task | null>(task);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  if (!editedTask) return null;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const currentDate = editedTask.dueDate || new Date();
      const newDate = new Date(currentDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setEditedTask({ ...editedTask, dueDate: newDate });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const currentDate = editedTask.dueDate || new Date();
      const newDate = new Date(currentDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setEditedTask({ ...editedTask, dueDate: newDate });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const fontSizeClass =
    fontSize === "small" ? "text-sm" : fontSize === "large" ? "text-lg" : "text-base";

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b" style={{ borderColor: colors.border }}>
            <Text className={`font-bold text-foreground ${fontSizeClass}`} style={{ color: colors.foreground }}>
              タスク詳細
            </Text>
            <Pressable
              onPress={onClose}
              className="p-2"
              style={{ opacity: 0.7 }}
            >
              <MaterialIcons name="close" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Content */}
          <View className="flex-1 p-4 gap-4">
            {/* Task Title */}
            <View className="gap-2">
              <Text className={`font-semibold text-foreground ${fontSizeClass}`} style={{ color: colors.foreground }}>
                タスク名
              </Text>
              <TextInput
                value={editedTask.title}
                onChangeText={(text) => setEditedTask({ ...editedTask, title: text })}
                placeholder="タスク名を入力"
                placeholderTextColor={colors.muted}
                className="p-3 rounded-lg border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.foreground,
                  fontSize: fontSize === "small" ? 12 : fontSize === "large" ? 16 : 14,
                }}
              />
            </View>

            {/* Description */}
            <View className="gap-2">
              <Text className={`font-semibold text-foreground ${fontSizeClass}`} style={{ color: colors.foreground }}>
                説明
              </Text>
              <TextInput
                value={editedTask.description || ""}
                onChangeText={(text) => setEditedTask({ ...editedTask, description: text })}
                placeholder="説明を入力（オプション）"
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={4}
                className="p-3 rounded-lg border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  color: colors.foreground,
                  fontSize: fontSize === "small" ? 12 : fontSize === "large" ? 16 : 14,
                  textAlignVertical: "top",
                }}
              />
            </View>

            {/* Due Date */}
            <View className="gap-2">
              <Text className={`font-semibold text-foreground ${fontSizeClass}`} style={{ color: colors.foreground }}>
                期限日
              </Text>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className="p-3 rounded-lg border flex-row items-center justify-between"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <Text className={`text-foreground ${fontSizeClass}`} style={{ color: colors.foreground }}>
                  {editedTask.dueDate ? formatDate(editedTask.dueDate) : "日付を選択"}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
              </Pressable>
            </View>

            {/* Due Time */}
            <View className="gap-2">
              <Text className={`font-semibold text-foreground ${fontSizeClass}`} style={{ color: colors.foreground }}>
                期限時刻
              </Text>
              <Pressable
                onPress={() => setShowTimePicker(true)}
                className="p-3 rounded-lg border flex-row items-center justify-between"
                style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              >
                <Text className={`text-foreground ${fontSizeClass}`} style={{ color: colors.foreground }}>
                  {editedTask.dueDate ? formatTime(editedTask.dueDate) : "時刻を選択"}
                </Text>
                <MaterialIcons name="access-time" size={20} color={colors.primary} />
              </Pressable>
            </View>

            {/* Priority */}
            <View className="gap-2">
              <Text className={`font-semibold text-foreground ${fontSizeClass}`} style={{ color: colors.foreground }}>
                優先度
              </Text>
              <View className="flex-row gap-2">
                {["low", "medium", "high"].map((priority) => (
                  <Pressable
                    key={priority}
                    onPress={() => setEditedTask({ ...editedTask, priority: priority as "low" | "medium" | "high" })}
                    className={`flex-1 py-2 rounded-lg items-center justify-center border ${
                      editedTask.priority === priority ? "bg-primary" : ""
                    }`}
                    style={{
                      borderColor: editedTask.priority === priority ? colors.primary : colors.border,
                      backgroundColor:
                        editedTask.priority === priority ? colors.primary : colors.surface,
                    }}
                  >
                    <Text
                      className={`font-semibold ${fontSizeClass}`}
                      style={{
                        color:
                          editedTask.priority === priority ? colors.background : colors.foreground,
                      }}
                    >
                      {priority === "low" ? "低" : priority === "medium" ? "中" : "高"}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Footer Buttons */}
          <View className="p-4 gap-2 border-t" style={{ borderColor: colors.border }}>
            <Pressable
              onPress={() => {
                onSave(editedTask);
                onClose();
              }}
              className="py-3 rounded-lg items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className={`font-semibold text-background ${fontSizeClass}`}>保存</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                onDelete(editedTask.id);
                onClose();
              }}
              className="py-3 rounded-lg items-center justify-center border"
              style={{ borderColor: colors.error, backgroundColor: colors.error + "20" }}
            >
              <Text className={`font-semibold text-error ${fontSizeClass}`}>削除</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              className="py-3 rounded-lg items-center justify-center"
              style={{ backgroundColor: colors.surface }}
            >
              <Text className={`font-semibold text-foreground ${fontSizeClass}`}>キャンセル</Text>
            </Pressable>
          </View>
        </ScrollView>




      </SafeAreaView>
    </Modal>
  );
}
